import { IsString, IsNotEmpty, IsArray, IsInt, IsOptional, IsEnum, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../entities/task.entity';

export class CreateSubtaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsInt()
  @IsOptional()
  assignedDeveloperId?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()  // Made optional - LLM will identify if not provided
  requiredSkillIds?: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  @IsOptional()
  subtasks?: CreateSubtaskDto[];
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsInt()
  @IsOptional()
  assignedDeveloperId?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()  // Made optional - LLM will identify if not provided
  requiredSkillIds?: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  @IsOptional()
  subtasks?: CreateSubtaskDto[];
}
