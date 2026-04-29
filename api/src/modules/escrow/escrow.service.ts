import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Escrow, EscrowStatus } from './entities/escrow.entity';
import { LedgerService } from '../ledger/ledger.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class EscrowService {
  // In a real system, this should be in a configuration or a dedicated SystemAccounts table
  private readonly SYSTEM_ESCROW_ACCOUNT_ID =
    '00000000-0000-0000-0000-000000000001';

  constructor(
    @InjectRepository(Escrow)
    private escrowRepository: Repository<Escrow>,
    private ledgerService: LedgerService,
    private walletService: WalletService,
  ) {}

  async createEscrow(
    userId: string,
    buyerWalletId: string,
    sellerWalletId: string,
    amount: string,
    currency: string,
    description: string,
    sourcePlatform: string = 'wallet',
    destPlatform: string = 'wallet',
  ): Promise<Escrow> {
    // Check balance
    const balance = await this.walletService.getBalance(buyerWalletId);
    if (parseFloat(balance) < parseFloat(amount)) {
      throw new BadRequestException('Insufficient funds for escrow');
    }

    // 1. Record Ledger Entry: Buyer -> System Escrow
    const transaction = await this.ledgerService.recordDoubleEntry(
      `Escrow Bridge: ${description} (${sourcePlatform} -> ${destPlatform})`,
      buyerWalletId,
      this.SYSTEM_ESCROW_ACCOUNT_ID,
      amount,
      currency,
      'escrow_lock',
    );

    // 2. Create Escrow record
    const escrow = new Escrow();
    escrow.user_id = userId;
    escrow.buyer_wallet_id = buyerWalletId;
    escrow.seller_wallet_id = sellerWalletId;
    escrow.amount = amount;
    escrow.currency = currency;
    escrow.status = EscrowStatus.LOCKED;
    escrow.lock_transaction_id = transaction.id;
    escrow.source_platform = sourcePlatform;
    escrow.destination_platform = destPlatform;

    return this.escrowRepository.save(escrow);
  }

  async findAllByUser(userId: string): Promise<Escrow[]> {
    return this.escrowRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async releaseEscrow(escrowId: string, userId: string): Promise<Escrow> {
    const escrow = await this.escrowRepository.findOne({
      where: { id: escrowId, user_id: userId },
    });
    if (!escrow) {
      throw new NotFoundException(`Escrow with ID ${escrowId} not found`);
    }

    if (escrow.status !== EscrowStatus.LOCKED) {
      throw new BadRequestException(
        `Escrow cannot be released from status: ${escrow.status}`,
      );
    }

    // 1. Record Ledger Entry: System Escrow -> Seller
    const transaction = await this.ledgerService.recordDoubleEntry(
      `Escrow Release for ID: ${escrowId}`,
      this.SYSTEM_ESCROW_ACCOUNT_ID,
      escrow.seller_wallet_id,
      escrow.amount,
      escrow.currency,
      'escrow_release',
    );

    // 2. Update Escrow status
    escrow.status = EscrowStatus.RELEASED;
    escrow.release_transaction_id = transaction.id;

    return this.escrowRepository.save(escrow);
  }

  async refundEscrow(escrowId: string, userId: string): Promise<Escrow> {
    const escrow = await this.escrowRepository.findOne({
      where: { id: escrowId, user_id: userId },
    });
    if (!escrow) {
      throw new NotFoundException(`Escrow with ID ${escrowId} not found`);
    }

    if (
      escrow.status !== EscrowStatus.LOCKED &&
      escrow.status !== EscrowStatus.DISPUTED
    ) {
      throw new BadRequestException(
        `Escrow cannot be refunded from status: ${escrow.status}`,
      );
    }

    // 1. Record Ledger Entry: System Escrow -> Buyer
    const transaction = await this.ledgerService.recordDoubleEntry(
      `Escrow Refund for ID: ${escrowId}`,
      this.SYSTEM_ESCROW_ACCOUNT_ID,
      escrow.buyer_wallet_id,
      escrow.amount,
      escrow.currency,
      'escrow_refund',
    );

    // 2. Update Escrow status
    escrow.status = EscrowStatus.REFUNDED;
    escrow.release_transaction_id = transaction.id;

    return this.escrowRepository.save(escrow);
  }
}
