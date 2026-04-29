import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { LedgerEntry } from './ledger-entry.entity';

export enum TransactionStatus {
  INITIATED = 'INITIATED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  idempotency_key?: string;

  @Column({ length: 255 })
  description: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.INITIATED,
  })
  status: TransactionStatus;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @OneToMany(() => LedgerEntry, (entry) => entry.transaction)
  entries: LedgerEntry[];
}
