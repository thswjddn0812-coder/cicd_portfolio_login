import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './module/users/entities/user.entity';
import { EmailVerifications } from 'output/entities/EmailVerifications';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './module/users/users.module';
import { AuthModule } from './module/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { RefreshToken } from './module/auth/entities/refreshToken.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Users, EmailVerifications, RefreshToken],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
