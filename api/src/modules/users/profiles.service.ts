import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service.js';
import { CreateProfileDto } from './dto/create-profile.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user_id: string, createProfileDto: CreateProfileDto) {
    const { first_name, last_name, date_of_birth, phone_number, gender } = createProfileDto;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingProfile = await this.prisma.profile.findUnique({
        where: { user_id },
      });

      if (existingProfile) {
        throw new ConflictException('Profile already exists for this user');
      }

      const profile = await this.prisma.profile.create({
        data: {
          user_id,
          first_name,
          last_name,
          date_of_birth: new Date(date_of_birth),
          phone_number: phone_number || null,
          gender: gender || null,
        },
      });
      return profile;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create profile');
    }
  }

  async findAll() {
    try {
      return await this.prisma.profile.findMany();
    } catch (error) {
      throw new BadRequestException('Failed to fetch profiles.');
    }
  }

  async findOne(id: string) {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { id },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }
      return profile;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch profile');
    }
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { id },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      return await this.prisma.profile.update({
        where: { id },
        data: updateProfileDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update profile');
    }
  }

  async remove(id: string) {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { id },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      await this.prisma.profile.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete profile');
    }
  }
}
