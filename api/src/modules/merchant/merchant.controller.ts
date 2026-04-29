import { Controller, Post, Body, Get, UseGuards, Request, Param, Delete, Patch, Query, Header, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MerchantService } from './merchant.service';
import { BusinessKYCStatus } from './entities/merchant-kyc.entity';
import { MerchantRole } from './entities/merchant-team-member.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('merchant')
@UseGuards(JwtAuthGuard)
export class MerchantController {
  constructor(private merchantService: MerchantService) {}

  @Post('register')
  async register(@Request() req: any, @Body() body: { businessName: string, website?: string, businessType?: string }) {
    return this.merchantService.createMerchant(req.user.id, body.businessName, body.website, body.businessType);
  }

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.merchantService.findByUserId(req.user.id);
  }

  @Post('keys')
  async generateKey(@Request() req: any, @Body() body: { name: string }) {
    const merchant = await this.getMerchantContext(req);
    return this.merchantService.generateApiKey(merchant.id, body.name);
  }

  @Delete('keys/:id')
  async revokeKey(@Param('id') id: string) {
    return this.merchantService.revokeAPIKey(id);
  }

  @Post('webhooks')
  async saveWebhooks(@Request() req: any, @Body() body: { url: string, events: string[] }) {
    const merchant = await this.getMerchantContext(req);
    return this.merchantService.saveWebhookConfig(merchant.id, body.url, body.events);
  }

  @Get('webhooks')
  async getWebhooks(@Request() req: any) {
    const merchant = await this.merchantService.findByUserId(req.user.id);
    return this.merchantService.getWebhookConfig(merchant.id);
  }

  @Get('kyc')
  async getKYC(@Request() req: any) {
    const merchant = await this.merchantService.findByUserId(req.user.id);
    return this.merchantService.getBusinessKYC(merchant.id);
  }

  @Post('kyc')
  async submitKYC(@Request() req: any, @Body() data: any) {
    const merchant = await this.merchantService.findByUserId(req.user.id);
    return this.merchantService.submitBusinessKYC(merchant.id, data);
  }

  @Post('kyc/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/kyc',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `KYC-${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadKYCDocument(@Request() req: any, @UploadedFile() file: any) {
    const fileUrl = `/uploads/kyc/${file.filename}`;
    return { status: 'success', url: fileUrl };
  }

  @Get('terminals')
  async getTerminals(@Request() req: any) {
    const merchant = await this.getMerchantContext(req);
    return this.merchantService.getTerminals(merchant.id);
  }

  @Post('terminals')
  async createTerminal(@Request() req: any, @Body('name') name: string) {
    const merchant = await this.merchantService.findByUserId(req.user.id);
    return this.merchantService.createTerminal(merchant.id, name);
  }

  @Post('terminals/:id/collect')
  async collect(@Param('id') id: string, @Body() data: any) {
    return this.merchantService.initiateCollection(id, data.amount, data.currency);
  }

  @Post('authorize-payment')
  async authorize(@Request() req: any, @Body() body: any) {
    return this.merchantService.processMerchantPayment(
      req.user.id,
      body.intentId,
      body.amount,
      body.currency,
      body.merchantId
    );
  }

  @Get('admin/pending-kyc')
  @UseGuards(JwtAuthGuard)
  async getPendingKYC() {
    return this.merchantService.getMerchantKYCList({ status: BusinessKYCStatus.PENDING });
  }

  @Get('admin/kyc/all')
  @UseGuards(JwtAuthGuard)
  async getAllMerchantKYC(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: BusinessKYCStatus,
    @Query('search') search?: string,
  ) {
    console.log(`[Admin] Fetching all merchants: status=${status}, search=${search}, page=${page}`);
    const result = await this.merchantService.getMerchantKYCList({ 
      page: page ? Number(page) : 1, 
      limit: limit ? Number(limit) : 10, 
      status, 
      search 
    });
    console.log(`[Admin] Found ${result.items.length} merchants out of ${result.total} total`);
    return result;
  }

  @Post('admin/kyc/:id/:action')
  async processKYCAction(@Param('id') id: string, @Param('action') action: 'approve' | 'reject', @Body() body: any) {
    return this.merchantService.processKYCAction(id, action, body.reason);
  }

  @Get('settlements')
  async getSettlements(@Request() req: any) {
    return this.merchantService.getSettlements(req.user.id);
  }

  @Post('settlements/instant')
  async requestInstantSettlement(@Request() req: any) {
    return this.merchantService.requestInstantSettlement(req.user.id);
  }

  @Get('balance')
  async getBalance(@Request() req: any) {
    return this.merchantService.getPendingBalance(req.user.id);
  }

  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() data: any) {
    return this.merchantService.updateProfile(req.user.id, data);
  }

  @Post('branding/logo')
  async updateLogo(@Request() req: any, @Body() body: { logo: string }) {
    return this.merchantService.updateLogo(req.user.id, body.logo);
  }

  @Post('branding/logo/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/logos',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async updateLogoMultipart(@Request() req: any, @UploadedFile() file: any) {
    const logoUrl = `/uploads/logos/${file.filename}`;
    return this.merchantService.updateLogo(req.user.id, logoUrl);
  }

  @Get('webhooks/logs')
  async getWebhookLogs(@Request() req: any) {
    const merchant = await this.merchantService.findByUserId(req.user.id);
    return this.merchantService.getWebhookLogs(merchant.id);
  }

  @Post('webhooks/test')
  async simulateWebhook(@Request() req: any, @Body() body: { eventType: string }) {
    const merchant = await this.merchantService.findByUserId(req.user.id);
    return this.merchantService.simulateWebhookEvent(merchant.id, body.eventType);
  }

  @Get('transactions/export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=transactions.csv')
  async exportTransactions(@Request() req: any) {
    const merchant = await this.merchantService.findByUserId(req.user.id);
    return this.merchantService.exportTransactions(merchant.id);
  }

  @Get('team')
  async getTeam(@Request() req: any) {
    const merchant = await this.getMerchantContext(req);
    return this.merchantService.getTeamMembers(merchant.id);
  }

  @Post('team/invite')
  async inviteMember(@Request() req: any, @Body() body: { email: string; role: MerchantRole }) {
    const merchant = await this.merchantService.findByUserId(req.user.id);
    return this.merchantService.inviteTeamMember(merchant.id, body.email, body.role);
  }

  private async getMerchantContext(req: any): Promise<any> {
    const merchantId = req.headers['x-merchant-id'];
    if (merchantId) {
      return this.merchantService.findById(merchantId);
    }
    return this.merchantService.findByUserId(req.user.id);
  }

  @Get('analytics')
  async getAnalytics(@Request() req: any) {
    const merchant = await this.getMerchantContext(req);
    return this.merchantService.getAnalytics(merchant.id);
  }

  @Delete('team/:memberId')
  async removeTeamMember(@Request() req: any, @Param('memberId') memberId: string) {
    const merchant = await this.merchantService.findByUserId(req.user.id);
    return this.merchantService.removeTeamMember(merchant.id, memberId);
  }

  @Post('team/resend/:memberId')
  async resendInvite(@Request() req: any, @Param('memberId') memberId: string) {
    const merchant = await this.merchantService.findByUserId(req.user.id);
    return this.merchantService.resendInvitation(merchant.id, memberId);
  }

  @Post('pay-by-id')
  async payById(@Request() req: any, @Body() body: { merchantId: string; amount: string; currency: string }) {
    return this.merchantService.payByMerchantId(req.user.id, body.merchantId, body.amount, body.currency);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.merchantService.searchMerchants(query);
  }

  @Get('invites')
  async getMyInvites(@Request() req: any) {
    return this.merchantService.getUserInvitations(req.user.id);
  }

  @Post('invites/:merchantId/respond')
  async respondToInvite(@Request() req: any, @Param('merchantId') merchantId: string, @Body('accept') accept: boolean) {
    return this.merchantService.respondToInvite(req.user.id, merchantId, accept);
  }

  @Get('my-businesses')
  async getMyBusinesses(@Request() req: any) {
    return this.merchantService.getUserAssociatedMerchants(req.user.id);
  }

  @Get('transactions')
  async getTransactions(@Request() req: any) {
    const merchant = await this.getMerchantContext(req);
    return this.merchantService.getTransactions(merchant.id);
  }
}
