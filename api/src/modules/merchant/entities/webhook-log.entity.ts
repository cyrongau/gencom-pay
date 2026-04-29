import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('merchant_webhook_logs')
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchant_id: string;

  @Column()
  event_type: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ nullable: true })
  response_status: number;

  @Column({ type: 'text', nullable: true })
  response_body: string;

  @Column({ default: 'PENDING' })
  delivery_status: string; // PENDING, SUCCESS, FAILED

  @CreateDateColumn()
  created_at: Date;
}
