import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  bufferToBase64Url,
  base64UrlToBuffer,
  generateChallenge,
  detectPlatformAuthenticatorName,
  createRegisterCredentialOptions,
  createLoginCredentialOptions,
  saveBiometricCredential,
  getStoredBiometricCredential,
  removeBiometricCredential,
  StoredBiometricCredential,
} from './webauthn.js';

describe('WebAuthn Biometric Utility Functions', () => {
  it('encodes and decodes buffers to URL-safe base64 without data loss', () => {
    const original = new Uint8Array([0, 15, 255, 128, 42, 99, 17, 230, 77, 10]);
    const base64Url = bufferToBase64Url(original);

    assert.strictEqual(typeof base64Url, 'string');
    assert.strictEqual(base64Url.includes('+'), false);
    assert.strictEqual(base64Url.includes('/'), false);
    assert.strictEqual(base64Url.includes('='), false);

    const recovered = base64UrlToBuffer(base64Url);
    assert.deepStrictEqual(Array.from(recovered), Array.from(original));
  });

  it('generates a 32-byte non-empty cryptographic challenge', () => {
    const challenge = generateChallenge();
    assert.strictEqual(challenge instanceof Uint8Array, true);
    assert.strictEqual(challenge.byteLength, 32);

    // Verify it is not all zeros
    const sum = Array.from(challenge).reduce((acc, val) => acc + val, 0);
    assert.ok(sum > 0, 'Challenge should not be empty or all zeros');
  });

  it('detects platform authenticator names based on user agent strings', () => {
    const androidUA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36';
    assert.strictEqual(detectPlatformAuthenticatorName(androidUA), 'Android Biometric (Fingerprint / Face)');

    const iphoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
    assert.strictEqual(detectPlatformAuthenticatorName(iphoneUA), 'Apple Biometric (Face ID / Touch ID)');

    const macUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36';
    assert.strictEqual(detectPlatformAuthenticatorName(macUA), 'Mac Touch ID');

    const winUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36';
    assert.strictEqual(detectPlatformAuthenticatorName(winUA), 'Windows Hello');

    const genericUA = 'CustomBrowser/1.0';
    assert.strictEqual(detectPlatformAuthenticatorName(genericUA), 'Device Biometric Authenticator');
  });

  it('creates valid registration credential options with user and RP details', () => {
    const fixedChallenge = new Uint8Array(32);
    const options = createRegisterCredentialOptions({
      userId: 'user-12345',
      userEmail: 'godson@nexvora.ai',
      userDisplayName: 'Godson Mike',
      rpId: 'nexvora.ai',
      challenge: fixedChallenge,
    });

    const pk = options.publicKey;
    assert.ok(pk, 'Public key options should exist');
    assert.strictEqual(pk.rp.name, 'NEXVORA AI Business Platform');
    assert.strictEqual(pk.rp.id, 'nexvora.ai');
    assert.strictEqual(pk.user.name, 'godson@nexvora.ai');
    assert.strictEqual(pk.user.displayName, 'Godson Mike');
    assert.strictEqual(pk.timeout, 60000);
    assert.strictEqual(pk.attestation, 'none');
    assert.strictEqual(pk.authenticatorSelection?.authenticatorAttachment, 'platform');
    assert.strictEqual(pk.pubKeyCredParams?.length, 2);
  });

  it('creates valid authentication credential options with allowCredentials', () => {
    const fixedChallenge = new Uint8Array(32);
    const fakeCredId = 'dGVzdC1jcmVkZW50aWFsLWlkLTEyMzQ1';

    const options = createLoginCredentialOptions({
      credentialId: fakeCredId,
      rpId: 'nexvora.ai',
      challenge: fixedChallenge,
    });

    const pk = options.publicKey;
    assert.ok(pk, 'Public key options should exist');
    assert.strictEqual(pk.rpId, 'nexvora.ai');
    assert.strictEqual(pk.userVerification, 'preferred');
    assert.strictEqual(pk.allowCredentials?.length, 1);
    assert.strictEqual(pk.allowCredentials?.[0].type, 'public-key');
  });

  it('handles client storage lifecycle: save, get, and remove biometric credentials', () => {
    const memoryStore: Record<string, string> = {};
    const mockStorage = {
      getItem: (key: string) => memoryStore[key] || null,
      setItem: (key: string, val: string) => {
        memoryStore[key] = val;
      },
      removeItem: (key: string) => {
        delete memoryStore[key];
      },
      clear: () => {},
      key: () => null,
      length: 0,
    } as unknown as Storage;

    assert.strictEqual(getStoredBiometricCredential(mockStorage), null);

    const testCred: StoredBiometricCredential = {
      credentialId: 'cred-abc-123',
      userId: 'user-999',
      userEmail: 'founder@nexvora.ai',
      userDisplayName: 'Godson Founder',
      registeredAt: '2026-11-09T12:00:00.000Z',
      deviceName: 'Android Biometric (Fingerprint / Face)',
      algorithm: -7,
    };

    saveBiometricCredential(testCred, mockStorage);

    const retrieved = getStoredBiometricCredential(mockStorage);
    assert.deepStrictEqual(retrieved, testCred);

    removeBiometricCredential(mockStorage);
    assert.strictEqual(getStoredBiometricCredential(mockStorage), null);
  });
});
