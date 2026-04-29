import { Controller, Get, Post, Body, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletService } from '../wallet/wallet.service';

@Controller('escrows')
@UseGuards(JwtAuthGuard)
export class EscrowController {
  constructor(
    private escrowService: EscrowService,
    private walletService: WalletService,
  ) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.escrowService.findAllByUser(req.user.id);
  }

  @Post()
  async create(@Request() req: any, @Body() data: { 
    amount: string, 
    currency: string, 
    description: string,
    sourcePlatform: string,
    destPlatform: string,
    buyerWalletId?: string,
    sellerWalletId?: string
  }) {
    // If buyer/seller wallets are not provided, find user's default USD wallets
    let buyerWalletId = data.buyerWalletId;
    let sellerWalletId = data.sellerWalletId;

    if (!buyerWalletId || !sellerWalletId) {
      const wallets = await this.walletService.findByUserId(req.user.id);
      const usdWallet = wallets.find(w => w.currency === 'USD') || wallets[0];
      if (!usdWallet) throw new Error('User has no wallets');
      
      buyerWalletId = buyerWalletId || usdWallet.id;
      sellerWalletId = sellerWalletId || usdWallet.id; // For bridge simulation, seller could be same or different
    }

    return this.escrowService.createEscrow(
      req.user.id,
      buyerWalletId as string,
      sellerWalletId as string,
      data.amount,
      data.currency || 'USD',
      data.description || 'Escrow Bridge',
      data.sourcePlatform,
      data.destPlatform
    );
  }

  @Post(':id/release')
  async release(@Param('id') id: string, @Request() req: any) {
    return this.escrowService.releaseEscrow(id, req.user.id);
  }

  @Post(':id/refund')
  async refund(@Param('id') id: string, @Request() req: any) {
    return this.escrowService.refundEscrow(id, req.user.id);
  }
}
