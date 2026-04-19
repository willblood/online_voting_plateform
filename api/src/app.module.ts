import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './database/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { ElectionsModule } from './modules/elections/elections.module.js';
import { VotingModule } from './modules/voting/voting.module.js';
import { GeographyModule } from './modules/geography/geography.module.js';
import { PartiesModule } from './modules/parties/parties.module.js';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ElectionsModule, VotingModule, GeographyModule, PartiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
