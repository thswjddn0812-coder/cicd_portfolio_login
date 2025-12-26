import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Users } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refreshToken.entity';
@Injectable()
export class tokenService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}
  async generateAccessToken(userId) {
    const access_token = await this.jwtService.signAsync(
      { userId },
      {
        expiresIn: '3m',
      },
    );
    return access_token;
  }
  async generateRefreshToken(userId) {
    const refreshToken = await this.jwtService.signAsync(
      { userId },
      {
        expiresIn: '10m',
      },
    );
    const hasedRefreshToken = await bcrypt.hash(refreshToken, 3);
    const target = await this.refreshTokenRepository.findOne({
      where: { userId },
    });
    if (!target) {
      await this.refreshTokenRepository.create({
        userId,
        hashedToken: hasedRefreshToken,
        expiresAt: new Date(Date.now() + 3 * 60 * 1000),
      });
    }
    await this.refreshTokenRepository.delete({ userId });
    const newToken = await this.refreshTokenRepository.create({
      userId,
      hashedToken: hasedRefreshToken,
      expiresAt: new Date(Date.now() + 3 * 60 * 1000),
    });
    await this.refreshTokenRepository.save(newToken);
    return refreshToken;
  }
  async validateAccessToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('액세스 토큰이 만료되었습니다.');
      }
      throw new UnauthorizedException('액세스 토큰이 유효하지 않습니다.');
    }
  }

  async validateRefreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const dbToken = await this.refreshTokenRepository.findOne({
        where: { userId: payload.sub },
      });
      if (!dbToken || !(await bcrypt.compare(token, dbToken.hashedToken))) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }
      return await this.generateAccessToken(payload.sub);
    } catch (e) {
      throw new UnauthorizedException('리프레쉬 토큰이 만료되었거나 유효하지 않습니다.');
    }
  }
}
