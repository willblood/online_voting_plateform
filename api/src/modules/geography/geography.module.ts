import { Module } from '@nestjs/common';
import { GeographyController } from './geography.controller.js';

@Module({
  controllers: [GeographyController],
})
export class GeographyModule {}
