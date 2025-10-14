import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { DevelopersModule } from '../developers/developers.module';
import { SkillsModule } from '../skills/skills.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Task]),
    DevelopersModule,
    SkillsModule,
    LlmModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
