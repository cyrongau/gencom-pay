import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, UpdateDateColumn } from 'typeorm';

export enum NotificationType {
  TRANSACTION = 'TRANSACTION',
  SECURITY = 'SECURITY',
  KYC = 'KYC',
  SYSTEM = 'SYSTEM',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'varchar', nullable: true })
  action_url: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
