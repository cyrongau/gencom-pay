import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';

export enum EscrowStatus {
  LOCKED = 'LOCKED',
  RELEASED = 'RELEASED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED',
}

@Entity('escrows')
export class Escrow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Index()
  @Column({ type: 'uuid' })
  buyer_wallet_id: string;

  @Index()
  @Column({ type: 'uuid' })
  seller_wallet_id: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: string;

  @Column({ length: 10 })
  currency: string;

  @Column({ length: 50, default: 'wallet' })
  source_platform: string;

  @Column({ length: 50, default: 'wallet' })
  destination_platform: string;

  @Column({
    type: 'enum',
    enum: EscrowStatus,
    default: EscrowStatus.LOCKED,
  })
  status: EscrowStatus;

  @Column({ type: 'uuid', nullable: true })
  lock_transaction_id: string;

  @Column({ type: 'uuid', nullable: true })
  release_transaction_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
