import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: { ...rest, password_hash },
        select: {
          id: true,
          national_id: true,
          email: true,
          role: true,
          municipality_id: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      });

      return user;
    } catch (error: any) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] ?? 'field';
        throw new ConflictException(`A user with this ${field} already exists`);
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('The provided municipality_id does not exist');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        national_id: true,
        email: true,
        role: true,
        municipality_id: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        national_id: true,
        email: true,
        role: true,
        municipality_id: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          national_id: true,
          email: true,
          role: true,
          municipality_id: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
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
        throw new BadRequestException('The provided municipality_id does not exist');
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
