import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { APIKey } from './api-key.entity';

export enum MerchantStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  SUSPENDED = 'SUSPENDED',
}

export enum BusinessType {
  HEADQUARTERS = 'HEADQUARTERS',
  BRANCH = 'BRANCH',
  INDEPENDENT = 'INDEPENDENT',
}

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  gencom_merchant_id: string;

  @Column({ nullable: true })
  parent_id: string;

  @Column({
    type: 'enum',
    enum: BusinessType,
    default: BusinessType.INDEPENDENT,
  })
  business_type: BusinessType;

  @Column()
  user_id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  business_name: string;

  @Column({ nullable: true })
  tax_id: string;

  @Column({ type: 'text', nullable: true })
  website: string | null;

  @Column({
    type: 'enum',
    enum: MerchantStatus,
    default: MerchantStatus.PENDING,
  })
  status: MerchantStatus;

  @OneToMany(() => APIKey, (key) => key.merchant)
  api_keys: APIKey[];

  @Column({ nullable: true })
  logo_url: string;

  @Column({ default: '#16C66E' })
  branding_color: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  business_metadata: any;
}
