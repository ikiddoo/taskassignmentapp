import { Entity, PrimaryKey, Property, ManyToMany, Collection } from '@mikro-orm/core';
import { Developer } from '../../developers/entities/developer.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity({ tableName: 'skills' })
export class Skill {
  @PrimaryKey()
  id!: number;

  @Property({ length: 50 })
  name!: string;

  @Property({ fieldName: 'created_at' })
  createdAt: Date = new Date();

  @ManyToMany(() => Developer, (developer) => developer.skills)
  developers = new Collection<Developer>(this);

  @ManyToMany(() => Task, (task) => task.requiredSkills)
  tasks = new Collection<Task>(this);
}
