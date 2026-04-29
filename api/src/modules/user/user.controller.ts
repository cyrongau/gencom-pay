import { Controller, Get, Post, Patch, Body, UseGuards, Request, InternalServerErrorException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.userService.findById(req.user.id);
  }

  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() body: any) {
    return this.userService.updateProfile(req.user.id, body);
  }

  @Post('profile/avatar')
  async uploadAvatar(@Request() req: any, @Body() body: { avatar: string }) {
    try {
      // Keep Base64 for web compatibility
      return this.userService.updateProfile(req.user.id, { avatar_url: body.avatar });
    } catch (err) {
      throw new InternalServerErrorException('Failed to upload avatar');
    }
  }

  @Post('profile/avatar/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadAvatarMultipart(@Request() req: any, @UploadedFile() file: any) {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.userService.updateProfile(req.user.id, { avatar_url: avatarUrl });
  }

  @Post('2fa/enable')
  async enable2FA(@Request() req: any) {
    // Mock 2FA enablement
    return this.userService.updateProfile(req.user.id, { 
      metadata: { ...req.user.metadata, twoFactorEnabled: true } 
    });
  }

  @Post('2fa/disable')
  async disable2FA(@Request() req: any) {
    return this.userService.updateProfile(req.user.id, { 
      metadata: { ...req.user.metadata, twoFactorEnabled: false } 
    });
  }

  // Admin Oversight
  @Get('admin/all')
  async getAll() {
    return this.userService.findAll();
  }
}
