import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LedgerModule } from './modules/ledger/ledger.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { EscrowModule } from './modules/escrow/escrow.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { KYCModule } from './modules/kyc/kyc.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { CryptoModule } from './modules/crypto/crypto.module';
import { CardsModule } from './modules/cards/cards.module';
import { NotificationModule } from './modules/notification/notification.module';
import { BillModule } from './modules/bill/bill.module';
import { EmailModule } from './modules/email/email.module';
import { SocketModule } from './modules/socket/socket.module';
import { PublicModule } from './modules/public/public.module';
import { SeedService } from './seed.service';
import { User } from './modules/user/entities/user.entity';
import { Wallet } from './modules/wallet/entities/wallet.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Set to false in production
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Wallet]),
    LedgerModule,
    WalletModule,
    TransactionModule,
    EscrowModule,
    UserModule,
    AuthModule,
    KYCModule,
    ExchangeModule,
    MerchantModule,
    CryptoModule,
    CardsModule,
    NotificationModule,
    BillModule,
    EmailModule,
    SocketModule,
    PublicModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
