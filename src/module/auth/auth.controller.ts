import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { tokenService } from './token.service';
import { AuthGuard } from 'src/common/guard/auth-guard.guard';

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
      secure: true, // 🚩 Localhost 환경에서는 false로 설정해야 쿠키가 저장됨! (배포 시엔 true로 변경 필요)
      sameSite: 'strict',
      maxAge: 10 * 60 * 1000,
    });
    return { access_token };
  }
  // AuthsController 안에서
  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['RefreshToken']; 

    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }
    // 2. 서비스 호출해서 새 Access Token 받기
    const access_token = await this.tokenService.validateRefreshToken(refreshToken);

    // 3. 새로운 엑세스 토큰만 바디로 던져주기
    return { access_token };
  }
  @Post('validToken')
  async validToken(@Body() body: { token: string }) {
    // 1. 서비스에서는 검증만 하고 날것의 데이터를 받아옴
    const payload = await this.authService.isTokenExpired(body.token);

    // 2. 여기서 형이 원하는 모양으로 '수정'해서 리턴!
    return {
      userId: payload.userId,
      // 🚩 유닉스 타임스탬프를 보기 좋게 변환
      issuedAt: new Date(payload.iat * 1000).toLocaleString(),
      expiresAt: new Date(payload.exp * 1000).toLocaleString(),
      // 추가로 남은 시간(초) 같은 것도 계산해서 줄 수 있어!
      remainingTime: Math.floor(payload.exp - Date.now() / 1000) + '초',
    };
  }
  // @Get('me') // 🚩 1. 유저 정보를 가져오는 새로운 주소
  // @UseGuards(AuthGuard) // 🚩 2. 여기가 핵심! 이 방패(가드)를 통과해야만 아래 코드가 실행됨
  // async getProfile(@Req() req: Request) {
  //   return {
  //     message: '인증 성공!',
  //     user: req.user, // 가드에서 넣어준 페이로드 정보 출력
  //   };
  // }
  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: any) {
    // 정석대로라면 아까 만든 타입 확장 쓰기!
    // 1. 가드가 req.user에 넣어준 userId를 꺼냄
    const userId = req.user.userId;

    // 2. 서비스에 요청해서 DB에서 진짜 유저 정보를 가져옴
    const user = await this.authService.profile(userId);

    // 3. 닉네임을 포함해서 프론트에 전달!
    return {
      nickname: user?.nickname,
      email: user?.email,
      profileImageUrl: user?.profileImageUrl,
    };
  }
  @Post('logout')
async logout(@Res({ passthrough: true }) res: Response) {
  // 쿠키 이름을 로그인 때 설정한 'RefreshToken'과 똑같이 적고, 만료 시간을 0으로 설정!
  res.cookie('RefreshToken', '', {
    httpOnly: true,
    secure: false, // 🚩 로그인과 동일한 설정이어야 삭제됨
    sameSite: 'strict',
    expires: new Date(0), 
  });
  return { message: '로그아웃 성공' };
}
}
