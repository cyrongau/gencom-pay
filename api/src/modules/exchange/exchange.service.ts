import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from './entities/exchange-rate.entity';

@Injectable()
export class ExchangeService {
  constructor(
    @InjectRepository(ExchangeRate)
    private rateRepository: Repository<ExchangeRate>,
  ) {}

  async getRate(from: string, to: string): Promise<string> {
    if (from === to) return '1.0';

    const rate = await this.rateRepository.findOne({
      where: { from_currency: from, to_currency: to },
    });

    if (!rate) {
      // Try reverse rate
      const reverseRate = await this.rateRepository.findOne({
        where: { from_currency: to, to_currency: from },
      });

      if (reverseRate) {
        return (1 / parseFloat(reverseRate.rate)).toString();
      }

      throw new NotFoundException(`Exchange rate from ${from} to ${to} not found`);
    }

    return rate.rate;
  }

  async convert(amount: string, from: string, to: string): Promise<string> {
    const rate = await this.getRate(from, to);
    return (parseFloat(amount) * parseFloat(rate)).toString();
  }

  async updateRate(from: string, to: string, rate: string): Promise<ExchangeRate> {
    let existing = await this.rateRepository.findOne({
      where: { from_currency: from, to_currency: to },
    });

    if (!existing) {
      existing = new ExchangeRate();
      existing.from_currency = from;
      existing.to_currency = to;
    }

    existing.rate = rate;
    return this.rateRepository.save(existing);
  }

  async getAllRates(): Promise<ExchangeRate[]> {
    return this.rateRepository.find();
  }
}
