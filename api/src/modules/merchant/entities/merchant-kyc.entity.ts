import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';

export enum BusinessKYCStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

@Entity('merchant_kyc')
export class MerchantKYC {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchant_id: string;

  @OneToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column({ nullable: true })
  legal_business_name: string;

  @Column({ nullable: true })
  business_type: string;

  @Column({ nullable: true })
  nature_of_business: string;

  @Column({ nullable: true })
  business_address: string;

  @Column({ nullable: true })
  settlement_preference: string; // e.g., 'DAILY', 'INSTANT', 'WEEKLY'

  @Column({ default: false })
  terms_accepted: boolean;

  @Column({ nullable: true })
  terms_accepted_at: Date;

  @Column({
    type: 'enum',
    enum: BusinessKYCStatus,
    default: BusinessKYCStatus.NOT_STARTED,
  })
  status: BusinessKYCStatus;

  @Column({ type: 'jsonb', nullable: true })
  documents: {
    type: 'TAX_CERTIFICATE' | 'BUSINESS_REGISTRATION' | 'BUSINESS_LICENSE' | 'OWNER_ID';
    url: string;
    verified: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  extracted_data: any;

  @Column({ nullable: true })
  rejection_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
