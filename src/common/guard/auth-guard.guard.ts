import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/module/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. 헤더에서 토큰 추출 (Authorization: Bearer <token>)
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('로그인이 필요한 서비스입니다.');
    }

    const token = authHeader.split(' ')[1];

    try {
      // 2. 우리가 만든 서비스로 검증 (만료, 위조 다 체크됨)
      const payload = await this.authService.isTokenExpired(token);

      // 3. 검증된 유저 정보를 request 객체에 담아두기 (나중에 컨트롤러에서 쓰려고!)
      request.user = payload;

      return true; // 🚩 통과!
    } catch (e) {
      // 만료됐거나 잘못된 토큰이면 여기서 바로 에러 던짐
      throw new UnauthorizedException(e.message || '인증이 만료되었습니다.');
    }
  }
}
