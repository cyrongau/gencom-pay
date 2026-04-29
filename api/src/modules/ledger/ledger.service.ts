import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Not } from 'typeorm';
import {
  LedgerEntry,
  EntryType,
  EntryStatus,
} from './entities/ledger-entry.entity';
import { Transaction, TransactionStatus } from './entities/transaction.entity';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerEntry)
    private ledgerRepository: Repository<LedgerEntry>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async getBalance(accountId: string, currency: string): Promise<string> {
    const result = await this.ledgerRepository
      .createQueryBuilder('entry')
      .select(
        'SUM(CASE WHEN entry.entry_type = :credit THEN entry.amount ELSE -entry.amount END)',
        'balance',
      )
      .where('entry.account_id = :accountId', { accountId })
      .andWhere('entry.currency = :currency', { currency })
      .andWhere('entry.status = :status', { status: EntryStatus.COMPLETED })
      .setParameters({ credit: EntryType.CREDIT })
      .getRawOne<{ balance: string | null }>();

    return result?.balance || '0';
  }

  async recordDoubleEntry(
    description: string,
    debitAccount: string,
    creditAccount: string,
    amount: string,
    currency: string,
    reference: string,
    idempotencyKey?: string,
  ): Promise<Transaction> {
    if (idempotencyKey) {
      const existing = await this.transactionRepository.findOne({
        where: { idempotency_key: idempotencyKey },
      });
      if (existing) {
        return existing;
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Transaction record
      const transaction = new Transaction();
      transaction.description = description;
      transaction.idempotency_key = idempotencyKey;
      transaction.status = TransactionStatus.PROCESSING;
      await queryRunner.manager.save(transaction);

      // 2. Create Debit Entry
      const debitEntry = new LedgerEntry();
      debitEntry.transaction_id = transaction.id;
      debitEntry.account_id = debitAccount;
      debitEntry.entry_type = EntryType.DEBIT;
      debitEntry.amount = amount;
      debitEntry.currency = currency;
      debitEntry.reference = reference;
      debitEntry.status = EntryStatus.COMPLETED;
      await queryRunner.manager.save(debitEntry);

      // 3. Create Credit Entry
      const creditEntry = new LedgerEntry();
      creditEntry.transaction_id = transaction.id;
      creditEntry.account_id = creditAccount;
      creditEntry.entry_type = EntryType.CREDIT;
      creditEntry.amount = amount;
      creditEntry.currency = currency;
      creditEntry.reference = reference;
      creditEntry.status = EntryStatus.COMPLETED;
      await queryRunner.manager.save(creditEntry);

      // 4. Update Transaction Status
      transaction.status = TransactionStatus.COMPLETED;
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return transaction;
    } catch (err: unknown) {
      await queryRunner.rollbackTransaction();
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new InternalServerErrorException('Transaction failed: ' + message);
    } finally {
      await queryRunner.release();
    }
  }

  async findByWalletId(walletId: string): Promise<LedgerEntry[]> {
    return this.ledgerRepository.find({
      where: { account_id: walletId },
      relations: ['transaction'],
      order: { created_at: 'DESC' },
      take: 20,
    });
  }

  async findTransactionById(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: { id },
      relations: ['entries'],
    });
  }

  async getFrequentRecipients(userId: string): Promise<any[]> {
    // 1. Get user's wallet IDs
    const userWallets = await this.dataSource.getRepository('wallets').find({
      where: { user_id: userId }
    });
    const walletIds = userWallets.map(w => w.id);
    if (walletIds.length === 0) return [];

    // 2. Find all DEBIT entries from these wallets
    const debitEntries = await this.ledgerRepository.find({
      where: { account_id: In(walletIds), entry_type: EntryType.DEBIT },
      order: { created_at: 'DESC' },
      take: 100,
    });

    if (debitEntries.length === 0) return [];

    // 3. Find the matching CREDIT entries for those transactions
    const transactionIds = debitEntries.map(e => e.transaction_id);
    const creditEntries = await this.ledgerRepository.find({
      where: { 
        transaction_id: In(transactionIds), 
        entry_type: EntryType.CREDIT,
        account_id: Not(In(walletIds)) // Exclude self-transfers (exchange)
      },
      relations: ['transaction']
    });

    // 4. Count occurrences of each recipient wallet
    const counts: Record<string, number> = {};
    creditEntries.forEach(e => {
      counts[e.account_id] = (counts[e.account_id] || 0) + 1;
    });

    // 5. Get recipient user details
    const recipientWalletIds = Object.keys(counts);
    if (recipientWalletIds.length === 0) return [];

    const recipientWallets = await this.dataSource.getRepository('wallets').find({
      where: { id: In(recipientWalletIds) },
      relations: ['user']
    });

    return recipientWallets.map(w => ({
      wallet_id: w.id,
      user_id: w.user?.id,
      name: w.user?.full_name,
      avatar_url: w.user?.avatar_url,
      count: counts[w.id]
    })).sort((a, b) => b.count - a.count).slice(0, 5);
  }

  async getDailyVolume(walletIds: string[], days: number): Promise<any[]> {
    if (walletIds.length === 0) return [];

    const result = await this.ledgerRepository
      .createQueryBuilder('entry')
      .select('DATE(entry.created_at)', 'date')
      .addSelect('SUM(CAST(entry.amount AS DECIMAL))', 'volume')
      .addSelect('COUNT(*)', 'count')
      .where('entry.account_id IN (:...walletIds)', { walletIds })
      .andWhere('entry.entry_type = :type', { type: EntryType.CREDIT })
      .andWhere('entry.created_at >= :date', { 
        date: new Date(Date.now() - days * 24 * 60 * 60 * 1000) 
      })
      .groupBy('DATE(entry.created_at)')
      .orderBy('DATE(entry.created_at)', 'ASC')
      .getRawMany();

    return result.map(r => ({
      date: r.date,
      volume: r.volume || '0',
      count: parseInt(r.count),
    }));
  }

  async getTransactionHistory(walletIds: string[], page: number = 1, limit: number = 20): Promise<LedgerEntry[]> {
    if (walletIds.length === 0) return [];
    return this.ledgerRepository.find({
      where: { account_id: In(walletIds) },
      relations: ['transaction'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async updateTransactionMetadata(id: string, metadata: any): Promise<void> {
    await this.transactionRepository.update(id, { metadata });
  }
}
