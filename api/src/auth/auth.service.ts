import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResendOtpDto } from './dto/resend-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';

const SALT_ROUNDS = 10;
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ── POST /auth/register ──────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    // 1. Uniqueness checks
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { national_id: dto.national_id },
          { email: dto.email },
          { phone_number: dto.phone_number },
        ],
      },
      select: { national_id: true, email: true, phone_number: true },
    });

    if (existing) {
      if (existing.national_id === dto.national_id) {
        throw new ConflictException('A voter with this national ID is already registered');
      }
      if (existing.email === dto.email) {
        throw new ConflictException('A voter with this email is already registered');
      }
      throw new ConflictException('A voter with this phone number is already registered');
    }

    // 2. Hash password + generate OTP
    const password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const otp = generateOtp();
    const otp_code = await bcrypt.hash(otp, SALT_ROUNDS);
    const otp_expires_at = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // 3. Create user
    await this.prisma.user.create({
      data: {
        national_id: dto.national_id,
        first_name: dto.first_name,
        last_name: dto.last_name,
        date_of_birth: new Date(dto.date_of_birth),
        phone_number: dto.phone_number,
        email: dto.email,
        password_hash,
        commune_id: dto.commune_id,
        bureau_de_vote_id: dto.bureau_de_vote_id ?? null,
        otp_code,
        otp_expires_at,
        status: 'PENDING_OTP',
        role: 'VOTER',
      },
    });

    // 4. Mock OTP: log to console + return in response for dev
    console.log(`[OTP] ${dto.phone_number}: ${otp}`);

    return {
      message: 'Registration successful. Check your phone for the OTP code.',
      national_id: dto.national_id,
      __dev_otp: otp,
    };
  }

  // ── POST /auth/verify-otp ────────────────────────────────────────────────

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { national_id: dto.national_id },
    });

    if (!user) {
      throw new NotFoundException('No voter found with this national ID');
    }

    if (user.status === 'ACTIVE') {
      throw new BadRequestException('Account is already verified');
    }

    if (user.status === 'SUSPENDED') {
      throw new BadRequestException('Account is suspended');
    }

    if (user.otp_attempts >= OTP_MAX_ATTEMPTS) {
      throw new HttpException(
        'Too many failed attempts. Use /auth/resend-otp to get a new code.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!user.otp_expires_at || user.otp_expires_at < new Date()) {
      throw new BadRequestException('OTP has expired. Use /auth/resend-otp to get a new code.');
    }

    // Increment attempt counter before validating (prevents timing-based enumeration)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp_attempts: { increment: 1 } },
    });

    const valid = await bcrypt.compare(dto.otp_code, user.otp_code ?? '');
    if (!valid) {
      throw new BadRequestException('Invalid OTP code');
    }

    // Activate account and clear OTP fields
    const activated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'ACTIVE',
        otp_code: null,
        otp_expires_at: null,
        otp_attempts: 0,
      },
    });

    const access_token = await this.jwtService.signAsync({
      sub: activated.id,
      email: activated.email,
      role: activated.role,
    });

    return {
      access_token,
      user: {
        id: activated.id,
        email: activated.email,
        role: activated.role,
        status: activated.status,
      },
    };
  }

  // ── POST /auth/resend-otp ────────────────────────────────────────────────

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { national_id: dto.national_id },
      select: { id: true, phone_number: true, status: true },
    });

    if (!user) {
      throw new NotFoundException('No voter found with this national ID');
    }

    if (user.status !== 'PENDING_OTP') {
      throw new BadRequestException('Account does not need OTP verification');
    }

    const otp = generateOtp();
    const otp_code = await bcrypt.hash(otp, SALT_ROUNDS);
    const otp_expires_at = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp_code, otp_expires_at, otp_attempts: 0 },
    });

    console.log(`[OTP] ${user.phone_number}: ${otp}`);

    return {
      message: 'A new OTP has been sent to your phone.',
      __dev_otp: otp,
    };
  }

  // ── POST /auth/login ─────────────────────────────────────────────────────

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'PENDING_OTP') {
      throw new UnauthorizedException(
        'Account not yet verified. Please complete OTP verification first.',
      );
    }

    const valid = await bcrypt.compare(loginDto.password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  // ── GET /auth/me ─────────────────────────────────────────────────────────

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        national_id: true,
        email: true,
        first_name: true,
        last_name: true,
        date_of_birth: true,
        phone_number: true,
        role: true,
        status: true,
        created_at: true,
        commune: {
          select: {
            id: true,
            name: true,
            departement: {
              select: {
                id: true,
                name: true,
                region: {
                  select: { id: true, name: true, code: true },
                },
              },
            },
          },
        },
        bureau: {
          select: { id: true, name: true, address: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
