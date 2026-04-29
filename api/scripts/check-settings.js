
const { Client } = require('pg');

async function checkSettings() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: 'postgres',
    database: 'gencom_pay',
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM system_settings');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkSettings();
