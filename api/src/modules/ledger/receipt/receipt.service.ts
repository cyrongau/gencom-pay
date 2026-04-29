import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Merchant } from '../../merchant/entities/merchant.entity';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
  ) {}

  async generateReceiptData(transactionId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['entries']
    });

    if (!transaction) throw new NotFoundException('Transaction record not found');

    let merchantInfo: Merchant | null = null;
    if (transaction.metadata?.merchant_id) {
      merchantInfo = await this.merchantRepository.findOne({
        where: { id: transaction.metadata.merchant_id }
      });
    }

    return {
      receipt_id: `RCP-${transaction.id.substring(0, 8).toUpperCase()}`,
      timestamp: transaction.created_at,
      description: transaction.description,
      status: transaction.status,
      amount: transaction.metadata?.amount || '0.00',
      currency: transaction.metadata?.currency || 'USD',
      merchant: merchantInfo ? {
        name: merchantInfo.business_name,
        logo: merchantInfo.logo_url,
        color: merchantInfo.branding_color,
        website: merchantInfo.website
      } : null,
      verification_url: `https://gencom-pay.io/verify/${transaction.id}`,
      network_node: 'GENCOM-PAY-MAINNET-01'
    };
  }
}
