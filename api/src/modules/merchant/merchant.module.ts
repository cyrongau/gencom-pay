import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from './entities/merchant.entity';
import { APIKey } from './entities/api-key.entity';
import { WebhookConfig } from './entities/webhook-config.entity';
import { WebhookLog } from './entities/webhook-log.entity';
import { MerchantKYC } from './entities/merchant-kyc.entity';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';
import { SettlementEngineService } from './settlement-engine.service';
import { UserModule } from '../user/user.module';
import { LedgerModule } from '../ledger/ledger.module';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationModule } from '../notification/notification.module';
import { EmailModule } from '../email/email.module';
import { KYCModule } from '../kyc/kyc.module';

import { MerchantTerminal } from './entities/merchant-terminal.entity';
import { MerchantSettlement } from './entities/merchant-settlement.entity';
import { MerchantTeamMember } from './entities/merchant-team-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Merchant, 
      APIKey, 
      WebhookConfig, 
      WebhookLog, 
      MerchantKYC,
      MerchantTerminal,
      MerchantSettlement,
      MerchantTeamMember
    ]),
    UserModule,
    LedgerModule,
    WalletModule,
    NotificationModule,
    EmailModule,
    KYCModule,
  ],
  providers: [MerchantService, SettlementEngineService],
  controllers: [MerchantController],
  exports: [MerchantService],
})
export class MerchantModule {}
