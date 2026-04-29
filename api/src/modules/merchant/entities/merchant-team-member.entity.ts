import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Merchant } from './merchant.entity';
import { User } from '../../user/entities/user.entity';

export enum MerchantRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DEVELOPER = 'DEVELOPER',
  VIEWER = 'VIEWER',
}

export enum TeamMemberStatus {
  INVITED = 'INVITED',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
}

@Entity('merchant_team_members')
export class MerchantTeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchant_id: string;

  @Column()
  user_id: string;

  @Column({
    type: 'enum',
    enum: MerchantRole,
    default: MerchantRole.VIEWER,
  })
  role: MerchantRole;

  @Column({
    type: 'enum',
    enum: TeamMemberStatus,
    default: TeamMemberStatus.INVITED,
  })
  status: TeamMemberStatus;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
