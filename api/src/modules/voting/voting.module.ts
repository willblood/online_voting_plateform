import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module.js';
import { VotingController } from './voting.controller.js';
import { VotingService } from './voting.service.js';

@Module({
  imports: [AuthModule],
  controllers: [VotingController],
  providers: [VotingService],
})
export class VotingModule {}
