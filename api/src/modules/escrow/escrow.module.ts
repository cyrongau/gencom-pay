import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { Escrow } from './entities/escrow.entity';
import { LedgerModule } from '../ledger/ledger.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [TypeOrmModule.forFeature([Escrow]), LedgerModule, WalletModule],
  providers: [EscrowService],
  controllers: [EscrowController],
  exports: [EscrowService],
})
export class EscrowModule {}
