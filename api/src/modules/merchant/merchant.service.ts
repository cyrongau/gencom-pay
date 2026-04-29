import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant, MerchantStatus } from './entities/merchant.entity';
import { APIKey } from './entities/api-key.entity';
import { WebhookConfig } from './entities/webhook-config.entity';
import { WebhookLog } from './entities/webhook-log.entity';
import { MerchantKYC, BusinessKYCStatus } from './entities/merchant-kyc.entity';
import { MerchantTerminal, TerminalStatus } from './entities/merchant-terminal.entity';
import { MerchantSettlement, SettlementStatus } from './entities/merchant-settlement.entity';
import { MerchantTeamMember, MerchantRole, TeamMemberStatus } from './entities/merchant-team-member.entity';
import { UserService } from '../user/user.service';
import { LedgerService } from '../ledger/ledger.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationService } from '../notification/notification.service';
import { EmailService } from '../email/email.service';
import { KYCService } from '../kyc/kyc.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(APIKey)
    private apiKeyRepository: Repository<APIKey>,
    @InjectRepository(WebhookConfig)
    private webhookRepository: Repository<WebhookConfig>,
    @InjectRepository(WebhookLog)
    private webhookLogRepository: Repository<WebhookLog>,
    @InjectRepository(MerchantKYC)
    private merchantKYCRepository: Repository<MerchantKYC>,
    @InjectRepository(MerchantTerminal)
    private terminalRepository: Repository<MerchantTerminal>,
    @InjectRepository(MerchantSettlement)
    private settlementRepository: Repository<MerchantSettlement>,
    @InjectRepository(MerchantTeamMember)
    private teamMemberRepository: Repository<MerchantTeamMember>,
    private userService: UserService,
    private ledgerService: LedgerService,
    private walletService: WalletService,
    private notificationService: NotificationService,
    private emailService: EmailService,
    private kycService: KYCService,
  ) {}

  private async validateVerifiedStatus(merchantId: string): Promise<void> {
    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant || merchant.status !== MerchantStatus.VERIFIED) {
      throw new ForbiddenException('Merchant verification required to access this feature. Please complete your KYC protocol.');
    }
  }

  async findByUserId(userId: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({ 
      where: { user_id: userId },
      relations: ['api_keys'] 
    });
    if (!merchant) {
      throw new NotFoundException('Merchant record not found');
    }
    if (!merchant.gencom_merchant_id) {
      merchant.gencom_merchant_id = `GP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await this.merchantRepository.update(merchant.id, { gencom_merchant_id: merchant.gencom_merchant_id });
    }
    return merchant;
  }

  async findById(id: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({ 
      where: { id },
      relations: ['api_keys'] 
    });
    if (!merchant) throw new NotFoundException('Merchant not found');
    if (!merchant.gencom_merchant_id) {
      merchant.gencom_merchant_id = `GP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await this.merchantRepository.update(merchant.id, { gencom_merchant_id: merchant.gencom_merchant_id });
    }
    return merchant;
  }

  async createTerminal(merchantId: string, name: string): Promise<MerchantTerminal> {
    await this.validateVerifiedStatus(merchantId);
    
    const terminal = this.terminalRepository.create({
      merchant_id: merchantId,
      name,
      terminal_id: `TERM-${Math.random().toString(36).substring(7).toUpperCase()}`,
      status: TerminalStatus.ACTIVE
    });
    return this.terminalRepository.save(terminal);
  }

  async generateApiKey(merchantId: string, label: string): Promise<{ apiKey: APIKey, secret: string }> {
    await this.validateVerifiedStatus(merchantId);
    
    const clientId = `gen_client_${crypto.randomBytes(12).toString('hex')}`;
    const clientSecret = `gen_secret_${crypto.randomBytes(24).toString('hex')}`;
    const secretHash = await bcrypt.hash(clientSecret, 10);

    const apiKey = new APIKey();
    apiKey.merchant_id = merchantId;
    apiKey.key_name = label;
    apiKey.client_id = clientId;
    apiKey.client_secret_hash = secretHash;

    const saved = await this.apiKeyRepository.save(apiKey);
    return { apiKey: saved, secret: clientSecret };
  }

  async revokeAPIKey(keyId: string): Promise<void> {
    const key = await this.apiKeyRepository.findOne({ where: { id: keyId } });
    if (!key) throw new NotFoundException('API Key not found');
    key.is_active = false;
    await this.apiKeyRepository.save(key);
  }

  async getTerminals(merchantId: string): Promise<MerchantTerminal[]> {
    return this.terminalRepository.find({ where: { merchant_id: merchantId } });
  }

  async initiateCollection(terminalId: string, amount: string, currency: string): Promise<any> {
    const terminal = await this.terminalRepository.findOne({ 
      where: { id: terminalId },
      relations: ['merchant']
    });
    if (!terminal) throw new NotFoundException('Terminal not found');

    const intentId = `pay_${crypto.randomBytes(12).toString('hex')}`;
    
    return {
      intent_id: intentId,
      merchant_id: terminal.merchant_id,
      merchant_name: terminal.merchant.business_name,
      terminal_name: terminal.name,
      amount,
      currency,
      qr_data: JSON.stringify({
        type: 'MERCHANT_PAYMENT',
        intentId,
        merchantId: terminal.merchant_id,
        gencomMerchantId: terminal.merchant.gencom_merchant_id,
        businessName: terminal.merchant.business_name,
        amount,
        currency
      })
    };
  }

  async processMerchantPayment(userId: string, intentId: string, amount: string, currency: string, merchantId: string): Promise<any> {
    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const user = await this.userService.findById(userId);
    const description = `Payment to ${merchant.business_name}`;

    const customerWallets = await this.walletService.findByUserId(userId);
    const customerWallet = customerWallets.find(w => w.currency === currency);
    if (!customerWallet) throw new NotFoundException(`No ${currency} wallet found for customer`);

    if (parseFloat(customerWallet.balance) < parseFloat(amount)) {
      throw new ConflictException('Insufficient funds in selected wallet');
    }

    const merchantWallets = await this.walletService.findByUserId(merchant.user_id);
    const merchantWallet = merchantWallets.find(w => w.currency === currency) || merchantWallets[0];

    // Execute transfer via Ledger double-entry
    const transaction = await this.ledgerService.recordDoubleEntry(
      description,
      customerWallet.id,
      merchantWallet.id,
      amount,
      currency,
      `PAYMENT_INTENT:${intentId}`,
      `IDEM_${intentId}`
    );

    // Update transaction metadata with merchant details
    transaction.metadata = {
      merchant_id: merchant.id,
      merchant_name: merchant.business_name,
      customer_id: user.id,
      customer_name: user.full_name,
      amount,
      currency,
      type: 'MERCHANT_COLLECTION'
    };
    await this.ledgerService.updateTransactionMetadata(transaction.id, transaction.metadata);

    // Trigger webhook to notify merchant
    await this.triggerWebhook(merchantId, 'payment.succeeded', {
      intent_id: intentId,
      amount,
      currency,
      customer_id: userId,
      transaction_id: transaction.id
    });

    // Send Merchant Activity Notification
    await this.notificationService.create(
      merchant.user_id,
      'Payment Received',
      `You have received ${amount} ${currency} at your terminal. Protocol: ${transaction.id}`,
      'SYSTEM' as any,
      '/merchant/settlements'
    );

    return transaction;
  }

  async submitBusinessKYC(merchantId: string, data: any): Promise<MerchantKYC> {
    let kyc = await this.merchantKYCRepository.findOne({ where: { merchant_id: merchantId } });
    if (!kyc) {
      kyc = new MerchantKYC();
      kyc.merchant_id = merchantId;
    }

    Object.assign(kyc, data);
    kyc.status = BusinessKYCStatus.PENDING;
    return this.merchantKYCRepository.save(kyc);
  }

  async getBusinessKYC(merchantId: string): Promise<MerchantKYC | null> {
    return this.merchantKYCRepository.findOne({ where: { merchant_id: merchantId } });
  }

  async getMerchantKYCList(query: { page?: number; limit?: number; status?: BusinessKYCStatus; search?: string }): Promise<{ items: MerchantKYC[]; total: number }> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this.merchantKYCRepository.createQueryBuilder('kyc');
    
    // Always join merchant for detailed info if needed
    qb.leftJoinAndSelect('kyc.merchant', 'merchant');

    if (query.status && query.status.trim() !== '') {
      qb.andWhere('kyc.status = :status', { status: query.status });
    }

    if (query.search && query.search.trim() !== '') {
      const searchTerm = `%${query.search.trim()}%`;
      qb.andWhere('(kyc.legal_business_name ILIKE :search OR kyc.merchant_id::text ILIKE :search)', { search: searchTerm });
    }

    qb.orderBy('kyc.created_at', 'DESC');
    qb.skip(skip);
    qb.take(limit);

    console.log(`[MerchantService] Querying KYC list with:`, { status: query.status, search: query.search, skip, limit });
    const [items, total] = await qb.getManyAndCount();
    console.log(`[MerchantService] Found ${items.length} records. Total count: ${total}`);
    
    return { items, total };
  }

  async saveWebhookConfig(merchantId: string, url: string, events: string[]): Promise<WebhookConfig> {
    let config = await this.webhookRepository.findOne({ where: { merchant_id: merchantId } });
    if (!config) {
      config = new WebhookConfig();
      config.merchant_id = merchantId;
      config.secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    }
    config.url = url;
    config.enabled_events = events;
    return this.webhookRepository.save(config);
  }

  async getWebhookConfig(merchantId: string): Promise<WebhookConfig | null> {
    return this.webhookRepository.findOne({ where: { merchant_id: merchantId } });
  }

  async triggerWebhook(merchantId: string, eventType: string, payload: any): Promise<void> {
    const config = await this.webhookRepository.findOne({ where: { merchant_id: merchantId, is_active: true } });
    if (!config || !config.enabled_events.includes(eventType)) return;

    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac('sha256', config.secret)
      .update(`${timestamp}.${JSON.stringify(payload)}`)
      .digest('hex');

    const log = new WebhookLog();
    log.merchant_id = merchantId;
    log.event_type = eventType;
    log.payload = payload;

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Generex-Signature': signature,
          'X-Generex-Timestamp': timestamp,
        },
        body: JSON.stringify(payload),
      });

      log.response_status = response.status;
      log.response_body = await response.text();
      log.delivery_status = response.ok ? 'SUCCESS' : 'FAILED';
    } catch (err: any) {
      log.delivery_status = 'FAILED';
      log.response_body = err.message;
    }

    await this.webhookLogRepository.save(log);
  }

  async getPendingKYC(): Promise<MerchantKYC[]> {
    return this.merchantKYCRepository.find({
      where: { status: BusinessKYCStatus.PENDING },
      relations: ['merchant'],
    });
  }

  async processKYCAction(id: string, action: 'approve' | 'reject', reason?: string): Promise<MerchantKYC> {
    const kyc = await this.merchantKYCRepository.findOne({ 
      where: { id },
      relations: ['merchant']
    });
    if (!kyc) throw new NotFoundException('KYC record not found');

    if (action === 'approve') {
      kyc.status = BusinessKYCStatus.VERIFIED;
      const merchant = await this.merchantRepository.findOne({ where: { id: kyc.merchant_id } });
      if (merchant) {
        merchant.status = MerchantStatus.VERIFIED;
        await this.merchantRepository.save(merchant);
      }
    } else {
      kyc.status = BusinessKYCStatus.REJECTED;
      kyc.rejection_reason = reason ?? 'Documents failed manual neural audit.';
    }

    return this.merchantKYCRepository.save(kyc);
  }

  async getSalesAnalytics(merchantId: string): Promise<any> {
    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const wallets = await this.walletService.findByUserId(merchant.user_id);
    const walletIds = wallets.map(w => w.id);

    const dailySales = await this.ledgerService.getDailyVolume(walletIds, 7);

    return {
      dailySales,
      totalVolume: dailySales.reduce((sum, day) => sum + parseFloat(day.volume), 0).toString(),
      transactionCount: dailySales.reduce((sum, day) => sum + day.count, 0),
    };
  }

  async createMerchant(userId: string, businessName: string, website?: string, businessType: string = 'INDEPENDENT'): Promise<Merchant> {
    const merchant = new Merchant();
    merchant.user_id = userId;
    merchant.business_name = businessName;
    merchant.website = website ?? null;
    merchant.status = MerchantStatus.PENDING;
    merchant.business_type = businessType as any;
    merchant.gencom_merchant_id = `GP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return this.merchantRepository.save(merchant);
  }

  async searchMerchants(query: string): Promise<Merchant[]> {
    const qb = this.merchantRepository.createQueryBuilder('merchant');
    qb.where('merchant.status = :status', { status: MerchantStatus.VERIFIED });
    qb.andWhere('(merchant.business_name ILIKE :query OR merchant.gencom_merchant_id ILIKE :query)', { 
      query: `%${query}%` 
    });
    qb.take(10);
    return qb.getMany();
  }

  async getMerchantByUserId(userId: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({ 
      where: { user_id: userId },
      relations: ['api_keys']
    });
    if (!merchant) throw new NotFoundException('Merchant profile not found');
    return merchant;
  }

  async getSettlements(userId: string): Promise<MerchantSettlement[]> {
    const merchant = await this.findByUserId(userId);
    return this.settlementRepository.find({
      where: { merchant_id: merchant.id },
      order: { created_at: 'DESC' }
    });
  }

  async getPendingBalance(userId: string): Promise<any> {
    const merchant = await this.findByUserId(userId);
    const wallets = await this.walletService.findByUserId(merchant.user_id);
    
    const wallet = wallets[0];
    return {
      balance: wallet.balance,
      currency: wallet.currency,
      pending_settlements: await this.settlementRepository.count({
        where: { merchant_id: merchant.id, status: SettlementStatus.PENDING }
      })
    };
  }

  async requestInstantSettlement(userId: string): Promise<MerchantSettlement> {
    const merchant = await this.findByUserId(userId);
    const balanceInfo = await this.getPendingBalance(userId);
    
    const amount = parseFloat(balanceInfo.balance);
    if (amount <= 0) {
      throw new ConflictException('No pending balance available for settlement');
    }

    // In a real system, we would deduct this from the user's wallet 
    // and record it as a ledger transaction to a settlement pool.
    // For this prototype, we'll create the settlement record.
    
    const settlement = this.settlementRepository.create({
      merchant_id: merchant.id,
      amount: balanceInfo.balance,
      currency: balanceInfo.currency,
      status: SettlementStatus.PENDING,
      reference: `BRDG-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
      notes: 'Instant Bridge Protocol Initiated'
    });

    return this.settlementRepository.save(settlement);
  }

  async updateProfile(userId: string, data: any): Promise<Merchant> {
    const merchant = await this.findByUserId(userId);
    Object.assign(merchant, data);
    return this.merchantRepository.save(merchant);
  }

  async updateLogo(userId: string, logoBase64: string): Promise<Merchant> {
    const merchant = await this.findByUserId(userId);
    // In a real app, you'd upload to S3/Cloudinary. For MVP, we'll store the URL or base64
    merchant.logo_url = logoBase64;
    return this.merchantRepository.save(merchant);
  }

  async getWebhookLogs(merchantId: string): Promise<WebhookLog[]> {
    return this.webhookLogRepository.find({
      where: { merchant_id: merchantId },
      order: { created_at: 'DESC' },
      take: 20
    });
  }

  async simulateWebhookEvent(merchantId: string, eventType: string): Promise<any> {
    const payloads: Record<string, any> = {
      'payment.succeeded': {
        event_id: `evt_${crypto.randomBytes(8).toString('hex')}`,
        type: 'payment.succeeded',
        data: {
          intent_id: `pay_${crypto.randomBytes(12).toString('hex')}`,
          amount: '150.00',
          currency: 'USD',
          status: 'COMPLETED'
        }
      },
      'kyc.verified': {
        event_id: `evt_${crypto.randomBytes(8).toString('hex')}`,
        type: 'kyc.verified',
        data: {
          merchant_id: merchantId,
          status: 'VERIFIED',
          timestamp: new Date()
        }
      }
    };

    const payload = payloads[eventType] || { message: 'Test Sandbox Event', timestamp: new Date() };
    await this.triggerWebhook(merchantId, eventType, payload);
    
    return { success: true, message: `Test event ${eventType} dispatched to sandbox.` };
  }

  async exportTransactions(merchantId: string): Promise<string> {
    const branding = await this.kycService.getSettings(['APP_NAME']);
    const appName = branding.APP_NAME || 'Gencom Pay';

    const wallets = await this.walletService.findByUserId((await this.merchantRepository.findOne({ where: { id: merchantId } }))!.user_id);
    const walletIds = wallets.map(w => w.id);

    const entries = await this.ledgerService.getTransactionHistory(walletIds);
    
    const { Parser } = require('json2csv');
    const fields = ['id', 'timestamp', 'description', 'amount', 'currency', 'status'];
    const opts = { fields };
    
    const parser = new Parser(opts);
    const csv = parser.parse(entries.map(e => ({
      id: e.transaction_id,
      timestamp: e.created_at,
      description: e.transaction?.description || 'N/A',
      amount: e.amount,
      currency: e.currency,
      status: 'COMPLETED'
    })));

    return `Platform: ${appName}\nGenerated At: ${new Date().toISOString()}\n\n${csv}`;
  }

  async getTeamMembers(merchantId: string): Promise<MerchantTeamMember[]> {
    return this.teamMemberRepository.find({
      where: { merchant_id: merchantId },
      relations: ['user']
    });
  }

  async inviteTeamMember(merchantId: string, email: string, role: MerchantRole): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('Target user for invitation not found');

    const member = this.teamMemberRepository.create({
      merchant_id: merchantId,
      user_id: user.id,
      role,
      status: TeamMemberStatus.INVITED
    });
    await this.teamMemberRepository.save(member);
    
    // Fetch merchant details for branding
    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant) return;

    // 1. Send Real-time Notification
    await this.notificationService.create(
      user.id,
      'New Team Invitation',
      `You have been invited to join the ${merchant.business_name} team.`,
      'SYSTEM' as any,
      '/merchant'
    );

    // 2. Send Branded Invitation Email (White Label)
    await this.emailService.sendTeamInvite(
      user.email,
      user.full_name || 'Team Member',
      merchant.business_name,
      merchant.logo_url || '',
      role
    );
  }

  async removeTeamMember(merchantId: string, memberId: string): Promise<void> {
    const member = await this.teamMemberRepository.findOne({ where: { id: memberId, merchant_id: merchantId } });
    if (!member) throw new NotFoundException('Team member not found');
    
    await this.teamMemberRepository.remove(member);
  }

  async resendInvitation(merchantId: string, memberId: string): Promise<void> {
    const member = await this.teamMemberRepository.findOne({ 
      where: { id: memberId, merchant_id: merchantId, status: TeamMemberStatus.INVITED },
      relations: ['user']
    });
    if (!member) throw new NotFoundException('Pending invitation not found');

    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant) return;

    // Resend notification
    await this.notificationService.create(
      member.user_id,
      'Team Invitation Reminder',
      `Reminder: You have a pending invitation to join the ${merchant.business_name} team.`,
      'SYSTEM' as any,
      '/merchant'
    );

    // Resend email
    await this.emailService.sendTeamInvite(
      member.user.email,
      member.user.full_name || 'Team Member',
      merchant.business_name,
      merchant.logo_url || '',
      member.role
    );
  }

  async getUserAssociatedMerchants(userId: string): Promise<any[]> {
    const owned = await this.merchantRepository.find({ where: { user_id: userId } });
    const teamMemberships = await this.teamMemberRepository.find({
      where: { user_id: userId, status: TeamMemberStatus.ACTIVE },
      relations: ['merchant']
    });

    let results = [
      ...owned.map(m => ({ ...m, userRole: 'OWNER' })),
      ...teamMemberships.map(tm => ({ ...tm.merchant, userRole: tm.role }))
    ];

    // HQ Overwatch: If a merchant is HQ, also include its branches
    const hqMerchants = results.filter(m => m.business_type === 'HEADQUARTERS' && m.userRole === 'OWNER');
    for (const hq of hqMerchants) {
      const branches = await this.merchantRepository.find({ where: { parent_id: hq.id } });
      results = [...results, ...branches.map(b => ({ ...b, userRole: 'HQ_OVERWATCH' }))];
    }

    // Ensure every merchant has a gencom_merchant_id (self-heal legacy data)
    for (const m of results) {
      if (!m.gencom_merchant_id) {
        m.gencom_merchant_id = `GP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await this.merchantRepository.update(m.id, { gencom_merchant_id: m.gencom_merchant_id });
      }
    }

    // Remove duplicates
    const uniqueMap = new Map();
    results.forEach(m => uniqueMap.set(m.id, m));
    return Array.from(uniqueMap.values());
  }

  async getUserInvitations(userId: string): Promise<MerchantTeamMember[]> {
    return this.teamMemberRepository.find({
      where: { user_id: userId, status: TeamMemberStatus.INVITED },
      relations: ['merchant']
    });
  }

  async respondToInvite(userId: string, merchantId: string, accept: boolean): Promise<void> {
    const member = await this.teamMemberRepository.findOne({
      where: { user_id: userId, merchant_id: merchantId, status: TeamMemberStatus.INVITED }
    });
    if (!member) throw new NotFoundException('Invitation not found or already processed');

    member.status = accept ? TeamMemberStatus.ACTIVE : TeamMemberStatus.REJECTED;
    await this.teamMemberRepository.save(member);
  }

  async getAnalytics(merchantId: string): Promise<any> {
    const wallets = await this.walletService.findByUserId((await this.merchantRepository.findOne({ where: { id: merchantId } }))!.user_id);
    const walletIds = wallets.map(w => w.id);
    const history = await this.ledgerService.getTransactionHistory(walletIds);

    // Group by Day for chart
    const dailyData: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dailyData[d.toISOString().split('T')[0]] = 0;
    }

    history.forEach(tx => {
      const date = new Date(tx.created_at).toISOString().split('T')[0];
      if (dailyData[date] !== undefined) {
        dailyData[date] += parseFloat(tx.amount);
      }
    });

    const chartData = Object.entries(dailyData).map(([date, volume]) => ({
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      volume
    }));

    const totalVolume = history.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    return {
      overview: {
        totalVolume: totalVolume.toFixed(2),
        avgOrderValue: history.length ? (totalVolume / history.length).toFixed(2) : '0.00',
        transactionCount: history.length,
        successRate: history.length > 0 ? '100%' : '0%'
      },
      chartData,
      methodBreakdown: []
    };
  }

  async getTransactions(merchantId: string): Promise<any[]> {
    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const wallets = await this.walletService.findByUserId(merchant.user_id);
    const walletIds = wallets.map(w => w.id);

    return this.ledgerService.getTransactionHistory(walletIds);
  }

  async payByMerchantId(userId: string, gencomMerchantId: string, amount: string, currency: string): Promise<any> {
    const merchant = await this.merchantRepository.findOne({ where: { gencom_merchant_id: gencomMerchantId } });
    if (!merchant) throw new NotFoundException('Merchant with this ID not found');

    const intentId = `direct_${crypto.randomBytes(12).toString('hex')}`;
    return this.processMerchantPayment(userId, intentId, amount, currency, merchant.id);
  }
}
