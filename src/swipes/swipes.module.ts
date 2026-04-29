import { Module } from '@nestjs/common';
import { SwipesService } from './swipes.service';
import { SwipesController } from './swipes.controller';
import { PrismaModule } from '../prisma/prisma.module.js';
import { BlocksModule } from '../blocks/blocks.module.js';

@Module({
  imports: [PrismaModule, BlocksModule],
  controllers: [SwipesController],
  providers: [SwipesService],
  exports: [SwipesService],
})
export class SwipesModule {}
