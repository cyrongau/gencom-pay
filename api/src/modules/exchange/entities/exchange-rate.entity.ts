import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  from_currency: string;

  @Column()
  to_currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  rate: string;

  @UpdateDateColumn()
  updated_at: Date;
}
