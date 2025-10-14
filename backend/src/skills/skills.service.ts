import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: EntityRepository<Skill>,
  ) {}

  /**
   * Retrieves all skills with their associated developers and tasks
   * @returns Promise<Skill[]> Array of all skills with populated relationships
   */
  async findAll(): Promise<Skill[]> {
    return this.skillRepository.findAll({
      populate: ['developers', 'tasks'],
      orderBy: { name: 'ASC' },
    });
  }

  /**
   * Retrieves a single skill by ID with all related data
   * @param id - The skill's ID
   * @returns Promise<Skill> The skill with populated relationships
   * @throws NotFoundException if skill is not found
   */
  async findOne(id: number): Promise<Skill> {
    const skill = await this.skillRepository.findOne(
      { id },
      {
        populate: ['developers', 'tasks'],
      },
    );

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }

    return skill;
  }
}
