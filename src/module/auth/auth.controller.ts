import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { tokenService } from './token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: tokenService,
  ) {}

  @Post('login')
  async signIn(@Body() LoginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token } = await this.authService.signIn(LoginDto);
    res.cookie('RefreshToken', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 10 * 60 * 1000,
    });
    return { access_token };
  }
  // AuthsController 안에서
  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['RefreshToken']; // 이름 주의! 로그인 때 설정한 이름이랑 같아야 해.
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }
    // 2. 서비스 호출해서 새 Access Token 받기
    const accessToken = await this.tokenService.validateRefreshToken(refreshToken);

    // 3. 새로운 엑세스 토큰만 바디로 던져주기
    return { accessToken };
  }
}
