import { IsString, IsNotEmpty, IsArray, IsInt, IsOptional, IsEnum, ArrayMinSize } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsInt()
  @IsOptional()
  assignedDeveloperId?: number | null;

  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  requiredSkillIds?: number[];
}
