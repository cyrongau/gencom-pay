import { Controller, Post, Get, Body, UseGuards, Request, Query } from '@nestjs/common';
import { BillService } from './bill.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillProvider, BillType } from './entities/bill-payment.entity';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class BillController {
  constructor(private billService: BillService) {}

  @Post('pay')
  async payBill(
    @Request() req: any,
    @Body() data: {
      provider: BillProvider;
      billType: BillType;
      merchantId: string;
      accountNumber?: string;
      amount: string;
      currency: string;
      walletId?: string;
    },
  ) {
    return this.billService.payBill(req.user.id, data);
  }

  @Get('history')
  async getHistory(@Request() req: any) {
    return this.billService.getHistory(req.user.id);
  }

  @Get('search-merchants')
  async searchMerchants(@Query('query') query: string) {
    return this.billService.searchMerchants(query);
  }
}
