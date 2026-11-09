/**
 * NEXVORA AI - WebAuthn Biometric Authentication Utility
 * Pure utilities and device-native wrappers for Fingerprint, Face ID, and Passkeys.
 */

export interface StoredBiometricCredential {
  credentialId: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  registeredAt: string;
  deviceName: string;
  algorithm: number;
}

const STORAGE_KEY = 'nexvora_webauthn_credential';

/**
 * Checks if the WebAuthn API is supported in the current browser/runtime.
 */
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.PublicKeyCredential) &&
    typeof window.navigator?.credentials?.create === 'function' &&
    typeof window.navigator?.credentials?.get === 'function'
  );
}

/**
 * Checks if a platform authenticator (fingerprint scanner, Face ID, Windows Hello) is available.
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Converts an ArrayBuffer or Uint8Array into a URL-safe Base64 string.
 */
export function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Converts a URL-safe Base64 string into a Uint8Array.
 */
export function base64UrlToBuffer(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates a cryptographically secure random challenge (32 bytes).
 */
export function generateChallenge(): Uint8Array {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return bytes;
  }
  // Fallback for non-crypto test mock environments
  const fallback = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    fallback[i] = Math.floor(Math.random() * 256);
  }
  return fallback;
}

/**
 * Detects friendly name of user's platform authenticator from user agent.
 */
export function detectPlatformAuthenticatorName(userAgentString?: string): string {
  const ua = userAgentString || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  if (/Android/i.test(ua)) {
    return 'Android Biometric (Fingerprint / Face)';
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return 'Apple Biometric (Face ID / Touch ID)';
  }
  if (/Macintosh/i.test(ua)) {
    return 'Mac Touch ID';
  }
  if (/Windows/i.test(ua)) {
    return 'Windows Hello';
  }
  return 'Device Biometric Authenticator';
}

/**
 * Constructs credential creation options for WebAuthn enrollment.
 */
export function createRegisterCredentialOptions(params: {
  userId: string;
  userEmail: string;
  userDisplayName: string;
  rpId?: string;
  challenge?: Uint8Array;
}): CredentialCreationOptions {
  const challenge = params.challenge || generateChallenge();
  const hostname = params.rpId || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
  const encoder = new TextEncoder();

  return {
    publicKey: {
      challenge: challenge as BufferSource,
      rp: {
        name: 'NEXVORA AI Business Platform',
        id: hostname === 'localhost' ? undefined : hostname,
      },
      user: {
        id: encoder.encode(params.userId) as BufferSource,
        name: params.userEmail,
        displayName: params.userDisplayName || params.userEmail,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        requireResidentKey: false,
      },
      timeout: 60000,
      attestation: 'none',
    },
  };
}

/**
 * Constructs credential request options for WebAuthn authentication.
 */
export function createLoginCredentialOptions(params: {
  credentialId?: string;
  rpId?: string;
  challenge?: Uint8Array;
}): CredentialRequestOptions {
  const challenge = params.challenge || generateChallenge();
  const hostname = params.rpId || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

  const options: CredentialRequestOptions = {
    publicKey: {
      challenge: challenge as BufferSource,
      rpId: hostname === 'localhost' ? undefined : hostname,
      userVerification: 'preferred',
      timeout: 60000,
      allowCredentials: params.credentialId
        ? [
            {
              id: base64UrlToBuffer(params.credentialId) as BufferSource,
              type: 'public-key',
              transports: ['internal'],
            },
          ]
        : undefined,
    },
  };

  return options;
}

/**
 * Saves a registered biometric credential in client storage.
 */
export function saveBiometricCredential(cred: StoredBiometricCredential, storage = typeof localStorage !== 'undefined' ? localStorage : null): void {
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(cred));
}

/**
 * Retrieves the registered biometric credential from client storage.
 */
export function getStoredBiometricCredential(storage = typeof localStorage !== 'undefined' ? localStorage : null): StoredBiometricCredential | null {
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredBiometricCredential;
  } catch {
    return null;
  }
}

/**
 * Removes the registered biometric credential from client storage.
 */
export function removeBiometricCredential(storage = typeof localStorage !== 'undefined' ? localStorage : null): void {
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}

/**
 * Complete enrollment flow: triggers navigator.credentials.create, converts ID, and saves locally.
 */
export async function registerBiometricAuthenticator(params: {
  userId: string;
  userEmail: string;
  userDisplayName: string;
}): Promise<StoredBiometricCredential> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported by your current browser.');
  }

  const options = createRegisterCredentialOptions(params);
  const credential = (await navigator.credentials.create(options)) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Biometric registration was aborted or not provided.');
  }

  const credentialId = bufferToBase64Url(credential.rawId);
  const storedCred: StoredBiometricCredential = {
    credentialId,
    userId: params.userId,
    userEmail: params.userEmail,
    userDisplayName: params.userDisplayName,
    registeredAt: new Date().toISOString(),
    deviceName: detectPlatformAuthenticatorName(),
    algorithm: -7,
  };

  saveBiometricCredential(storedCred);
  return storedCred;
}

/**
 * Complete authentication flow: triggers navigator.credentials.get and verifies biometric.
 */
export async function authenticateWithBiometrics(targetCredentialId?: string): Promise<{
  success: boolean;
  credentialId: string;
  userEmail?: string;
  userId?: string;
}> {
  if (!isWebAuthnSupported()) {
    throw new Error('Biometric authentication is not supported on this browser.');
  }

  const stored = getStoredBiometricCredential();
  const credentialId = targetCredentialId || stored?.credentialId;

  const options = createLoginCredentialOptions({ credentialId });
  const assertion = (await navigator.credentials.get(options)) as PublicKeyCredential | null;

  if (!assertion) {
    throw new Error('Biometric verification was cancelled or failed.');
  }

  return {
    success: true,
    credentialId: bufferToBase64Url(assertion.rawId),
    userEmail: stored?.userEmail,
    userId: stored?.userId,
  };
}
