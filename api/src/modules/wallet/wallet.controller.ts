import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post()
  async createWallet(@Request() req: any, @Body() body: { currency: string }) {
    return this.walletService.createWallet(req.user.id, body.currency);
  }

  @Get()
  async getMyWallets(@Request() req: any) {
    return this.walletService.findByUserId(req.user.id);
  }

  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    const balance = await this.walletService.getBalance(id);
    return { balance };
  }

  @Post('transfer')
  async transfer(
    @Request() req: any,
    @Body() body: { fromWalletId: string; toWalletId: string; amount: string; description: string; idempotencyKey?: string }
  ) {
    const wallet = await this.walletService.getWalletById(body.fromWalletId);
    if (wallet.user_id !== req.user.id) {
      throw new Error('Unauthorized wallet access');
    }
    return this.walletService.transfer(
      body.fromWalletId,
      body.toWalletId,
      body.amount,
      body.description,
      body.idempotencyKey
    );
  }

  @Post('p2p-transfer')
  async p2pTransfer(
    @Request() req: any,
    @Body() body: { recipientEmail: string; amount: string; currency: string; description: string }
  ) {
    return this.walletService.p2pTransfer(
      req.user.id,
      body.recipientEmail,
      body.amount,
      body.currency,
      body.description
    );
  }
}
