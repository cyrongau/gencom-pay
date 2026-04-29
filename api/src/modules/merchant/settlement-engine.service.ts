import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Merchant, MerchantStatus } from './entities/merchant.entity';
import { MerchantSettlement, SettlementStatus } from './entities/merchant-settlement.entity';
import { WalletService } from '../wallet/wallet.service';
import { LedgerService } from '../ledger/ledger.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SettlementEngineService {
  private readonly logger = new Logger(SettlementEngineService.name);

  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(MerchantSettlement)
    private settlementRepository: Repository<MerchantSettlement>,
    private walletService: WalletService,
    private ledgerService: LedgerService,
    private notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailySettlements() {
    this.logger.log('Initiating Midnight Merchant Settlement Batch...');
    
    // 1. Fetch all verified merchants
    const merchants = await this.merchantRepository.find({
      where: { status: MerchantStatus.VERIFIED }
    });

    for (const merchant of merchants) {
      await this.processMerchantSettlement(merchant);
    }

    this.logger.log('Midnight Settlement Batch Completed.');
  }

  async processMerchantSettlement(merchant: Merchant) {
    try {
      const wallets = await this.walletService.findByUserId(merchant.user_id);
      // For MVP, we assume the first wallet is the collection wallet
      const wallet = wallets[0];
      
      const balance = parseFloat(wallet.balance);
      if (balance <= 0) return;

      this.logger.log(`Settling ${balance} ${wallet.currency} for Merchant: ${merchant.business_name}`);

      // 2. Create Settlement Record
      let settlement = new MerchantSettlement();
      settlement.merchant_id = merchant.id;
      settlement.amount = wallet.balance;
      settlement.currency = wallet.currency;
      settlement.status = SettlementStatus.PROCESSING;
      settlement.reference = `SETTLE-${Date.now()}`;
      
      settlement = await this.settlementRepository.save(settlement);

      // 3. Execute Internal Dispersion (In a real app, this would be an external payout)
      // Here we move funds to a 'Payout Pending' state or just record the dispersion
      await this.ledgerService.recordDoubleEntry(
        `Batch Settlement: ${settlement.reference}`,
        wallet.id,
        'SYSTEM-PAYOUT-NODE', // Simulated system account
        wallet.balance,
        wallet.currency,
        `BATCH_SETTLEMENT:${settlement.id}`,
        `IDEM_SETTLE_${settlement.id}`
      );

      // 4. Update Status
      settlement.status = SettlementStatus.COMPLETED;
      settlement.processed_at = new Date();
      await this.settlementRepository.save(settlement);

      // 5. Notify Merchant
      await this.notificationService.create(
        merchant.user_id,
        'Settlement Processed',
        `Your daily collection of ${wallet.balance} ${wallet.currency} has been settled to your bank account. Protocol: ${settlement.reference}`,
        'SYSTEM' as any,
        '/merchant/settlements'
      );

    } catch (err) {
      this.logger.error(`Settlement failed for Merchant ${merchant.id}: ${err.message}`);
    }
  }
}
