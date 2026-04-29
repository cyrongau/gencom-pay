import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './modules/user/entities/user.entity';
import { Wallet, WalletStatus } from './modules/wallet/entities/wallet.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedSystemUsers();
    await this.seedSystemWallets();
  }

  private async seedSystemUsers() {
    const systemUsers = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'system@generex.network',
        full_name: 'Generex System',
        role: UserRole.ADMIN,
        status: UserStatus.VERIFIED,
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'treasury@generex.network',
        full_name: 'Generex Treasury',
        role: UserRole.ADMIN,
        status: UserStatus.VERIFIED,
      },
    ];

    for (const u of systemUsers) {
      const exists = await this.userRepository.findOne({ where: { id: u.id } });
      if (!exists) {
        const user = this.userRepository.create({
          ...u,
          password: 'system-account-no-login',
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=0B1225&color=fff`,
        });
        await this.userRepository.save(user);
        console.log(`Seeded system user: ${u.full_name}`);
      }
    }
  }

  private async seedSystemWallets() {
    const systemWallets = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        user_id: '00000000-0000-0000-0000-000000000001',
        currency: 'USD',
        status: WalletStatus.ACTIVE,
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        user_id: '00000000-0000-0000-0000-000000000002',
        currency: 'USD',
        status: WalletStatus.ACTIVE,
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        user_id: '00000000-0000-0000-0000-000000000001', // Owned by system user
        currency: 'USD',
        status: WalletStatus.ACTIVE,
      },
    ];

    for (const w of systemWallets) {
      const exists = await this.walletRepository.findOne({ where: { id: w.id } });
      if (!exists) {
        const wallet = this.walletRepository.create(w);
        await this.walletRepository.save(wallet);
        console.log(`Seeded system wallet: ${w.id} (${w.currency})`);
      }
    }
  }
}
