import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/service/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from '../dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(body: { email: string; password: string }) {
    const user = await this.usersService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async register(registerUserDto:RegisterUserDto){

        const user = await this.usersService.createUser(registerUserDto);
        return user;
  }

  login(user: { username: string; id: number; role: string }) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  forgotPassword(email: string) {
    return this.usersService.forgotPassword(email);
  }

  resetPassword(token: string, newPassword: string) {
    return this.usersService.resetPassword(token, newPassword);
  }
}
