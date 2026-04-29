import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletStatus } from './entities/wallet.entity';
import { LedgerService } from '../ledger/ledger.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/entities/notification.entity';
import { UserService } from '../user/user.service';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private ledgerService: LedgerService,
    private notificationService: NotificationService,
    private userService: UserService,
    private socketGateway: SocketGateway,
  ) {}

  async createWallet(userId: string, currency: string): Promise<Wallet> {
    const existingWallet = await this.walletRepository.findOne({
      where: { user_id: userId, currency },
    });

    if (existingWallet) {
      return existingWallet;
    }

    const wallet = new Wallet();
    wallet.user_id = userId;
    wallet.currency = currency;
    wallet.status = WalletStatus.ACTIVE;

    return this.walletRepository.save(wallet);
  }

  async getWalletById(id: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ where: { id } });
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    return wallet;
  }

  async findByUserId(userId: string): Promise<any[]> {
    const wallets = await this.walletRepository.find({ where: { user_id: userId } });
    return Promise.all(wallets.map(async (w) => ({
      ...w,
      balance: await this.ledgerService.getBalance(w.id, w.currency)
    })));
  }

  async getBalance(walletId: string): Promise<string> {
    const wallet = await this.getWalletById(walletId);
    return this.ledgerService.getBalance(wallet.id, wallet.currency);
  }

  async transfer(
    fromWalletId: string,
    toWalletId: string,
    amount: string,
    description: string,
    idempotencyKey?: string,
  ) {
    const fromWallet = await this.getWalletById(fromWalletId);
    const toWallet = await this.getWalletById(toWalletId);

    if (fromWallet.currency !== toWallet.currency) {
      throw new BadRequestException(
        'Multi-currency transfer not supported in direct transfer. Use Exchange module.',
      );
    }

    // Check balance
    const currentBalance = await this.getBalance(fromWalletId);
    if (parseFloat(currentBalance) < parseFloat(amount)) {
      throw new BadRequestException('Insufficient funds');
    }

    const result = await this.ledgerService.recordDoubleEntry(
      description,
      fromWallet.id,
      toWallet.id,
      amount,
      fromWallet.currency,
      'transfer',
      idempotencyKey,
    );

    // Send notification to sender
    await this.notificationService.create(
      fromWallet.user_id,
      'Funds Sent',
      `You sent ${amount} ${fromWallet.currency} to account ${toWallet.id.slice(0, 8)}...`,
      NotificationType.TRANSACTION,
      `/transactions/${result.id}`
    );

    // Send notification to recipient
    await this.notificationService.create(
      toWallet.user_id,
      'Funds Received',
      `You received ${amount} ${toWallet.currency} from account ${fromWallet.id.slice(0, 8)}...`,
      NotificationType.TRANSACTION,
      `/transactions/${result.id}`
    );

    // Real-time updates via Socket.io
    const fromBalance = await this.getBalance(fromWallet.id);
    const toBalance = await this.getBalance(toWallet.id);

    this.socketGateway.sendToUser(fromWallet.user_id, 'balance_update', {
      walletId: fromWallet.id,
      balance: fromBalance,
      currency: fromWallet.currency
    });

    this.socketGateway.sendToUser(toWallet.user_id, 'balance_update', {
      walletId: toWallet.id,
      balance: toBalance,
      currency: toWallet.currency
    });

    this.socketGateway.sendToUser(fromWallet.user_id, 'new_transaction', result);
    this.socketGateway.sendToUser(toWallet.user_id, 'new_transaction', result);

    return result;
  }

  async p2pTransfer(
    senderUserId: string,
    recipientEmail: string,
    amount: string,
    currency: string,
    description: string
  ) {
    // 1. Resolve recipient
    const recipient = await this.userService.findByEmail(recipientEmail);
    if (!recipient) throw new NotFoundException('Recipient user not found in the Gencom network');
    if (recipient.id === senderUserId) throw new BadRequestException('Self-transfer not allowed in P2P protocol');

    // 2. Resolve wallets
    const senderWallets = await this.walletRepository.find({ where: { user_id: senderUserId, currency } });
    const recipientWallets = await this.walletRepository.find({ where: { user_id: recipient.id, currency } });

    if (senderWallets.length === 0) throw new NotFoundException(`Sender does not have a ${currency} wallet`);
    
    // Auto-create recipient wallet if it doesn't exist
    let recipientWallet = recipientWallets[0];
    if (!recipientWallet) {
      recipientWallet = await this.createWallet(recipient.id, currency);
    }

    // 3. Execute transfer
    return this.transfer(
      senderWallets[0].id,
      recipientWallet.id,
      amount,
      description || `P2P Transfer to ${recipient.full_name}`,
      `P2P_${Date.now()}`
    );
  }
}
