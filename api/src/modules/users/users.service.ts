import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

const SALT_ROUNDS = 10;

const USER_SELECT = {
  id: true,
  national_id: true,
  email: true,
  first_name: true,
  last_name: true,
  phone_number: true,
  role: true,
  status: true,
  commune_id: true,
  bureau_de_vote_id: true,
  created_at: true,
  updated_at: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, date_of_birth, ...rest } = createUserDto;
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      return await this.prisma.user.create({
        data: {
          ...rest,
          password_hash,
          date_of_birth: new Date(date_of_birth),
          status: 'ACTIVE', // admin-created users skip OTP
        },
        select: USER_SELECT,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] ?? 'field';
        throw new ConflictException(`A user with this ${field} already exists`);
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('The provided commune_id or bureau_de_vote_id does not exist');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.user.findMany({ select: USER_SELECT });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { date_of_birth, ...rest } = updateUserDto;
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...rest,
          ...(date_of_birth ? { date_of_birth: new Date(date_of_birth) } : {}),
        },
        select: USER_SELECT,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id "${id}" not found`);
      }
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] ?? 'field';
        throw new ConflictException(`A user with this ${field} already exists`);
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('The provided commune_id does not exist');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
        select: { id: true },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id "${id}" not found`);
      }
      throw error;
    }
  }
}
