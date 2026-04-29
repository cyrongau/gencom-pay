import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { Transaction } from './entities/transaction.entity';
import { Merchant } from '../merchant/entities/merchant.entity';
import { ReceiptService } from './receipt/receipt.service';

@Module({
  imports: [TypeOrmModule.forFeature([LedgerEntry, Transaction, Merchant])],
  providers: [LedgerService, ReceiptService],
  controllers: [LedgerController],
  exports: [LedgerService],
})
export class LedgerModule {}
