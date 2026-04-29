import { Module, Global } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
