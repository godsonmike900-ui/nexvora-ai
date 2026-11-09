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
