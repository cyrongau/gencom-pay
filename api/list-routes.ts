import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function list() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpServer();
  const router = server._events.request._router;

  const availableRoutes: [] = router.stack
    .filter((r: any) => r.route)
    .map((r: any) => {
      return {
        method: Object.keys(r.route.methods)[0].toUpperCase(),
        path: r.route.path
      };
    });

  console.log(JSON.stringify(availableRoutes, null, 2));
  await app.close();
}

list().catch(console.error);
