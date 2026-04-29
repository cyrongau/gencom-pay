import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type EmailTemplateType =
  | 'welcome'
  | 'transaction_alert'
  | 'kyc_status'
  | 'password_reset'
  | 'merchant_settlement'
  | 'merchant_invite'
  | 'test_connection';

@Injectable()
export class EmailTemplateService {
  constructor(private configService: ConfigService) {}

  private get appName(): string {
    return this.configService.get<string>('APP_NAME') || 'Gencom Pay';
  }

  private get appUrl(): string {
    return this.configService.get<string>('APP_URL') || 'http://localhost:3000';
  }

  // ─── Master Layout ────────────────────────────────────────────────────────
  private layout(body: string, merchantBranding?: { name: string, logo?: string }, globalBranding?: { name: string, logo?: string }): string {
    let displayLogo = merchantBranding?.logo || globalBranding?.logo;
    const displayName = merchantBranding?.name || globalBranding?.name || this.appName;

    // Ensure absolute URL for email clients
    if (displayLogo && displayLogo.startsWith('/')) {
      displayLogo = `${this.appUrl}${displayLogo}`;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${displayName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0A0F1E; font-family:'Inter',Arial,sans-serif; color:#E2E8F0; }
  .wrapper { max-width:640px; margin:0 auto; padding:40px 20px; }
  .card { background:#0D1B2A; border:1px solid rgba(255,255,255,0.07); border-radius:28px; overflow:hidden; }
  .header { background:linear-gradient(135deg,#0D2B20 0%,#0A192F 100%); padding:48px 48px 40px; text-align:center; border-bottom:1px solid rgba(22,198,110,0.15); }
  .logo-mark { display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; background:rgba(22,198,110,0.15); border:1px solid rgba(22,198,110,0.3); border-radius:18px; margin-bottom:20px; overflow:hidden; }
  .logo-mark svg { width:32px; height:32px; }
  .logo-mark img { width:100%; height:100%; object-fit:cover; }
  .app-name { font-size:13px; font-weight:900; letter-spacing:0.25em; text-transform:uppercase; color:#16C66E; margin-bottom:8px; }
  .header-rule { width:40px; height:2px; background:#16C66E; margin:16px auto; border-radius:2px; }
  .body { padding:48px; }
  .greeting { font-size:22px; font-weight:900; color:#FFFFFF; font-style:italic; margin-bottom:8px; letter-spacing:-0.5px; }
  .lead { font-size:14px; color:#94A3B8; line-height:1.7; margin-bottom:36px; }
  .kpi-row { display:flex; gap:16px; margin-bottom:36px; }
  .kpi { flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:18px; padding:20px 24px; }
  .kpi-label { font-size:9px; font-weight:900; letter-spacing:0.25em; text-transform:uppercase; color:#64748B; margin-bottom:8px; }
  .kpi-value { font-size:20px; font-weight:900; color:#FFFFFF; font-style:italic; letter-spacing:-0.5px; }
  .btn { display:inline-block; background:#16C66E; color:#0A0F1E !important; text-decoration:none; font-size:11px; font-weight:900; letter-spacing:0.2em; text-transform:uppercase; padding:18px 40px; border-radius:14px; margin-top:8px; }
  .divider { height:1px; background:rgba(255,255,255,0.06); margin:36px 0; }
  .info-box { background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); border-radius:18px; padding:20px 24px; margin-bottom:24px; }
  .success-box { background:rgba(22,198,110,0.08); border:1px solid rgba(22,198,110,0.2); border-radius:18px; padding:20px 24px; margin-bottom:24px; }
  .error-box { background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.2); border-radius:18px; padding:20px 24px; margin-bottom:24px; }
  .badge { display:inline-block; font-size:9px; font-weight:900; letter-spacing:0.2em; text-transform:uppercase; padding:6px 14px; border-radius:100px; }
  .badge-green { background:rgba(22,198,110,0.15); color:#16C66E; border:1px solid rgba(22,198,110,0.3); }
  .badge-red { background:rgba(248,113,113,0.15); color:#F87171; border:1px solid rgba(248,113,113,0.3); }
  .badge-blue { background:rgba(59,130,246,0.15); color:#60A5FA; border:1px solid rgba(59,130,246,0.3); }
  .ref { font-family:monospace; font-size:12px; color:#94A3B8; background:rgba(255,255,255,0.04); padding:12px 16px; border-radius:10px; }
  .footer { padding:36px 48px; background:#070C18; text-align:center; }
  .footer p { font-size:10px; color:#334155; font-weight:600; letter-spacing:0.1em; line-height:1.8; text-transform:uppercase; }
  .footer a { color:#475569; text-decoration:none; }
  @media(max-width:600px){
    .body,.header,.footer{padding:32px 24px;}
    .kpi-row{flex-direction:column;}
    .btn{display:block;text-align:center;}
  }
</style>
</head>
<body>
<div class="wrapper">
<div class="card">
  <div class="header">
    <div class="logo-mark">
      ${displayLogo ? `<img src="${displayLogo}" alt="${displayName}"/>` : `
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="#16C66E" stroke-width="1.5" fill="rgba(22,198,110,0.1)"/>
        <path d="M16 4L28 10L16 16L4 10L16 4Z" fill="rgba(22,198,110,0.2)"/>
        <path d="M16 16L28 10V22L16 28V16Z" fill="rgba(22,198,110,0.15)"/>
        <circle cx="16" cy="16" r="3" fill="#16C66E"/>
      </svg>`}
    </div>
    <div class="app-name">${displayName}</div>
    <div class="header-rule"></div>
  </div>
  <div class="body">
    ${body}
  </div>
  <div class="footer">
    <p>
      © ${new Date().getFullYear()} ${this.appName} · High-Fidelity Atomic Settlement Protocol<br/>
      <a href="${this.appUrl}">${this.appUrl}</a> · 
      <a href="${this.appUrl}/unsubscribe">Unsubscribe</a> · 
      <a href="${this.appUrl}/privacy">Privacy Policy</a>
    </p>
  </div>
</div>
</div>
</body>
</html>`;
  }

  // ─── Templates ────────────────────────────────────────────────────────────
  private templates: Record<EmailTemplateType, (ctx: Record<string, any>) => string> = {
    welcome: (ctx) => this.layout(`
      <div class="greeting">Welcome aboard, ${ctx.name}.</div>
      <p class="lead">Your Gencom Pay identity node has been successfully initialized. You now have access to the full suite of atomic settlement protocols.</p>
      <div class="success-box">
        <p style="font-size:12px;font-weight:700;color:#16C66E;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:6px;">Identity Verified</p>
        <p style="font-size:13px;color:#94A3B8;">Your account is active and ready for transactions. Start by funding your wallet or exploring the merchant portal.</p>
      </div>
      <a href="${ctx.loginUrl}" class="btn">Access Your Node →</a>
      <div class="divider"></div>
      <p style="font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Need help? Contact support@gencom.io</p>
    `, undefined, ctx.globalBranding),

    transaction_alert: (ctx) => {
      const isCredit = ctx.type === 'credit';
      return this.layout(`
        <div class="greeting">${isCredit ? 'Funds Received.' : 'Transaction Confirmed.'}</div>
        <p class="lead">A ${ctx.type === 'credit' ? 'credit' : 'debit'} transaction has been recorded on your Gencom Pay account.</p>
        <div class="kpi-row">
          <div class="kpi">
            <div class="kpi-label">Amount</div>
            <div class="kpi-value">${ctx.amount} <span style="font-size:13px;color:#64748B;">${ctx.currency}</span></div>
          </div>
          <div class="kpi">
            <div class="kpi-label">Type</div>
            <div class="kpi-value">
              <span class="badge ${isCredit ? 'badge-green' : 'badge-blue'}">${ctx.type.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div class="kpi-label" style="margin-bottom:8px;">Transaction Reference</div>
        <div class="ref">${ctx.reference}</div>
        <div class="divider"></div>
        <a href="${ctx.appUrl}/transactions" class="btn">View Transaction →</a>
        <p style="font-size:11px;color:#475569;margin-top:24px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">If you did not initiate this, contact support immediately.</p>
      `, undefined, ctx.globalBranding);
    },

    kyc_status: (ctx) => {
      const approved = ctx.status === 'approved';
      return this.layout(`
        <div class="greeting">KYC ${approved ? 'Verified.' : 'Review Update.'}</div>
        <p class="lead">Dear ${ctx.name}, your identity verification has been ${approved ? 'successfully processed' : 'reviewed by our compliance team'}.</p>
        <div class="${approved ? 'success-box' : 'error-box'}">
          <p style="font-size:12px;font-weight:700;color:${approved ? '#16C66E' : '#F87171'};text-transform:uppercase;letter-spacing:0.15em;margin-bottom:6px;">
            ${approved ? '✓ Identity Confirmed' : '✗ Further Action Required'}
          </p>
          <p style="font-size:13px;color:#94A3B8;">
            ${approved
              ? 'Your account now has full transaction limits and access to all platform features.'
              : ctx.reason || 'Please review your submitted documents and resubmit with clear, valid identification.'}
          </p>
        </div>
        <a href="${ctx.appUrl}/kyc" class="btn">${approved ? 'Access Full Features →' : 'Resubmit Documents →'}</a>
      `, undefined, ctx.globalBranding);
    },

    password_reset: (ctx) => this.layout(`
      <div class="greeting">Password Reset.</div>
      <p class="lead">We received a request to reset the password for your Gencom Pay account, ${ctx.name}. This link expires in 1 hour.</p>
      <div class="info-box">
        <p style="font-size:12px;color:#60A5FA;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:4px;">Security Notice</p>
        <p style="font-size:13px;color:#94A3B8;">If you did not request this, please ignore this email. Your password will not be changed.</p>
      </div>
      <a href="${ctx.resetUrl}" class="btn">Reset Password →</a>
      <div class="divider"></div>
      <p style="font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Link expires in 1 hour for your security.</p>
    `, undefined, ctx.globalBranding),

    merchant_settlement: (ctx) => this.layout(`
      <div class="greeting">Settlement Processed.</div>
      <p class="lead">Your daily merchant collection has been batched and settled to your designated account.</p>
      <div class="kpi-row">
        <div class="kpi">
          <div class="kpi-label">Settled Amount</div>
          <div class="kpi-value">${ctx.amount} <span style="font-size:13px;color:#64748B;">${ctx.currency}</span></div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Status</div>
          <div class="kpi-value"><span class="badge badge-green">COMPLETED</span></div>
        </div>
      </div>
      <div class="kpi-label" style="margin-bottom:8px;">Settlement Reference</div>
      <div class="ref">${ctx.reference}</div>
      <div class="divider"></div>
      <a href="${ctx.appUrl}/merchant" class="btn">View Merchant Portal →</a>
    `, undefined, ctx.globalBranding),

    merchant_invite: (ctx) => this.layout(`
      <div class="greeting">Invitation to Join ${ctx.merchantName}.</div>
      <p class="lead">You have been invited to join the <strong>${ctx.merchantName}</strong> team as a <strong>${ctx.role}</strong>. Collaborate on financial operations, manage terminals, and track settlements.</p>
      <div class="info-box">
        <p style="font-size:12px;color:#60A5FA;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:4px;">Team Access Request</p>
        <p style="font-size:13px;color:#94A3B8;">By accepting this invitation, you will gain access to the merchant business center for ${ctx.merchantName}.</p>
      </div>
      <a href="${ctx.appUrl}/merchant" class="btn">Accept Invitation →</a>
      <div class="divider"></div>
      <p style="font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Sent via ${this.appName} Business Gateway</p>
    `, { name: ctx.merchantName, logo: ctx.merchantLogo }, ctx.globalBranding),

    test_connection: (ctx) => this.layout(`
      <div class="greeting">Connection Verified.</div>
      <p class="lead">This is a test email confirming your SMTP gateway is correctly configured and operational.</p>
      <div class="success-box">
        <p style="font-size:12px;font-weight:700;color:#16C66E;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:6px;">✓ Mail Gateway Online</p>
        <p style="font-size:13px;color:#94A3B8;">Your Communications Protocol is active. All system email notifications will be dispatched through this gateway.</p>
      </div>
      <div class="kpi-row">
        <div class="kpi">
          <div class="kpi-label">SMTP Host</div>
          <div class="kpi-value" style="font-size:14px;">${ctx.smtpHost}</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Sent At</div>
          <div class="kpi-value" style="font-size:14px;">${ctx.timestamp}</div>
        </div>
      </div>
      <div class="divider"></div>
      <p style="font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">No further action is required.</p>
    `, undefined, ctx.globalBranding),
  };

  render(template: EmailTemplateType, context: Record<string, any>): string {
    const renderer = this.templates[template];
    if (!renderer) throw new Error(`Unknown email template: ${template}`);
    return renderer(context);
  }
}
