import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const { email, password, nickname } = createUserDto;
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new NotFoundException('이메일이 중복되었습니다');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.usersRepository.create({
      email,
      password: hashedPassword,
      nickname,
    });
    return this.usersRepository.save(newUser);
  }
  async findOneByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }
  async findOneById(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async uploadProfileImage(userId: number, file: Express.Multer.File) {
    const fileName = `${userId}_${Date.now()}_${file.originalname}`;

    // 1. Supabase 스토리지에 업로드
    // require를 써서 상대 경로 문제 회피하거나 상단 import 권장. 여기선 상단 import 추가가 어려우니 require 사용 고려...
    // 하지만 상단 import 추가가 best. replace_file_content는 부분 교체이므로 상단 import 추가하려면 두 번 호출해야 함.
    // 혹은 전체 파일 교체.
    // 일단 require로 해결하거나... 아니, Step Id 100에서 export 했으니 import { supabase } from '../../../supabase' 가능.

    const { supabase } = require('../../../supabase');

    const { data, error } = await supabase.storage
      .from('photo') // 버킷 이름 (사용자가 만들어야 함)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }

    // 2. 이미지 공개 URL 가져오기
    const { data: publicUrlData } = supabase.storage.from('photo').getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    // 3. DB에 URL 저장
    await this.usersRepository.update(userId, { profileImageUrl: publicUrl });

    return { profileImageUrl: publicUrl };
  }
}
