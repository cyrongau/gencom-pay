import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoAddress } from './entities/crypto-address.entity';
import { WalletService } from '../wallet/wallet.service';
import { LedgerService } from '../ledger/ledger.service';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  constructor(
    @InjectRepository(CryptoAddress)
    private addressRepository: Repository<CryptoAddress>,
    private walletService: WalletService,
    private ledgerService: LedgerService,
  ) {}

  async generateAddress(userId: string, currency: string, network: string): Promise<CryptoAddress> {
    const existing = await this.addressRepository.findOne({ 
      where: { user_id: userId, currency, network } 
    });
    if (existing) return existing;

    // In a real app, this would call a blockchain node or provider (BitGo/Fireblocks)
    // Mocking address generation for MVP
    const mockAddress = `0x${crypto.randomBytes(20).toString('hex')}`;
    
    const address = new CryptoAddress();
    address.user_id = userId;
    address.currency = currency;
    address.network = network;
    address.address = mockAddress;

    return this.addressRepository.save(address);
  }

  async getAddresses(userId: string): Promise<CryptoAddress[]> {
    return this.addressRepository.find({ where: { user_id: userId } });
  }

  async processMockDeposit(userId: string, currency: string, amount: string): Promise<void> {
    // 1. Find or create crypto wallet for user
    const wallet = await this.walletService.createWallet(userId, currency);
    
    // 2. Record deposit in ledger
    const systemCashAccount = '00000000-0000-0000-0000-000000000002'; // From documentation
    await this.ledgerService.recordDoubleEntry(
      `Crypto Deposit: ${currency}`,
      systemCashAccount,
      wallet.id,
      amount,
      currency,
      'CRYPTO_DEPOSIT',
      `dep_${Date.now()}`
    );
  }

  async withdraw(
    userId: string, 
    currency: string, 
    amount: string, 
    toAddress: string,
    network: string
  ): Promise<any> {
    // 1. Get user's crypto wallet
    const wallet = await this.walletService.createWallet(userId, currency);
    const balance = await this.ledgerService.getBalance(wallet.id, currency);

    if (parseFloat(balance) < parseFloat(amount)) {
      throw new ConflictException(`Insufficient ${currency} balance`);
    }

    // 2. Calculate fees (mock 0.5% + fixed network fee)
    const networkFee = currency === 'BTC' ? '0.0001' : '5'; // Mock fees
    const totalDebit = (parseFloat(amount) + parseFloat(networkFee)).toString();

    if (parseFloat(balance) < parseFloat(totalDebit)) {
      throw new ConflictException(`Insufficient balance to cover network fees`);
    }

    // 3. Record withdrawal in ledger
    const systemCashAccount = '00000000-0000-0000-0000-000000000002';
    const transaction = await this.ledgerService.recordDoubleEntry(
      `Crypto Withdrawal: ${amount} ${currency} to ${toAddress}`,
      wallet.id,
      systemCashAccount,
      amount,
      currency,
      'CRYPTO_WITHDRAWAL',
      `with_${Date.now()}`
    );

    // 4. Record fee entry
    await this.ledgerService.recordDoubleEntry(
      `Network Fee: ${currency}`,
      wallet.id,
      systemCashAccount,
      networkFee,
      currency,
      'CRYPTO_FEE',
      `fee_${Date.now()}`
    );

    return {
      transaction_id: transaction.id,
      amount,
      network_fee: networkFee,
      total_debited: totalDebit,
      recipient: toAddress,
      status: 'PROCESSING',
    };
  }
}
