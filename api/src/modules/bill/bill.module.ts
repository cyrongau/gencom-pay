import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { BillPayment } from './entities/bill-payment.entity';
import { LedgerModule } from '../ledger/ledger.module';
import { WalletModule } from '../wallet/wallet.module';
import { MerchantModule } from '../merchant/merchant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BillPayment]),
    LedgerModule,
    WalletModule,
    MerchantModule,
  ],
  providers: [BillService],
  controllers: [BillController],
  exports: [BillService],
})
export class BillModule {}
