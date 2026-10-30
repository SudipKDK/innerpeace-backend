import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from '../entity/user.entity';
import { PasswordResetToken } from '../entity/password-reset-token.entity';
import { Role } from 'src/common/enum/role.enum';
import { MailService } from 'src/mail/service/mail.service';
import { RegisterUserDto } from 'src/auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(PasswordResetToken)
    private readonly pwResetRepo: Repository<PasswordResetToken>,

    private readonly mailService: MailService,
  ) {}

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async createUser(userDto: RegisterUserDto) {
    const { username, email, password } = userDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('user with this email already exists');
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      email,
      role: Role.READER,
      password: hashPassword,
    });

    const savedUser = await this.userRepository.save(user);
    const { password: _password, ...safeUserData } = savedUser;
    return safeUserData;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'password', 'role'],
    });

    if (!user || !user.password) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    const { password: _, ...result } = user;
    return result;
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['posts'],
    });

    if (!user) throw new NotFoundException(`user with uid ${id} not found`);

    const { password, ...safeUserData } = user;
    return safeUserData;
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return { message: 'If the email exists, a reset link was sent' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const tokenEntity = this.pwResetRepo.create({
      user,
      tokenHash,
      expiresAt,
      isUsed: false,
      usedAt: null,
    });

    await this.pwResetRepo.save(tokenEntity);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    await this.mailService.sendResetPassword(user.email, resetLink);

    return { message: 'If the email exists, a reset link was sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);

    const resetToken = await this.pwResetRepo.findOne({
      where: {
        tokenHash,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!resetToken) {
      throw new BadRequestException('invalid or expired token');
    }

    resetToken.user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(resetToken.user);

    resetToken.usedAt = new Date();
    resetToken.isUsed = true;
    await this.pwResetRepo.save(resetToken);

    return { message: 'Password reset successful' };
  }
}
