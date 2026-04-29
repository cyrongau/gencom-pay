import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum CardStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  CANCELLED = 'CANCELLED',
}

@Entity('virtual_cards')
export class VirtualCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ select: false, nullable: true }) // Securely handle full number
  card_number: string;

  @Column()
  last_four: string;

  @Column()
  card_holder_name: string;

  @Column()
  expiry_month: string;

  @Column()
  expiry_year: string;

  @Column({ select: false }) // Securely handle CVV
  cvv: string;

  @Column({
    type: 'enum',
    enum: CardStatus,
    default: CardStatus.ACTIVE,
  })
  status: CardStatus;

  @Column({ default: 'Visa' })
  brand: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 1000 })
  daily_limit: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 5000, nullable: true })
  monthly_limit: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
