import { Controller, Get, Param, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  /**
   * Retrieves all skills with their associated developers and tasks
   * @returns Promise<Skill[]>
   */
  @Get()
  async findAll(): Promise<Skill[]> {
    return this.skillsService.findAll();
  }

  /**
   * Retrieves a specific skill by ID with all related information
   * @param id - Skill ID
   * @returns Promise<Skill>
   */
  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number,
  ): Promise<Skill> {
    return this.skillsService.findOne(id);
  }
}
