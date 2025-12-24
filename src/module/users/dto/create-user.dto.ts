import { IsEmail, IsString } from "class-validator";

export class CreateUserDto {
  @IsEmail({},{message: '이메일 형식이 올바르지 않습니다.'})        
  email: string;
  @IsString({message: '비밀번호는 문자열이어야 합니다.'})
  password: string;
  @IsString({message: '닉네임은 문자열이어야 합니다.'})
  nickname?: string;
}