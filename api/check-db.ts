import { createConnection } from 'typeorm';
import { VirtualCard } from './src/modules/cards/entities/virtual-card.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function check() {
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [VirtualCard],
  });

  const repo = connection.getRepository(VirtualCard);
  const cards = await repo.find({ select: ['id', 'last_four'] });
  console.log('Cards count:', cards.length);
  if (cards.length > 0) {
    console.log('Sample card ID:', cards[0].id);
  }

  await connection.close();
}

check().catch(console.error);
