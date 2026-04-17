import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Param,
  Post,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard.js';
import { ProfilesService } from './profiles.service.js';
import { CreateProfileDto } from './dto/create-profile.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @Get()
  findAll() {
    return this.profilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.profilesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.profilesService.remove(id);
  }
}
