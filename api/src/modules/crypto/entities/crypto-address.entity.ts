import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('crypto_addresses')
export class CryptoAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  currency: string; // BTC, USDT

  @Column()
  network: string; // MAINNET, ERC20, TRC20

  @Column()
  address: string;

  @Column({ nullable: true })
  memo: string; // For XRP/XLM or specific USDT setups

  @CreateDateColumn()
  created_at: Date;
}
