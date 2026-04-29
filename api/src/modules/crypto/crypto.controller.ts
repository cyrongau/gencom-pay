import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('crypto')
@UseGuards(JwtAuthGuard)
export class CryptoController {
  constructor(private cryptoService: CryptoService) {}

  @Get('addresses')
  async getAddresses(@Request() req: any) {
    return this.cryptoService.getAddresses(req.user.id);
  }

  @Post('addresses')
  async generateAddress(
    @Request() req: any, 
    @Body() body: { currency: string, network: string }
  ) {
    return this.cryptoService.generateAddress(req.user.id, body.currency, body.network);
  }

  @Post('deposit/mock')
  async mockDeposit(
    @Request() req: any,
    @Body() body: { currency: string, amount: string }
  ) {
    return this.cryptoService.processMockDeposit(req.user.id, body.currency, body.amount);
  }

  @Post('withdraw')
  async withdraw(
    @Request() req: any,
    @Body() body: { currency: string, amount: string, toAddress: string, network: string }
  ) {
    return this.cryptoService.withdraw(
      req.user.id, 
      body.currency, 
      body.amount, 
      body.toAddress, 
      body.network
    );
  }
}
