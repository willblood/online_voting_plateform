import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ElectionsController } from './elections.controller.js';
import { ElectionsService } from './elections.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ElectionsController],
  providers: [ElectionsService, RolesGuard],
  exports: [ElectionsService],
})
export class ElectionsModule {}
