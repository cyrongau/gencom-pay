import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { WalletService } from '../wallet/wallet.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private walletService: WalletService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        status: user.status,
        avatar_url: user.avatar_url,
        role: user.role,
        metadata: user.metadata,
      },
    };
  }

  async register(email: string, pass: string, fullName: string) {
    const user = await this.userService.create(email, pass, fullName);
    // Automatically create a default USD wallet for the new user
    await this.walletService.createWallet(user.id, 'USD');
    return this.login(user);
  }

  async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await this.userService.findById(userId);
    // Find user with password
    const userWithPass = await this.userService.findByEmail(user.email);
    
    if (!userWithPass || !(await bcrypt.compare(oldPass, userWithPass.password))) {
      throw new UnauthorizedException('Invalid current password');
    }

    const hashedNewPassword = await bcrypt.hash(newPass, 10);
    await this.userService.updateProfile(userId, { password: hashedNewPassword });
    return { status: 'success', message: 'Password updated successfully' };
  }
}
