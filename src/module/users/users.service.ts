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
}
