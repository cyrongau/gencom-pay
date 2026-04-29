import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';

export enum SettlementStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('merchant_settlements')
export class MerchantSettlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  reference: string;

  @Column()
  merchant_id: string;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: string;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: SettlementStatus,
    default: SettlementStatus.PENDING,
  })
  status: SettlementStatus;

  @Column({ nullable: true })
  transaction_id: string; // Ledger transaction ID

  @Column({ nullable: true })
  destination_wallet_id: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  processed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
