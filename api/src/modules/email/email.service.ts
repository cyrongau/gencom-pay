import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplateService, EmailTemplateType } from './email-template.service';
import { KYCService } from '../kyc/kyc.service';

export interface SendMailOptions {
  to: string;
  subject: string;
  template: EmailTemplateType;
  context: Record<string, any>;
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService,
    private templateService: EmailTemplateService,
    private kycService: KYCService,
  ) {}

  private async getSmtpConfig(override?: Partial<SmtpConfig>): Promise<SmtpConfig> {
    const keys = [
      'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_NAME', 'SMTP_FROM_EMAIL'
    ];
    const dbSettings = await this.kycService.getSettings(keys);

    const config = {
      host: override?.host || dbSettings.SMTP_HOST || this.configService.get<string>('SMTP_HOST') || '',
      port: override?.port || parseInt(dbSettings.SMTP_PORT || this.configService.get<string>('SMTP_PORT') || '587'),
      user: override?.user || dbSettings.SMTP_USER || this.configService.get<string>('SMTP_USER') || '',
      pass: override?.pass || dbSettings.SMTP_PASS || this.configService.get<string>('SMTP_PASS') || '',
      fromName: override?.fromName || dbSettings.SMTP_FROM_NAME || this.configService.get<string>('SMTP_FROM_NAME') || 'Gencom Pay',
      fromEmail: override?.fromEmail || dbSettings.SMTP_FROM_EMAIL || this.configService.get<string>('SMTP_FROM_EMAIL') || 'noreply@gencom.io',
    };

    if (!config.host || !config.user) {
      this.logger.warn(`SMTP is not fully configured. Emails will likely fail. Host: ${config.host}, User: ${config.user}`);
    }

    return config;
  }

  private async buildTransport(config?: Partial<SmtpConfig>) {
    const smtp = await this.getSmtpConfig(config);

    return nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
      tls: { rejectUnauthorized: false },
    });
  }

  private async getFromAddress(config?: Partial<SmtpConfig>): Promise<string> {
    const smtp = await this.getSmtpConfig(config);
    return `"${smtp.fromName}" <${smtp.fromEmail}>`;
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const brandingKeys = ['APP_NAME', 'LOGO_LANDSCAPE', 'LOGO_FULL'];
    const branding = await this.kycService.getSettings(brandingKeys);
    
    const html = this.templateService.render(options.template, {
      ...options.context,
      globalBranding: {
        name: branding.APP_NAME || 'Gencom Pay',
        logo: branding.LOGO_LANDSCAPE || branding.LOGO_FULL || ''
      }
    });
    
    const transport = await this.buildTransport();
    const from = await this.getFromAddress();

    try {
      await transport.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html,
      });
      this.logger.log(`Email [${options.template}] dispatched to ${options.to}`);
    } catch (err: any) {
      this.logger.error(`Email dispatch failed: ${err.message}`);
      throw err;
    } finally {
      transport.close();
    }
  }

  async testConnection(smtpConfig: SmtpConfig): Promise<{ success: boolean; error?: string }> {
    const transport = await this.buildTransport(smtpConfig);
    try {
      await transport.verify();
      
      // Also send a real test email
      const from = await this.getFromAddress(smtpConfig);
      const html = this.templateService.render('test_connection', {
        recipientName: 'Administrator',
        timestamp: new Date().toLocaleString(),
        smtpHost: smtpConfig.host,
      });
      await transport.sendMail({
        from,
        to: smtpConfig.user, // send to self
        subject: '✅ Gencom Pay — SMTP Connection Verified',
        html,
      });

      return { success: true };
    } catch (err: any) {
      this.logger.warn(`SMTP test failed: ${err.message}`);
      return {
        success: false,
        error: this.humanizeSmtpError(err),
      };
    } finally {
      transport.close();
    }
  }

  private humanizeSmtpError(err: any): string {
    const msg = err.message || '';
    if (msg.includes('ECONNREFUSED')) return `Connection refused on ${err.address || 'host'}:${err.port || 'port'}. Verify the SMTP host and port.`;
    if (msg.includes('ETIMEDOUT')) return 'Connection timed out. Check your SMTP host and firewall settings.';
    if (msg.includes('ENOTFOUND')) return 'SMTP host not found. Check the hostname for typos.';
    if (msg.includes('535') || msg.includes('Authentication')) return 'Authentication failed. Verify your SMTP username and password.';
    if (msg.includes('534') || msg.includes('less secure')) return 'Gmail requires an App Password. Enable 2FA and generate an App Password at myaccount.google.com/apppasswords.';
    if (msg.includes('Invalid login')) return 'Invalid login credentials. Double-check your username and password.';
    if (msg.includes('TLS') || msg.includes('SSL')) return 'TLS/SSL handshake failed. Try toggling between port 465 (SSL) and 587 (TLS).';
    return msg;
  }

  // --- Convenience methods for all system emails ---
  async sendWelcome(to: string, name: string): Promise<void> {
    await this.sendMail({
      to, subject: `Welcome to Gencom Pay, ${name}!`,
      template: 'welcome', context: { name, loginUrl: `${this.configService.get('APP_URL')}/login` },
    });
  }

  async sendTransactionAlert(to: string, name: string, amount: string, currency: string, type: 'credit' | 'debit', reference: string): Promise<void> {
    await this.sendMail({
      to, subject: `Transaction Alert — ${type === 'credit' ? '💰 Funds Received' : '📤 Funds Sent'}`,
      template: 'transaction_alert', context: { name, amount, currency, type, reference, appUrl: this.configService.get('APP_URL') },
    });
  }

  async sendKycStatus(to: string, name: string, status: 'approved' | 'rejected', reason?: string): Promise<void> {
    await this.sendMail({
      to, subject: status === 'approved' ? '✅ KYC Identity Verified' : '❌ KYC Review Update',
      template: 'kyc_status', context: { name, status, reason, appUrl: this.configService.get('APP_URL') },
    });
  }

  async sendPasswordReset(to: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get('APP_URL')}/reset-password?token=${resetToken}`;
    await this.sendMail({
      to, subject: '🔐 Password Reset Request',
      template: 'password_reset', context: { name, resetUrl },
    });
  }

  async sendMerchantSettlement(to: string, name: string, amount: string, currency: string, reference: string): Promise<void> {
    await this.sendMail({
      to, subject: `💼 Settlement Processed — ${amount} ${currency}`,
      template: 'merchant_settlement', context: { name, amount, currency, reference, appUrl: this.configService.get('APP_URL') },
    });
  }

  async sendTeamInvite(to: string, userName: string, merchantName: string, merchantLogo: string, role: string): Promise<void> {
    await this.sendMail({
      to, 
      subject: `🤝 Invitation to join ${merchantName} on Gencom Pay`,
      template: 'merchant_invite', 
      context: { 
        name: userName, 
        merchantName, 
        merchantLogo, 
        role, 
        appUrl: this.configService.get('APP_URL') 
      },
    });
  }
}
