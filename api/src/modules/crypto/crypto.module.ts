import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoAddress } from './entities/crypto-address.entity';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { WalletModule } from '../wallet/wallet.module';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CryptoAddress]),
    WalletModule,
    LedgerModule,
  ],
  providers: [CryptoService],
  controllers: [CryptoController],
  exports: [CryptoService],
})
export class CryptoModule {}
