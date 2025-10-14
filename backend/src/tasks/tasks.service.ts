import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from './entities/task.entity';
import { DevelopersService } from '../developers/developers.service';
import { SkillsService } from '../skills/skills.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: EntityRepository<Task>,
    private readonly em: EntityManager,
    private readonly developersService: DevelopersService,
    private readonly skillsService: SkillsService,
  ) {}

  /**
   * Creates a new task with required skills
   * @param createTaskDto - Task creation data
   * @returns Promise<Task> The newly created task
   * @throws BadRequestException if skills don't exist or developer doesn't have required skills
   */
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const skills = await Promise.all(
      createTaskDto.requiredSkillIds.map((id) => this.skillsService.findOne(id)),
    );

    const task = this.taskRepository.create({
      title: createTaskDto.title,
      status: createTaskDto.status || TaskStatus.TODO,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    skills.forEach((skill) => task.requiredSkills.add(skill));

    if (createTaskDto.assignedDeveloperId) {
      const developer = await this.developersService.findOne(
        createTaskDto.assignedDeveloperId,
      );
      
      await this.validateDeveloperSkills(developer.id, createTaskDto.requiredSkillIds);
      task.assignedDeveloper = developer;
    }

    await this.em.persistAndFlush(task);
    
    return this.findOne(task.id);
  }

  /**
   * Retrieves all tasks with their required skills and assigned developer
   * @returns Promise<Task[]> Array of all tasks with populated relationships
   */
  async findAll(): Promise<Task[]> {
    return this.taskRepository.findAll({
      populate: ['requiredSkills', 'assignedDeveloper', 'assignedDeveloper.skills'],
      orderBy: { createdAt: 'DESC' },
    });
  }

  /**
   * Retrieves a single task by ID with all related data
   * @param id - The task's ID
   * @returns Promise<Task> The task with populated relationships
   * @throws NotFoundException if task is not found
   */
  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne(
      { id },
      {
        populate: ['requiredSkills', 'assignedDeveloper', 'assignedDeveloper.skills'],
      },
    );

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Updates a task's properties - update title, status, assigned developer, and required skills
   * Validates that assigned developer has all required skills
   * @param id - The task's ID
   * @param updateTaskDto - Task update data
   * @returns Promise<Task> The updated task
   * @throws NotFoundException if task or developer not found
   * @throws BadRequestException if developer doesn't have required skills
   */
  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }

    if (updateTaskDto.status !== undefined) {
      task.status = updateTaskDto.status;
    }

    if (updateTaskDto.requiredSkillIds !== undefined) {
      const skills = await Promise.all(
        updateTaskDto.requiredSkillIds.map((skillId) => 
          this.skillsService.findOne(skillId)
        ),
      );
      
      task.requiredSkills.removeAll();
      skills.forEach((skill) => task.requiredSkills.add(skill));
    }

    // get list of required skill IDs (either updated or existing)
    const requiredSkillIds = updateTaskDto.requiredSkillIds || 
      task.requiredSkills.getItems().map((skill) => skill.id);

    if (updateTaskDto.assignedDeveloperId !== undefined) {
      if (updateTaskDto.assignedDeveloperId === null) {
        task.assignedDeveloper = undefined;
      } else {
        const developer = await this.developersService.findOne(
          updateTaskDto.assignedDeveloperId,
        );
        
        await this.validateDeveloperSkills(developer.id, requiredSkillIds);
        task.assignedDeveloper = developer;
      }
    } else if (task.assignedDeveloper && updateTaskDto.requiredSkillIds) {
      // if skills are updated but developer assignment isn't changed, validate existing developer still has all required skills
      await this.validateDeveloperSkills(task.assignedDeveloper.id, requiredSkillIds);
    }

    await this.em.flush();
    
    return this.findOne(id);
  }

  /**
   * Validates that a developer has all the required skills
   * @param developerId - The developer's ID
   * @param requiredSkillIds - Array of required skill IDs
   * @throws BadRequestException if developer doesn't have all required skills
   */
  private async validateDeveloperSkills(
    developerId: number,
    requiredSkillIds: number[],
  ): Promise<void> {
    const developer = await this.developersService.findOne(developerId);
    const developerSkillIds = developer.skills.getItems().map((skill) => skill.id);

    const missingSkills = requiredSkillIds.filter(
      (skillId) => !developerSkillIds.includes(skillId),
    );

    if (missingSkills.length > 0) {
      const missingSkillNames = await Promise.all(
        missingSkills.map(async (id) => {
          const skill = await this.skillsService.findOne(id);
          return skill.name;
        }),
      );

      throw new BadRequestException(
        `Developer "${developer.name}" does not have the required skill(s): ${missingSkillNames.join(', ')}. ` +
        `Task can only be assigned to a developer with all required skills.`,
      );
    }
  }
}
