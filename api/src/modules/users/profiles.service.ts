import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateProfileDto } from './dto/create-profile.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user_id: string, createProfileDto: CreateProfileDto) {
    const { first_name, last_name, date_of_birth, phone_number } = createProfileDto;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return await this.prisma.user.update({
        where: { id: user_id },
        data: {
          first_name,
          last_name,
          date_of_birth: new Date(date_of_birth),
          ...(phone_number ? { phone_number } : {}),
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          date_of_birth: true,
          phone_number: true,
          email: true,
          role: true,
          status: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update profile');
    }
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany({
        select: {
          id: true,
          first_name: true,
          last_name: true,
          date_of_birth: true,
          phone_number: true,
          email: true,
          role: true,
          status: true,
        },
      });
    } catch {
      throw new BadRequestException('Failed to fetch profiles.');
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          date_of_birth: true,
          phone_number: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (!user) {
        throw new NotFoundException('Profile not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch profile');
    }
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    const { first_name, last_name, date_of_birth, phone_number } = updateProfileDto;
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException('Profile not found');
      }

      return await this.prisma.user.update({
        where: { id },
        data: {
          ...(first_name ? { first_name } : {}),
          ...(last_name ? { last_name } : {}),
          ...(date_of_birth ? { date_of_birth: new Date(date_of_birth) } : {}),
          ...(phone_number ? { phone_number } : {}),
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          date_of_birth: true,
          phone_number: true,
          email: true,
          role: true,
          status: true,
        },
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
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException('Profile not found');
      }

      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete profile');
    }
  }
}
