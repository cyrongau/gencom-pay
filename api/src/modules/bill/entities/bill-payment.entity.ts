import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum BillProvider {
  MPESA = 'MPESA',
  ZAAD = 'ZAAD',
  EDAHAB = 'EDAHAB',
  PREMIER = 'PREMIER',
  GENCOM = 'GENCOM',
}

export enum BillType {
  PAYBILL = 'PAYBILL',
  TILL = 'TILL',
  UTILITY = 'UTILITY',
}

@Entity('bill_payments')
export class BillPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'enum', enum: BillProvider })
  provider: BillProvider;

  @Column({ type: 'enum', enum: BillType })
  bill_type: BillType;

  @Column({ length: 100 })
  merchant_id: string; // The ID from ZAAD, M-Pesa, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  account_number: string | null; // For Paybill reference numbers

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: string;

  @Column({ length: 10 })
  currency: string;

  @Column({ type: 'uuid', nullable: true })
  transaction_id: string; // Internal ledger transaction ID

  @Column({ default: 'COMPLETED' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
