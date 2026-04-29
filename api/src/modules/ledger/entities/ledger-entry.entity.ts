import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';

export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export enum EntryStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REVERSED = 'REVERSED',
  FAILED = 'FAILED',
}

@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  transaction_id: string;

  @Index()
  @Column({ type: 'uuid' })
  account_id: string;

  @Column({
    type: 'enum',
    enum: EntryType,
  })
  entry_type: EntryType;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: string; // Stored as string to avoid precision issues with JS Numbers

  @Column({ length: 10 })
  currency: string;

  @Column({ nullable: true })
  reference: string;

  @Column({
    type: 'enum',
    enum: EntryStatus,
    default: EntryStatus.COMPLETED,
  })
  status: EntryStatus;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @ManyToOne(() => Transaction, (transaction) => transaction.entries)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;
}
