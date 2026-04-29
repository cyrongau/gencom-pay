const { Client } = require('pg');
require('dotenv').config({ path: 'api/.env' });

async function checkMerchants() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    await client.connect();
    
    console.log('--- Merchants Table ---');
    const resMerchants = await client.query('SELECT id, business_name, status, user_id FROM merchants');
    console.table(resMerchants.rows);

    console.log('\n--- Merchant KYC Table ---');
    const resKYC = await client.query('SELECT id, merchant_id, status, legal_business_name FROM merchant_kyc');
    console.table(resKYC.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkMerchants();
