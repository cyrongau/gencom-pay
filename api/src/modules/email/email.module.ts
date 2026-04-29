import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailTemplateService } from './email-template.service';

import { KYCModule } from '../kyc/kyc.module';

@Module({
  imports: [ConfigModule, KYCModule],
  providers: [EmailService, EmailTemplateService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
