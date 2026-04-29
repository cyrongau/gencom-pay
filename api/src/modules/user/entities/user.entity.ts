import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, UpdateDateColumn, OneToMany } from 'typeorm';
import { Wallet } from '../../wallet/entities/wallet.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING_KYC = 'PENDING_KYC',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MERCHANT = 'MERCHANT',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Don't return password by default
  password: string;

  @Column()
  full_name: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_KYC,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  avatar_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  fcm_token: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];
}
