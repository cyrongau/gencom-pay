import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';

@Entity('merchant_api_keys')
export class APIKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchant_id: string;

  @ManyToOne(() => Merchant, (merchant) => merchant.api_keys)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column()
  key_name: string;

  @Column({ unique: true })
  client_id: string;

  @Column()
  client_secret_hash: string; // Hashed secret

  @Column({ nullable: true })
  last_used_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
