import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hashedToken: string; // 보안을 위해 해싱해서 저장

  @Column({ default: false })
  isRevoked: boolean; // 토큰 폐기 여부 (강제 로그아웃 시 true)

  @Column()
  expiresAt: Date; // 만료 시간

  @Column()
  userId: number; // FK로 쓰일 컬럼

  @ManyToOne(() => Users, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;
}
