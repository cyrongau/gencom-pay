import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Merchant } from './merchant.entity';

export enum TerminalStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum TerminalType {
  VIRTUAL = 'VIRTUAL',
  PHYSICAL = 'PHYSICAL',
}

@Entity('merchant_terminals')
export class MerchantTerminal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchant_id: string;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: TerminalType,
    default: TerminalType.VIRTUAL,
  })
  type: TerminalType;

  @Column({ unique: true })
  terminal_id: string; // Human-readable ID like TERM-001

  @Column({
    type: 'enum',
    enum: TerminalStatus,
    default: TerminalStatus.ACTIVE,
  })
  status: TerminalStatus;

  @Column({ nullable: true })
  last_heartbeat: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
