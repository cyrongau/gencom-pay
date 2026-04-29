import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { KYCModule } from '../kyc/kyc.module';

@Module({
  imports: [KYCModule],
  controllers: [PublicController],
})
export class PublicModule {}
