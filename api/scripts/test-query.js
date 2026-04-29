const { Client } = require('pg');
require('dotenv').config({ path: 'api/.env' });

async function testServiceQuery() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    await client.connect();
    
    // Simulate the query builder logic
    const search = '';
    const status = '';
    
    let query = 'SELECT * FROM merchant_kyc WHERE 1=1';
    const params = [];
    
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (legal_business_name ILIKE $${params.length} OR merchant_id ILIKE $${params.length})`;
    }
    
    query += ' ORDER BY created_at DESC LIMIT 10 OFFSET 0';
    
    console.log('Query:', query);
    console.log('Params:', params);
    
    const res = await client.query(query, params);
    console.log('Result Count:', res.rows.length);
    console.table(res.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

testServiceQuery();
