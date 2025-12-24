import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("email", ["email"], { unique: true })
@Entity("users", { schema: "login" })
export class Users {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "email", unique: true, length: 255 })
  email: string;

  @Column("varchar", { name: "password", length: 255 })
  password: string;

  @Column("varchar", { name: "nickname", nullable: true, length: 50 })
  nickname: string | null;

  @Column("varchar", { name: "profile_image_url", nullable: true, length: 500 })
  profileImageUrl: string | null;

  @Column("tinyint", {
    name: "is_verified",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isVerified: boolean | null;

  @Column("varchar", { name: "verification_code", nullable: true, length: 6 })
  verificationCode: string | null;

  @Column("varchar", { name: "refresh_token", nullable: true, length: 255 })
  refreshToken: string | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("timestamp", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;
}
