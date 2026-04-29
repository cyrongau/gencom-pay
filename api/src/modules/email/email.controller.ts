import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class SmtpTestDto {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('test')
  @UseGuards(JwtAuthGuard)
  async testSmtp(@Body() body: SmtpTestDto) {
    return this.emailService.testConnection(body);
  }
}
