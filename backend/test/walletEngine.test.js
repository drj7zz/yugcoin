const test = require('node:test');
const assert = require('node:assert');
const walletEngine = require('../src/services/walletEngine.service');
const { generateWalletUid } = require('../src/utils/walletUid');
const authController = require('../src/controllers/auth.controller');

test('Wallet UID and required PIN enforcement', async (t) => {
  await t.test('uid format matches the legacy YUG-###### pattern', () => {
    const uid = generateWalletUid();
    assert.match(uid, /^YUG-[0-9]{6}$/);
    assert.notEqual(uid, 'YUG-1234');
  });

  await t.test('register rejects missing securityPin', async () => {
    const req = {
      body: { name: 'Admin User', email: 'admin-test@yugcoin.org', password: 'pass123' }
    };

    let statusCode = 500;
    let responseBody = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseBody = data;
      }
    };

    await authController.register(req, res);

    assert.strictEqual(statusCode, 400);
    assert.strictEqual(responseBody.success, false);
    assert.match(responseBody.error, /securityPin/i);
  });
});

test('Wallet Engine Double-Entry Transfer & SHA-256 Ledger Integrity', async (t) => {

  await t.test('1. Setup initial wallets for Alice and Bob in Memory Engine', async () => {
    const store = walletEngine.getMemoryStore();

    store.users.set('test_alice', { _id: 'test_alice', name: 'Alice', email: 'alice@test.com', walletAddress: 'YUG-TEST-A' });
    store.users.set('test_bob', { _id: 'test_bob', name: 'Bob', email: 'bob@test.com', walletAddress: 'YUG-TEST-B' });

    store.wallets.set('wal_test_a', { _id: 'wal_test_a', userId: 'test_alice', walletAddress: 'YUG-TEST-A', accountType: 'USER', currency: 'YUG', balance: 1000, lockedBalance: 0, status: 'ACTIVE', updatedAt: new Date() });
    store.wallets.set('wal_test_b', { _id: 'wal_test_b', userId: 'test_bob', walletAddress: 'YUG-TEST-B', accountType: 'USER', currency: 'YUG', balance: 200, lockedBalance: 0, status: 'ACTIVE', updatedAt: new Date() });
  });

  await t.test('2. Execute atomic transfer of 100 YUG from Alice to Bob', async () => {
    const result = await walletEngine.processTransfer({
      sourceUserId: 'test_alice',
      destinationAddress: 'YUG-TEST-B',
      amount: 100,
      currency: 'YUG',
      idempotencyKey: 'TEST-KEY-001',
      description: 'Unit test transfer'
    });

    assert.strictEqual(result.transaction.amount, 100);
    assert.strictEqual(result.transaction.status, 'COMPLETED');

    const store = walletEngine.getMemoryStore();
    const aliceWallet = store.wallets.get('wal_test_a');
    const bobWallet = store.wallets.get('wal_test_b');

    // 100 transferred + 0.1 YUG fee deducted from Alice = 100.1 deducted (899.9 balance)
    assert.strictEqual(aliceWallet.balance, 899.9);
    // Bob receives 100 YUG = 300 balance
    assert.strictEqual(bobWallet.balance, 300);
  });

  await t.test('3. Idempotency test: Re-submitting same idempotency key must not duplicate transfer', async () => {
    const store = walletEngine.getMemoryStore();
    const aliceInitialBal = store.wallets.get('wal_test_a').balance;

    const result = await walletEngine.processTransfer({
      sourceUserId: 'test_alice',
      destinationAddress: 'YUG-TEST-B',
      amount: 100,
      currency: 'YUG',
      idempotencyKey: 'TEST-KEY-001'
    });

    assert.strictEqual(result.idempotent, true);
    assert.strictEqual(store.wallets.get('wal_test_a').balance, aliceInitialBal);
  });

  await t.test('4. Ledger Integrity Audit: SHA-256 chain validation & Debits = Credits invariant', async () => {
    const audit = await walletEngine.verifyLedgerIntegrity();

    assert.strictEqual(audit.isChainValid, true, 'Cryptographic hash chain must be 100% valid');
    assert.strictEqual(audit.balanced, true, 'Total DEBITS must equal Total CREDITS');
  });

});
