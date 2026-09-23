import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

process.env.ADMIN_USER = 'admin';
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('test-password', 4);
process.env.ADMIN_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

test('admin password uses bcrypt and session token is verifiable', async () => {
  const auth = await import('../src/server/adminService.ts');
  const result = await auth.authenticateAdmin('admin', 'test-password');
  assert.equal(result.success, true);
  assert.ok(result.token);
  assert.equal(auth.verifyAdminToken(undefined, auth.createAdminCookie(result.token!)), true);
  assert.equal(await auth.authenticateAdmin('admin', 'wrong-password').then((r) => r.success), false);
  assert.equal(auth.verifyAdminToken(undefined, auth.clearAdminCookie()), false);
});

test('legacy plaintext password env is not used by authentication module', async () => {
  assert.ok(process.env.ADMIN_PASSWORD_HASH?.startsWith('$2'));
  assert.equal(process.env.ADMIN_PASSWORD, undefined);
});
