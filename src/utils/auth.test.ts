import { test } from 'node:test';
import assert from 'node:assert';
import {
  isValidEmail,
  isGoogleEmail,
  normalizePhoneNumber,
  isValidPhoneNumber,
  maskPhoneNumber,
  generateOtpCode,
  buildUserProfile,
  SUPPORTED_DIAL_CODES,
  findAccountByEmail,
  verifyEmailPassword,
  registerNewAccount,
  verifyPhoneAccount,
} from './auth';

test('isValidEmail validates emails correctly', () => {
  assert.strictEqual(isValidEmail('godsonmike900@gmail.com'), true);
  assert.strictEqual(isValidEmail('founder@nexvora.ai'), true);
  assert.strictEqual(isValidEmail('user.name+tag@domain.co.uk'), true);
  assert.strictEqual(isValidEmail('invalid-email'), false);
  assert.strictEqual(isValidEmail('missing@domain'), false);
  assert.strictEqual(isValidEmail(''), false);
  assert.strictEqual(isValidEmail(null as any), false);
});

test('isGoogleEmail detects gmail domains', () => {
  assert.strictEqual(isGoogleEmail('godsonmike900@gmail.com'), true);
  assert.strictEqual(isGoogleEmail('user@googlemail.com'), true);
  assert.strictEqual(isGoogleEmail('founder@nexvora.ai'), false);
  assert.strictEqual(isGoogleEmail(''), false);
});

test('normalizePhoneNumber removes spaces, dashes, and parens', () => {
  assert.strictEqual(normalizePhoneNumber('+234 (803) 123-4567'), '+2348031234567');
  assert.strictEqual(normalizePhoneNumber('0803 892 4110'), '08038924110');
  assert.strictEqual(normalizePhoneNumber(''), '');
});

test('isValidPhoneNumber checks phone number integrity', () => {
  assert.strictEqual(isValidPhoneNumber('+2348038924110'), true);
  assert.strictEqual(isValidPhoneNumber('08038924110'), true);
  assert.strictEqual(isValidPhoneNumber('+14155552671'), true);
  assert.strictEqual(isValidPhoneNumber('123'), false); // too short
  assert.strictEqual(isValidPhoneNumber('abc-phone'), false);
});

test('maskPhoneNumber masks middle digits for SMS OTP screen', () => {
  const masked = maskPhoneNumber('+2348038924110');
  assert.strictEqual(masked, '+234 ••• ••• 110');
  assert.strictEqual(maskPhoneNumber('123'), '123');
});

test('generateOtpCode generates 6 digit numeric code', () => {
  const code = generateOtpCode();
  assert.strictEqual(code.length, 6);
  assert.strictEqual(/^\d{6}$/.test(code), true);
});

test('buildUserProfile creates complete profile with defaults', () => {
  const profile = buildUserProfile({
    fullName: 'Godson Mike',
    email: 'godsonmike900@gmail.com',
    phone: '+2348038924110',
    businessName: 'VoraTech Solutions Ltd',
    currency: 'NGN',
  });

  assert.strictEqual(profile.fullName, 'Godson Mike');
  assert.strictEqual(profile.email, 'godsonmike900@gmail.com');
  assert.strictEqual(profile.phone, '+2348038924110');
  assert.strictEqual(profile.businessName, 'VoraTech Solutions Ltd');
  assert.strictEqual(profile.currency, 'NGN');
  assert.strictEqual(profile.plan, 'PRO');
  assert.ok(profile.id.startsWith('usr_'));
});

test('SUPPORTED_DIAL_CODES contains Nigeria, US, UK, and European codes', () => {
  assert.ok(SUPPORTED_DIAL_CODES.some((c) => c.code === '+234'));
  assert.ok(SUPPORTED_DIAL_CODES.some((c) => c.code === '+1'));
  assert.ok(SUPPORTED_DIAL_CODES.some((c) => c.code === '+44'));
});

test('findAccountByEmail finds pre-registered accounts', () => {
  const godson = findAccountByEmail('godsonmike900@gmail.com');
  assert.ok(godson);
  assert.strictEqual(godson?.fullName, 'Godson Mike');

  const notFound = findAccountByEmail('unregistered_stranger_123@gmail.com');
  assert.strictEqual(notFound, undefined);
});

test('verifyEmailPassword strictly rejects unregistered accounts with NOT_FOUND', () => {
  const result = verifyEmailPassword('nobody_registered_here@test.com', 'secret123');
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.errorReason, 'NOT_FOUND');
  assert.strictEqual(result.account, undefined);
});

test('verifyEmailPassword rejects incorrect password for registered account with WRONG_PASSWORD', () => {
  const result = verifyEmailPassword('godsonmike900@gmail.com', 'completely_wrong_pass');
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.errorReason, 'WRONG_PASSWORD');
});

test('verifyEmailPassword authenticates valid registered credentials', () => {
  const result = verifyEmailPassword('godsonmike900@gmail.com', 'nexvora2026');
  assert.strictEqual(result.success, true);
  assert.ok(result.account);
  assert.strictEqual(result.account?.email, 'godsonmike900@gmail.com');
});

test('registerNewAccount rejects existing emails with ALREADY_EXISTS', () => {
  const result = registerNewAccount(
    {
      fullName: 'Godson Mike Duplicate',
      email: 'godsonmike900@gmail.com',
    },
    'newpassword123'
  );
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.errorReason, 'ALREADY_EXISTS');
});

test('registerNewAccount rejects passwords under 6 characters with WEAK_PASSWORD', () => {
  const result = registerNewAccount(
    {
      fullName: 'New User',
      email: 'newuser1@example.com',
    },
    '123'
  );
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.errorReason, 'WEAK_PASSWORD');
});

test('registerNewAccount registers brand new user and allows subsequent login', () => {
  const newEmail = `brand_new_founder_${Date.now()}@testcorp.ng`;
  const regResult = registerNewAccount(
    {
      fullName: 'Chidi Okafor',
      email: newEmail,
      businessName: 'Okafor Logistics Global',
      currency: 'NGN',
    },
    'SecurePass998!'
  );

  assert.strictEqual(regResult.success, true);
  assert.ok(regResult.account);
  assert.strictEqual(regResult.account?.fullName, 'Chidi Okafor');

  // Verify that subsequent sign-in with wrong password fails
  const badLogin = verifyEmailPassword(newEmail, 'wrongPassword');
  assert.strictEqual(badLogin.success, false);
  assert.strictEqual(badLogin.errorReason, 'WRONG_PASSWORD');

  // Verify that subsequent sign-in with correct password succeeds
  const goodLogin = verifyEmailPassword(newEmail, 'SecurePass998!');
  assert.strictEqual(goodLogin.success, true);
  assert.strictEqual(goodLogin.account?.businessName, 'Okafor Logistics Global');
});

test('verifyPhoneAccount rejects unregistered phone numbers', () => {
  const result = verifyPhoneAccount('+2349999999999');
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.errorReason, 'NOT_FOUND');
});

