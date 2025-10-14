import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Creates a new task with required skills
   * Validates that assigned developer (if provided) has all required skills
   * @param createTaskDto - Task creation data
   * @returns Promise<Task>
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(createTaskDto);
  }

  /**
   * Retrieves all tasks with their required skills and assigned developers
   * @returns Promise<Task[]>
   */
  @Get()
  async findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  /**
   * Retrieves a specific task by ID with all related information
   * @param id - Task ID
   * @returns Promise<Task>
   */
  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number,
  ): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  /**
   * Updates a task's properties (title, status, assigned developer, required skills)
   * Validates that assigned developer has all required skills
   * @param id - Task ID
   * @param updateTaskDto - Task update data
   * @returns Promise<Task>
   */
  @Patch(':id')
  async update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto);
  }
}
