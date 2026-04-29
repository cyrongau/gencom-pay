import { Controller, Get } from '@nestjs/common';
import { KYCService } from '../kyc/kyc.service';

@Controller('public')
export class PublicController {
  constructor(private kycService: KYCService) {}

  @Get('branding')
  async getBranding() {
    const keys = [
      'APP_NAME', 'APP_DESCRIPTION', 'PRIMARY_COLOR', 'SUPPORT_EMAIL',
      'LOGO_FULL', 'LOGO_SQUARE', 'LOGO_LANDSCAPE', 'APP_ICON', 'SPLASH_ICON'
    ];
    return this.kycService.getSettings(keys);
  }
}
