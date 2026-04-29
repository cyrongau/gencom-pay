import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';

@Entity('merchant_webhook_configs')
export class WebhookConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchant_id: string;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column()
  url: string;

  @Column()
  secret: string; // Used for HMAC signing

  @Column({ type: 'jsonb', nullable: true })
  enabled_events: string[]; // e.g. ["payment.succeeded", "escrow.released"]

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
