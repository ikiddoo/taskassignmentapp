import { Entity, PrimaryKey, Property, ManyToMany, Collection, OneToMany } from '@mikro-orm/core';
import { Skill } from '../../skills/entities/skill.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity({ tableName: 'developers' })
export class Developer {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  name!: string;

  @Property({ fieldName: 'created_at' })
  createdAt: Date = new Date();

  @ManyToMany(() => Skill, (skill) => skill.developers, {
    owner: true,
    pivotTable: 'developer_skills',
    joinColumn: 'developer_id',
    inverseJoinColumn: 'skill_id',
  })
  skills = new Collection<Skill>(this);

  @OneToMany(() => Task, (task) => task.assignedDeveloper)
  assignedTasks = new Collection<Task>(this);
}
