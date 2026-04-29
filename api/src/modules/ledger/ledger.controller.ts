import { Controller, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LedgerService } from './ledger.service';
import { ReceiptService } from './receipt/receipt.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ledger')
@UseGuards(JwtAuthGuard)
export class LedgerController {
  constructor(
    private readonly ledgerService: LedgerService,
    private readonly receiptService: ReceiptService,
    private readonly dataSource: DataSource,
  ) {}

  @Get('transactions/:id/receipt')
  async getReceipt(@Param('id') id: string) {
    return this.receiptService.generateReceiptData(id);
  }

  @Get('my-entries')
  @UseGuards(JwtAuthGuard)
  async getMyEntries(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const wallets = await this.dataSource.getRepository('wallets').find({
      where: { user_id: req.user.id }
    });
    const walletIds = wallets.map(w => w.id);
    return this.ledgerService.getTransactionHistory(walletIds, page, limit);
  }
}
