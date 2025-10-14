import { IsString, IsNotEmpty, IsArray, IsInt, IsOptional, IsEnum, ArrayMinSize } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

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
  @ArrayMinSize(1)
  requiredSkillIds!: number[];
}
