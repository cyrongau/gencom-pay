import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeRate])],
  providers: [ExchangeService],
  controllers: [ExchangeController],
  exports: [ExchangeService],
})
export class ExchangeModule {}
