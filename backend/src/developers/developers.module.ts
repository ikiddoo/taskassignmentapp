import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DevelopersService } from './developers.service';
import { DevelopersController } from './developers.controller';
import { Developer } from './entities/developer.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Developer])],
  controllers: [DevelopersController],
  providers: [DevelopersService],
  exports: [DevelopersService],
})
export class DevelopersModule {}
