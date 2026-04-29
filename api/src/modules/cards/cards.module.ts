import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualCard } from './entities/virtual-card.entity';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { WalletModule } from '../wallet/wallet.module';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VirtualCard]),
    WalletModule,
    LedgerModule,
  ],
  providers: [CardsService],
  controllers: [CardsController],
  exports: [CardsService],
})
export class CardsModule {}
