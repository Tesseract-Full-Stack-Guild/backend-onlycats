import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service.js';
import { LoginDto } from '../dto/login.dto.js';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private auth: AuthService) {
    super({ usernameField: 'usernameOrEmail', passwordField: 'password' });
  }

  async validate(usernameOrEmail: string, password: string) {
    const loginDto = new LoginDto();
    loginDto.usernameOrEmail = usernameOrEmail;
    loginDto.password = password;
    return this.auth.validateUser(loginDto);
  }
}
