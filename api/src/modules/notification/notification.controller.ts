import { Controller, Get, Post, Patch, Delete, Param, UseGuards, Request, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('fcm-token')
  async registerToken(@Request() req: any, @Body('token') token: string) {
    return this.notificationService.registerToken(req.user.id, token);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.notificationService.findAll(req.user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.notificationService.delete(id, req.user.id);
  }

  @Delete()
  async clearAll(@Request() req: any) {
    return this.notificationService.clearAll(req.user.id);
  }
}
