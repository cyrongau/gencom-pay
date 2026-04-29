const { Client } = require('pg');
require('dotenv').config({ path: 'api/.env' });

async function inspectDocuments() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    await client.connect();
    
    const res = await client.query('SELECT documents FROM merchant_kyc LIMIT 1');
    if (res.rows.length > 0) {
      const docs = res.rows[0].documents;
      console.log('Documents Array:');
      docs.forEach((doc, i) => {
        console.log(`\nDocument ${i}:`);
        console.log(`Type: ${doc.type}`);
        console.log(`FileName: ${doc.fileName}`);
        console.log(`URL Prefix: ${doc.url?.substring(0, 50)}`);
        console.log(`URL Length: ${doc.url?.length}`);
      });
    } else {
      console.log('No KYC records found.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

inspectDocuments();
