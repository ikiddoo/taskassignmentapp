import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { CreateTaskDto, CreateSubtaskDto } from './dto/create-task.dto';
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
   * Creates a new task with required skills and optional subtasks
   * @param createTaskDto - Task creation data
   * @returns Promise<Task> The newly created task
   * @throws BadRequestException if skills don't exist or developer doesn't have required skills
   */
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = await this.createTaskRecursive(createTaskDto, null);
    await this.em.persistAndFlush(task);
    return this.findOne(task.id);
  }

  /**
   * Recursive helper to create task and its subtasks
   */
  private async createTaskRecursive(
    taskDto: CreateTaskDto | CreateSubtaskDto,
    parentTask: Task | null,
  ): Promise<Task> {
    const skills = await Promise.all(
      taskDto.requiredSkillIds.map((id) => this.skillsService.findOne(id)),
    );

    const task = this.taskRepository.create({
      title: taskDto.title,
      status: taskDto.status || TaskStatus.TODO,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentTask: parentTask || undefined,
    });

    skills.forEach((skill) => task.requiredSkills.add(skill));

    if (taskDto.assignedDeveloperId) {
      const developer = await this.developersService.findOne(
        taskDto.assignedDeveloperId,
      );
      
      await this.validateDeveloperSkills(developer.id, taskDto.requiredSkillIds);
      task.assignedDeveloper = developer;
    }

    // Create subtasks recursively
    if (taskDto.subtasks && taskDto.subtasks.length > 0) {
      for (const subtaskDto of taskDto.subtasks) {
        const subtask = await this.createTaskRecursive(subtaskDto, task);
        task.subtasks.add(subtask);
      }
    }

    return task;
  }

  /**
   * Retrieves all tasks with their required skills and assigned developer
   * @returns Promise<Task[]> Array of all tasks with populated relationships
   */
  async findAll(): Promise<Task[]> {
    return this.taskRepository.find(
      { parentTask: null }, // Only get top-level tasks
      {
        populate: [
          'requiredSkills',
          'assignedDeveloper',
          'assignedDeveloper.skills',
          'subtasks',
          'subtasks.requiredSkills',
          'subtasks.assignedDeveloper',
          'subtasks.subtasks', // Support nested subtasks
        ],
        orderBy: { createdAt: 'DESC' },
      },
    );
  }

  /**
   * Retrieves a single task by ID with all related data including subtasks
   * @param id - The task's ID
   * @returns Promise<Task> The task with populated relationships
   * @throws NotFoundException if task is not found
   */
  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne(
      { id },
      {
        populate: [
          'requiredSkills',
          'assignedDeveloper',
          'assignedDeveloper.skills',
          'subtasks',
          'subtasks.requiredSkills',
          'subtasks.assignedDeveloper',
          'subtasks.subtasks',
          'parentTask',
        ],
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
   * Validates that task can only be marked as "Done" if all subtasks are "Done"
   * @param id - The task's ID
   * @param updateTaskDto - Task update data
   * @returns Promise<Task> The updated task
   * @throws NotFoundException if task or developer not found
   * @throws BadRequestException if developer doesn't have required skills or subtasks aren't complete
   */
  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    // If trying to change status to "Done", validate all subtasks are done
    if (updateTaskDto.status === TaskStatus.DONE && task.status !== TaskStatus.DONE) {
      await this.validateAllSubtasksDone(task);
    }

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
   * Validates that all subtasks (recursively) are marked as "Done"
   * @param task - The task to validate
   * @throws BadRequestException if any subtask is not done
   */
  private async validateAllSubtasksDone(task: Task): Promise<void> {
    const subtasks = task.subtasks.getItems();
    
    if (subtasks.length === 0) {
      return; // No subtasks, validation passes
    }

    const incompleteSubtasks: string[] = [];

    for (const subtask of subtasks) {
      if (subtask.status !== TaskStatus.DONE) {
        incompleteSubtasks.push(subtask.title);
      }
      
      // Recursively check nested subtasks
      const nestedSubtasks = subtask.subtasks.getItems();
      if (nestedSubtasks.length > 0) {
        try {
          await this.validateAllSubtasksDone(subtask);
        } catch (error) {
          // If nested subtask validation fails, add to incomplete list
          if (error instanceof BadRequestException) {
            incompleteSubtasks.push(`${subtask.title} (has incomplete subtasks)`);
          }
        }
      }
    }

    if (incompleteSubtasks.length > 0) {
      throw new BadRequestException(
        `Cannot mark task as "Done". The following subtask(s) must be completed first:\n- ${incompleteSubtasks.join('\n- ')}`,
      );
    }
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
