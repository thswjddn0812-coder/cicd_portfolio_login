import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseFormatInterceptor } from './common/interceptor/response-format.interceptor';
import { AllExceptionFilter } from './common/filter/all-exception.filter';
import cookieParser from 'cookie-parser';
import { corsConfig } from './configs/cors.config';
import { validationConfig } from './configs/validation.config';
import { AuthGuard } from './common/guard/auth-guard.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors(corsConfig);
  app.useGlobalPipes(new ValidationPipe(validationConfig));
  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  app.useGlobalFilters(new AllExceptionFilter());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
