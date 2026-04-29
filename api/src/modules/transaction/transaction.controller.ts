import { Controller, Get, Post, Body, UseGuards, Param, Request } from '@nestjs/common';
import { LedgerService } from '../ledger/ledger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletService } from '../wallet/wallet.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(
    private ledgerService: LedgerService,
    private walletService: WalletService,
  ) {}

  @Get('wallet/:walletId')
  async getByWallet(@Param('walletId') walletId: string) {
    return this.ledgerService.findByWalletId(walletId);
  }

  @Get('frequent-recipients')
  async getFrequentRecipients(@Request() req: any) {
    return this.ledgerService.getFrequentRecipients(req.user.id);
  }

  @Post('deposit/simulate')
  async simulateDeposit(@Body() data: { amount: string, method: string, provider: string, currency?: string }, @Request() req: any) {
    // For simulation, find the user's matching wallet or default to primary USD
    const wallets = await this.walletService.findByUserId(req.user.id);
    if (wallets.length === 0) {
      throw new Error('No wallet found to deposit into');
    }

    const depositCurrency = data.currency || 'USD';
    const targetWallet = wallets.find(w => w.currency === depositCurrency) || wallets.find(w => w.currency === 'USD') || wallets[0];
    
    // Simulate moving funds from System Cash to user wallet
    const result = await this.ledgerService.recordDoubleEntry(
      `Deposit via ${data.method} (${data.provider}) - ${depositCurrency}`,
      '00000000-0000-0000-0000-000000000002', // System Cash Account
      targetWallet.id,
      data.amount,
      targetWallet.currency,
      `DEP-${Date.now()}`
    );

    return { status: 'success', message: 'Simulated deposit processed', transaction_id: result.id, target_wallet: targetWallet.currency };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.ledgerService.findTransactionById(id);
  }

  @Post('exchange')
  async exchange(@Body() data: { fromWalletId: string, toWalletId: string, amount: string }) {
    const toWallet = await this.walletService.getWalletById(data.toWalletId);
    return this.ledgerService.recordDoubleEntry(
      `Currency Exchange`,
      data.fromWalletId,
      data.toWalletId,
      data.amount,
      toWallet.currency,
      `EXCH-${Date.now()}`
    );
  }
}
