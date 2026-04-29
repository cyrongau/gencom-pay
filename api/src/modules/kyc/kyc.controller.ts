import { Controller, Post, Body, Get, UseGuards, Request, Param, Query } from '@nestjs/common';
import { KYCService } from './kyc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IDType } from './entities/kyc.entity';

@Controller('kyc')
export class KYCController {
  constructor(private kycService: KYCService) {}

  @Get('public-settings')
  async getPublicSettings() {
    const keys = [
      'APP_NAME', 'APP_DESCRIPTION', 'PRIMARY_COLOR', 'SUPPORT_EMAIL',
      'LOGO_FULL', 'LOGO_SQUARE', 'LOGO_LANDSCAPE', 'APP_ICON', 'SPLASH_ICON'
    ];
    return this.kycService.getSettings(keys);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submit(@Request() req: any, @Body() body: { idNumber: string, idType: IDType, fullName?: string, extractedData?: any, searchableText?: string }) {
    return this.kycService.submitKYC(req.user.id, body.idNumber, body.idType, body.fullName, body.extractedData, body.searchableText);
  }

  @UseGuards(JwtAuthGuard)
  @Post('analyze')
  async analyze(@Body() body: { base64Image: string }) {
    return this.kycService.analyzeDocument(body.base64Image);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Request() req: any) {
    return this.kycService.findByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    return this.kycService.approveKYC(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.kycService.rejectKYC(id, body.reason);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/suspend')
  async suspend(@Param('id') id: string) {
    return this.kycService.suspendKYC(id);
  }

  // public-settings moved to top

  @UseGuards(JwtAuthGuard)
  @Get('settings')
  async getSettings() {
    const keys = [
      'OPEN_ROUTER_API_KEY', 'AI_MODEL',
      'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_NAME', 'SMTP_FROM_EMAIL',
      'SMS_PROVIDER', 'SMS_API_KEY',
      'APP_NAME', 'APP_DESCRIPTION', 'PRIMARY_COLOR', 'SUPPORT_EMAIL',
      'LOGO_FULL', 'LOGO_SQUARE', 'LOGO_LANDSCAPE', 'APP_ICON', 'SPLASH_ICON'
    ];
    return this.kycService.getSettings(keys);
  }

  @UseGuards(JwtAuthGuard)
  @Post('settings')
  async saveSettings(@Body() body: Record<string, string>) {
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        await this.kycService.saveSetting(key, value);
      }
    }
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/pending')
  async getPending() {
    return this.kycService.findAllPending();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('idType') idType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.kycService.findAll({
      search,
      status,
      idType,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }
}
