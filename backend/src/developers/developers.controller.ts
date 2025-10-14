import { Controller, Get, Param, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { DevelopersService } from './developers.service';
import { Developer } from './entities/developer.entity';

@Controller('developers')
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  /**
   * Retrieves all developers with their skills and assigned tasks
   * @returns Promise<Developer[]>
   */
  @Get()
  async findAll(): Promise<Developer[]> {
    return this.developersService.findAll();
  }

  /**
   * Retrieves a specific developer by ID with all related information
   * @param id - Developer ID
   * @returns Promise<Developer>
   */
  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: number,
  ): Promise<Developer> {
    return this.developersService.findOne(id);
  }
}
