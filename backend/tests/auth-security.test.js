const test = require('node:test');
const assert = require('node:assert/strict');

const { validateRegisterInput, validateLoginInput } = require('../src/auth/auth.validator');
const authService = require('../src/auth/auth.service');

test('register validation accepts valid payload', () => {
  const payload = {
    organizationName: 'Acme Labs',
    name: 'Alice',
    email: 'alice@example.com',
    password: 'StrongPass123!'
  };

  assert.doesNotThrow(() => validateRegisterInput(payload));
});

test('login validation rejects invalid email', () => {
  assert.throws(
    () => validateLoginInput({ email: 'invalid-email', password: 'StrongPass123!' }),
    /email/i
  );
});

test('login service function exists', () => {
  assert.equal(typeof authService.login, 'function');
});
