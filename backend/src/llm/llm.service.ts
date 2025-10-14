import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not found in environment variables. LLM skill identification will be disabled.');
    } else {
      this.ai = new GoogleGenAI({ apiKey });
      this.logger.log('Gemini AI initialized successfully with model: gemini-2.5-flash');
    }
  }

  /**
   * Identify required skills for a task based on its title
   * @param taskTitle The title/description of the task
   * @param availableSkills List of available skill names from database
   * @returns Array of skill names that are required for the task
   */
  async identifySkills(taskTitle: string, availableSkills: string[]): Promise<string[]> {
    if (!this.ai) {
      this.logger.warn('LLM not initialized. Returning empty skills array.');
      return [];
    }

    if (!taskTitle || taskTitle.trim().length === 0) {
      this.logger.warn('Empty task title provided. Returning empty skills array.');
      return [];
    }

    try {
      const prompt = this.buildPrompt(taskTitle, availableSkills);
      this.logger.debug(`Sending prompt to Gemini`);

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      this.logger.debug(`Gemini response: ${text}`);

      const identifiedSkills = this.parseSkillsFromResponse(text, availableSkills);
      this.logger.log(`Identified skills for task "${taskTitle}": ${identifiedSkills.join(', ')}`);

      return identifiedSkills;
    } catch (error) {
      this.logger.error(`Error calling Gemini API: ${error.message}`, error.stack);
      return [];
    }
  }  /**
   * Build the prompt for the LLM
   */
  private buildPrompt(taskTitle: string, availableSkills: string[]): string {
    return `You are a software project task analyzer. Your job is to identify which technical skills are required to complete a given task.

        Available skills: ${availableSkills.join(', ')}

        Task description: "${taskTitle}"

        Instructions:
        1. Analyze the task description carefully
        2. Identify which of the available skills are needed to complete this task
        3. Return ONLY the skill names from the available list, separated by commas
        4. If multiple skills are needed, return all relevant ones
        5. Use exact skill names as provided in the available skills list
        6. Do not include any explanation, just the skill names

        Example responses:
        "Frontend"
        "Frontend, Backend"
        "Backend, Database"

        Required skills for the given task:`;
  }

  /**
   * Parse skill names from LLM response
   */
  private parseSkillsFromResponse(response: string, availableSkills: string[]): string[] {
    if (!response || response.trim().length === 0) {
      return [];
    }

    // Clean the response
    let cleaned = response.trim();
    
    // Remove common prefixes/suffixes
    cleaned = cleaned.replace(/^(Required skills?:?\s*)/i, '');
    cleaned = cleaned.replace(/^(The required skills? (?:are|is):?\s*)/i, '');
    cleaned = cleaned.replace(/[.!?]+$/, '');
    
    // Split by common delimiters
    const potentialSkills = cleaned
      .split(/[,;\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Match against available skills (case-insensitive)
    const matchedSkills: string[] = [];
    const availableSkillsLower = availableSkills.map(s => s.toLowerCase());

    for (const potentialSkill of potentialSkills) {
      const potentialSkillLower = potentialSkill.toLowerCase();
      
      // Find exact or partial match
      const matchIndex = availableSkillsLower.findIndex(availableSkill => 
        availableSkill === potentialSkillLower || 
        availableSkill.includes(potentialSkillLower) ||
        potentialSkillLower.includes(availableSkill)
      );

      if (matchIndex !== -1 && !matchedSkills.includes(availableSkills[matchIndex])) {
        matchedSkills.push(availableSkills[matchIndex]);
      }
    }

    return matchedSkills;
  }

  /**
   * Batch identify skills for multiple tasks
   * This is useful for processing subtasks efficiently
   */
  async identifySkillsBatch(
    tasks: Array<{ title: string }>,
    availableSkills: string[]
  ): Promise<string[][]> {
    const results: string[][] = [];
    
    for (const task of tasks) {
      const skills = await this.identifySkills(task.title, availableSkills);
      results.push(skills);
    }
    
    return results;
  }
}
