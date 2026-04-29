import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KYCRecord } from './entities/kyc.entity';
import { KYCService } from './kyc.service';
import { KYCController } from './kyc.controller';
import { UserModule } from '../user/user.module';

import { SystemSetting } from './entities/system-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([KYCRecord, SystemSetting]),
    UserModule,
  ],
  providers: [KYCService],
  controllers: [KYCController],
  exports: [KYCService],
})
export class KYCModule {}
