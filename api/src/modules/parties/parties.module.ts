import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { PartiesController } from './parties.controller.js';
import { PartiesService } from './parties.service.js';

@Module({
  imports: [AuthModule],
  controllers: [PartiesController],
  providers: [PartiesService, RolesGuard],
})
export class PartiesModule {}
