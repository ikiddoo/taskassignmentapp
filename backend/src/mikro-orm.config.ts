import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Developer } from './developers/entities/developer.entity';
import { Skill } from './skills/entities/skill.entity';
import { Task } from './tasks/entities/task.entity';

const config: MikroOrmModuleOptions = {
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5433,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'P@ssw0rd',
  dbName: process.env.DB_NAME || 'task_assignment',
  entities: [Developer, Skill, Task],
  debug: process.env.NODE_ENV !== 'production',
  allowGlobalContext: true,
};

export default config;
