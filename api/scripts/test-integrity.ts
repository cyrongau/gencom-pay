import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { LedgerService } from '../src/modules/ledger/ledger.service';
import { WalletService } from '../src/modules/wallet/wallet.service';
import { EscrowService } from '../src/modules/escrow/escrow.service';
import { EntryType } from '../src/modules/ledger/entities/ledger-entry.entity';
import { DataSource } from 'typeorm';

async function runIntegrityTest() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ledgerService = app.get(LedgerService);
  const walletService = app.get(WalletService);
  const escrowService = app.get(EscrowService);
  const dataSource = app.get(DataSource);

  console.log('🚀 Starting Financial Integrity Test...');

  try {
    // 1. Setup Test Data
    const userA = '550e8400-e29b-41d4-a716-446655440000';
    const userB = '550e8400-e29b-41d4-a716-446655440001';
    const walletA = await walletService.createWallet(userA, 'USD');
    const walletB = await walletService.createWallet(userB, 'USD');
    const systemCashAccount = '00000000-0000-0000-0000-000000000002';

    console.log(`Wallets created: ${walletA.id}, ${walletB.id}`);

    // 2. Perform a Deposit (External Cash -> Wallet A)
    // In our system, deposits are just a transfer from a system account
    await ledgerService.recordDoubleEntry(
      'Initial Deposit',
      systemCashAccount,
      walletA.id,
      '1000.00',
      'USD',
      'DEP-001'
    );
    console.log('✅ Initial deposit of $1000.00 recorded.');

    // 3. Perform a Transfer (Wallet A -> Wallet B)
    await walletService.transfer(walletA.id, walletB.id, '200.00', 'Gift to B');
    console.log('✅ Transfer of $200.00 from A to B recorded.');

    // 4. Perform an Escrow Operation (B buys from A)
    const escrow = await escrowService.createEscrow(userB, walletB.id, walletA.id, '150.00', 'USD', 'Escrow for Item X');
    console.log(`✅ Escrow of $150.00 from B created. Escrow ID: ${escrow.id}`);

    // 5. Release Escrow to Seller (Wallet A)
    await escrowService.releaseEscrow(escrow.id, userB);
    console.log('✅ Escrow released to A.');

    // 6. Verify Balances
    const balanceA = await walletService.getBalance(walletA.id); // Should be 1000 - 200 + 150 = 950
    const balanceB = await walletService.getBalance(walletB.id); // Should be 200 - 150 = 50
    const balanceEscrow = await ledgerService.getBalance('00000000-0000-0000-0000-000000000001', 'USD'); // System Escrow account
    const balanceSystemCash = await ledgerService.getBalance(systemCashAccount, 'USD'); // Should be -1000

    console.log('\n📊 Final Balance Report:');
    console.log(`Wallet A: $${balanceA} (Expected: 950.00)`);
    console.log(`Wallet B: $${balanceB} (Expected: 50.00)`);
    console.log(`System Cash: $${balanceSystemCash} (Expected: -1000.00)`);

    // 7. Global Integrity Check (Sum of all entries must be zero)
    const allEntries = await dataSource.query('SELECT SUM(CASE WHEN entry_type = \'CREDIT\' THEN amount ELSE -amount END) as net FROM ledger_entries');
    const netSum = parseFloat(allEntries[0].net);
    
    console.log(`\n⚖️  Global Net Sum: ${netSum}`);
    if (Math.abs(netSum) < 0.00000001) {
      console.log('💎 INTEGRITY VERIFIED: Double-entry system is perfectly balanced.');
    } else {
      console.error('❌ INTEGRITY BREACH: System is out of balance!');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await app.close();
  }
}

runIntegrityTest();
