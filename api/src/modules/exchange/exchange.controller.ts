import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ExchangeService } from './exchange.service';

@Controller('exchange')
export class ExchangeController {
  constructor(private exchangeService: ExchangeService) {}

  @Get('rates')
  async getRates() {
    return this.exchangeService.getAllRates();
  }

  @Get('convert')
  async convert(
    @Query('amount') amount: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const result = await this.exchangeService.convert(amount, from, to);
    const rate = await this.exchangeService.getRate(from, to);
    return { amount: result, rate };
  }

  @Post('rates')
  async updateRate(@Body() body: { from: string, to: string, rate: string }) {
    return this.exchangeService.updateRate(body.from, body.to, body.rate);
  }
}
