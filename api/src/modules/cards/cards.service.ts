import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VirtualCard, CardStatus } from './entities/virtual-card.entity';
import { WalletService } from '../wallet/wallet.service';
import { LedgerService } from '../ledger/ledger.service';
import * as crypto from 'crypto';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(VirtualCard)
    private cardRepository: Repository<VirtualCard>,
    private walletService: WalletService,
    private ledgerService: LedgerService,
  ) {}

  async issueCard(userId: string, cardHolderName: string): Promise<VirtualCard> {
    console.log(`Issuing card for user ID: ${userId}`);
    const existing = await this.cardRepository.count({ where: { user_id: userId, status: CardStatus.ACTIVE } });
    if (existing >= 3) {
      throw new ConflictException('Maximum active cards reached');
    }

    const card = new VirtualCard();
    card.user_id = userId;
    card.card_holder_name = cardHolderName || 'GENEREX USER';
    
    // Generate 16 digit card number
    const prefix = '453288'; // Example BIN
    const rest = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    card.card_number = prefix + rest;
    card.last_four = card.card_number.slice(-4);
    
    card.expiry_month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    card.expiry_year = (new Date().getFullYear() + 4).toString().slice(-2);
    card.cvv = Math.floor(100 + Math.random() * 900).toString();
    card.status = CardStatus.ACTIVE;

    return this.cardRepository.save(card);
  }

  async getCards(userId: string): Promise<VirtualCard[]> {
    return this.cardRepository.find({ where: { user_id: userId } });
  }

  async toggleFreeze(cardId: string, userId: string): Promise<VirtualCard> {
    const card = await this.cardRepository.findOne({ where: { id: cardId, user_id: userId } });
    if (!card) throw new NotFoundException('Card not found');

    card.status = card.status === CardStatus.FROZEN ? CardStatus.ACTIVE : CardStatus.FROZEN;
    return this.cardRepository.save(card);
  }

  async authorizePurchase(cardId: string, amount: string, description: string): Promise<any> {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card || card.status !== CardStatus.ACTIVE) {
      throw new ConflictException('Card is inactive or frozen');
    }

    // 1. Get user's primary USD wallet
    const wallets = await this.walletService.findByUserId(card.user_id);
    const usdWallet = wallets.find(w => w.currency === 'USD');
    if (!usdWallet) throw new NotFoundException('No USD wallet found for this card');

    // 2. Check balance
    const balance = await this.ledgerService.getBalance(usdWallet.id, 'USD');
    if (parseFloat(balance) < parseFloat(amount)) {
      throw new ConflictException('Insufficient funds in primary wallet');
    }

    // 3. Record purchase in ledger
    const systemCashAccount = '00000000-0000-0000-0000-000000000002';
    await this.ledgerService.recordDoubleEntry(
      `Card Purchase: ${description} (Card ending in ${card.last_four})`,
      usdWallet.id,
      systemCashAccount,
      amount,
      'USD',
      'CARD_PURCHASE',
      `card_${Date.now()}`
    );

    return { status: 'APPROVED', amount, description };
  }

  async regenerateCVV(cardId: string, userId: string): Promise<VirtualCard> {
    const card = await this.cardRepository.findOne({ where: { id: cardId, user_id: userId } });
    if (!card) throw new NotFoundException('Card not found');
    card.cvv = Math.floor(100 + Math.random() * 900).toString();
    return this.cardRepository.save(card);
  }

  async revealCardDetails(cardId: string, userId: string): Promise<any> {
    console.log(`Attempting to reveal card ${cardId} for user ${userId}`);
    const card = await this.cardRepository.findOne({ 
      where: { id: cardId },
      select: {
        id: true,
        user_id: true,
        card_number: true,
        cvv: true,
        expiry_month: true,
        expiry_year: true
      }
    });
    
    if (!card) {
      console.log(`Card ${cardId} not found in database`);
      throw new NotFoundException('Card not found');
    }
    
    if (card.user_id !== userId) {
      console.log(`Ownership mismatch: Card owner is ${card.user_id}, but request is from ${userId}`);
      throw new ConflictException('Unauthorized card access');
    }
    
    if (!card.card_number) {
      // Fallback for older cards
      const prefix = '453288';
      const rest = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
      card.card_number = prefix + rest;
      await this.cardRepository.update(card.id, { card_number: card.card_number });
    }
    
    return card;
  }

  async updateLimits(cardId: string, userId: string, daily: string, monthly: string): Promise<VirtualCard> {
    const card = await this.cardRepository.findOne({ where: { id: cardId, user_id: userId } });
    if (!card) throw new NotFoundException('Card not found');
    card.daily_limit = daily;
    card.monthly_limit = monthly;
    return this.cardRepository.save(card);
  }

  async getCardTransactions(cardId: string, userId: string): Promise<any[]> {
    const card = await this.cardRepository.findOne({ where: { id: cardId, user_id: userId } });
    if (!card) throw new NotFoundException('Card not found');

    // Find ledger entries that mention this card ending in metadata or description
    // For MVP, we'll look for entries in the user's USD wallet with the 'CARD_PURCHASE' tag
    const wallets = await this.walletService.findByUserId(userId);
    const usdWallet = wallets.find(w => w.currency === 'USD');
    if (!usdWallet) return [];

    return this.ledgerService.findByWalletId(usdWallet.id);
  }
}
