import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { tokenService } from './token.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refreshToken.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenService: tokenService,
  ) {}
  async signIn(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new NotFoundException('이메일이나 비밀번호가 틀렸어');
    }
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new NotFoundException('이메일이나 비밀번호가 틀렸어');
    }
    const access_token = await this.tokenService.generateAccessToken(user.id);
    const refresh_token = await this.tokenService.generateRefreshToken(user.id);
    return { access_token, refresh_token };
  }
  async isTokenExpired(token:string){
    return this.tokenService.validateAccessToken(token);
  }
}
