import { Entity, PrimaryKey, Property, ManyToOne, ManyToMany, Collection, Enum } from '@mikro-orm/core';
import { Developer } from '../../developers/entities/developer.entity';
import { Skill } from '../../skills/entities/skill.entity';

export enum TaskStatus {
  TODO = 'To-do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

@Entity({ tableName: 'tasks' })
export class Task {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'text' })
  title!: string;

  @Enum(() => TaskStatus)
  status: TaskStatus = TaskStatus.TODO;

  @ManyToOne(() => Developer, { nullable: true, fieldName: 'assigned_developer_id' })
  assignedDeveloper?: Developer;

  @Property({ fieldName: 'created_at' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToMany(() => Skill, (skill) => skill.tasks, {
    owner: true,
    pivotTable: 'task_skills',
    joinColumn: 'task_id',
    inverseJoinColumn: 'skill_id',
  })
  requiredSkills = new Collection<Skill>(this);
}
