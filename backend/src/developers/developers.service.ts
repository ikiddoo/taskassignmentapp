import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Developer } from './entities/developer.entity';

@Injectable()
export class DevelopersService {
  constructor(
    @InjectRepository(Developer)
    private readonly developerRepository: EntityRepository<Developer>,
  ) {}

  /**
   * Retrieves all developers with their skills and assigned tasks
   * @returns Promise<Developer[]> Array of all developers with populated relationships
   */
  async findAll(): Promise<Developer[]> {
    return this.developerRepository.findAll({
      populate: ['skills', 'assignedTasks', 'assignedTasks.requiredSkills'],
      orderBy: { name: 'ASC' },
    });
  }

  /**
   * Retrieves a single developer by ID with all related data
   * @param id - The developer's ID
   * @returns Promise<Developer> The developer with populated relationships
   * @throws NotFoundException if developer is not found
   */
  async findOne(id: number): Promise<Developer> {
    const developer = await this.developerRepository.findOne(
      { id },
      {
        populate: ['skills', 'assignedTasks', 'assignedTasks.requiredSkills'],
      },
    );

    if (!developer) {
      throw new NotFoundException(`Developer with ID ${id} not found`);
    }

    return developer;
  }
}
