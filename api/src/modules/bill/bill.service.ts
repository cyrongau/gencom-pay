import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillPayment, BillProvider, BillType } from './entities/bill-payment.entity';
import { LedgerService } from '../ledger/ledger.service';
import { WalletService } from '../wallet/wallet.service';
import { MerchantService } from '../merchant/merchant.service';
import { Merchant } from '../merchant/entities/merchant.entity';

@Injectable()
export class BillService {
  // Account used to hold funds meant for external merchants
  private readonly BRIDGE_LIQUIDITY_ACCOUNT = '00000000-0000-0000-0000-000000000003';

  constructor(
    @InjectRepository(BillPayment)
    private billRepository: Repository<BillPayment>,
    private ledgerService: LedgerService,
    private walletService: WalletService,
    private merchantService: MerchantService,
  ) {}

  async payBill(
    userId: string,
    data: {
      provider: BillProvider;
      billType: BillType;
      merchantId: string;
      accountNumber?: string | null;
      amount: string;
      currency: string;
      walletId?: string;
    },
  ): Promise<BillPayment> {
    const { provider, billType, merchantId, accountNumber, amount, currency, walletId } = data;

    // 1. Determine which wallet to debit
    let sourceWalletId = walletId;
    if (!sourceWalletId) {
      const wallets = await this.walletService.findByUserId(userId);
      const usdWallet = wallets.find(w => w.currency === currency) || wallets[0];
      if (!usdWallet) throw new BadRequestException('No suitable wallet found for payment');
      sourceWalletId = usdWallet.id;
    }

    // 2. Check balance
    const balance = await this.walletService.getBalance(sourceWalletId as string);
    if (parseFloat(balance) < parseFloat(amount)) {
      throw new BadRequestException('Insufficient funds for bill payment');
    }

    // 3. Record in Ledger
    let targetWalletId = this.BRIDGE_LIQUIDITY_ACCOUNT;
    let description = `Pay Bill: ${provider} ${billType} - ${merchantId}${accountNumber ? ` (${accountNumber})` : ''}`;

    if (provider === BillProvider.GENCOM) {
      // Find internal merchant by their Gencom Merchant ID (GP-XXXXXX)
      const internalMerchants = await this.merchantService.searchMerchants(merchantId);
      const internalMerchant = internalMerchants.find(m => m.gencom_merchant_id === merchantId);
      
      if (!internalMerchant) {
        throw new BadRequestException('Invalid Gencom Pay Merchant ID');
      }

      // Get merchant's wallet
      const merchantWallets = await this.walletService.findByUserId(internalMerchant.user_id);
      const merchantWallet = merchantWallets.find(w => w.currency === currency) || merchantWallets[0];
      
      targetWalletId = merchantWallet.id;
      description = `Internal Payment to ${internalMerchant.business_name} (${merchantId})`;
    }

    const transaction = await this.ledgerService.recordDoubleEntry(
      description,
      sourceWalletId as string,
      targetWalletId,
      amount,
      currency,
      provider === BillProvider.GENCOM ? 'MERCHANT_PAYMENT' : 'BILL_PAYMENT',
      `EXT_${provider}_${Date.now()}`
    );

    // 4. Save Bill Payment record
    const payment = new BillPayment();
    payment.user_id = userId;
    payment.provider = provider;
    payment.bill_type = billType;
    payment.merchant_id = merchantId;
    payment.account_number = accountNumber || null;
    payment.amount = amount;
    payment.currency = currency;
    payment.transaction_id = transaction.id;
    payment.status = 'COMPLETED';

    return this.billRepository.save(payment);
  }

  async getHistory(userId: string): Promise<BillPayment[]> {
    return this.billRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async searchMerchants(query: string): Promise<Merchant[]> {
    return this.merchantService.searchMerchants(query);
  }
}
