import { Controller, Get, Post, Body, UseGuards, Request, Param, Put } from '@nestjs/common';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Get()
  async getCards(@Request() req: any) {
    return this.cardsService.getCards(req.user.id);
  }

  @Post()
  async issueCard(@Request() req: any, @Body() body: { cardHolderName: string }) {
    return this.cardsService.issueCard(req.user.id, body.cardHolderName);
  }

  @Put(':id/freeze')
  async toggleFreeze(@Param('id') id: string, @Request() req: any) {
    return this.cardsService.toggleFreeze(id, req.user.id);
  }

  @Post(':id/authorize')
  async authorize(@Param('id') id: string, @Body() body: { amount: string, description: string }) {
    return this.cardsService.authorizePurchase(id, body.amount, body.description);
  }

  @Get(':id/reveal')
  async reveal(@Param('id') id: string, @Request() req: any) {
    return this.cardsService.revealCardDetails(id, req.user.id);
  }

  @Put(':id/regenerate-cvv')
  async regenerateCVV(@Param('id') id: string, @Request() req: any) {
    return this.cardsService.regenerateCVV(id, req.user.id);
  }

  @Put(':id/limits')
  async updateLimits(@Param('id') id: string, @Request() req: any, @Body() body: { daily: string, monthly: string }) {
    return this.cardsService.updateLimits(id, req.user.id, body.daily, body.monthly);
  }

  @Get(':id/transactions')
  async getTransactions(@Param('id') id: string, @Request() req: any) {
    return this.cardsService.getCardTransactions(id, req.user.id);
  }
}
