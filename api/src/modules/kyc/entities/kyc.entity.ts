import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum KYCStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum IDType {
  PASSPORT = 'PASSPORT',
  NATIONAL_ID = 'NATIONAL_ID',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
}

@Entity('kyc_records')
export class KYCRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  id_number: string;

  @Column({
    type: 'enum',
    enum: IDType,
  })
  id_type: IDType;

  @Column({
    type: 'enum',
    enum: KYCStatus,
    default: KYCStatus.PENDING,
  })
  status: KYCStatus;

  @Column({ nullable: true })
  rejection_reason?: string;

  @Column({ type: 'jsonb', nullable: true })
  extracted_data?: any;

  @Column({ type: 'text', nullable: true })
  searchable_text?: string;

  @Column({ type: 'timestamp', nullable: true })
  verified_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  document_metadata: any;
}
