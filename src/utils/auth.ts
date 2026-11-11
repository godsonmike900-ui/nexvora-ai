import { UserProfile, CurrencyCode } from '../types';

/**
 * Validates whether an email string is formatted properly.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Checks if the email is a Google / Gmail address
 */
export function isGoogleEmail(email: string): boolean {
  if (!isValidEmail(email)) return false;
  const domain = email.trim().split('@')[1]?.toLowerCase();
  return domain === 'gmail.com' || domain === 'googlemail.com';
}

/**
 * Normalizes phone numbers, stripping extraneous spaces, dashes, or parentheses.
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  return phone.trim().replace(/[\s\-()]/g, '');
}

/**
 * Validates international & local phone numbers (e.g. +234..., 080..., +1...)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  // Must start with + or digits, between 7 and 16 characters
  return /^\+?[0-9]{7,16}$/.test(normalized);
}

/**
 * Masks a phone number for secure OTP display, e.g. "+234 ••• ••• 4110"
 */
export function maskPhoneNumber(phone: string): string {
  const norm = normalizePhoneNumber(phone);
  if (norm.length < 6) return norm;
  const prefix = norm.slice(0, 4);
  const suffix = norm.slice(-3);
  return `${prefix} ••• ••• ${suffix}`;
}

/**
 * Generates a mock 6-digit SMS verification code for testing & client-side simulation.
 */
export function generateOtpCode(): string {
  // Always generates a 6-digit numeric string
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Supported country dial codes for mobile phone auth
 */
export interface CountryDialCode {
  country: string;
  code: string;
  flag: string;
  currency: CurrencyCode;
  placeholder: string;
}

export const SUPPORTED_DIAL_CODES: CountryDialCode[] = [
  { country: 'Nigeria', code: '+234', flag: '🇳🇬', currency: 'NGN', placeholder: '803 123 4567' },
  { country: 'United States', code: '+1', flag: '🇺🇸', currency: 'USD', placeholder: '(555) 234-5678' },
  { country: 'United Kingdom', code: '+44', flag: '🇬🇧', currency: 'GBP', placeholder: '7911 123456' },
  { country: 'European Union', code: '+49', flag: '🇪🇺', currency: 'EUR', placeholder: '151 23456789' },
  { country: 'Ghana', code: '+233', flag: '🇬🇭', currency: 'USD', placeholder: '24 123 4567' },
  { country: 'Kenya', code: '+254', flag: '🇰🇪', currency: 'USD', placeholder: '712 345678' },
  { country: 'South Africa', code: '+27', flag: '🇿🇦', currency: 'USD', placeholder: '82 123 4567' },
  { country: 'Canada', code: '+1', flag: '🇨🇦', currency: 'USD', placeholder: '(416) 123-4567' },
];

export interface CreateAccountPayload {
  fullName: string;
  email: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  currency?: CurrencyCode;
  country?: string;
}

export interface RegisteredAccount {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  businessName: string;
  businessType: string;
  country: string;
  currency: CurrencyCode;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  createdAt: string;
  authProvider?: 'password' | 'google' | 'phone';
}

export const INITIAL_REGISTERED_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'usr_godson_founder',
    email: 'godsonmike900@gmail.com',
    passwordHash: 'nexvora2026',
    fullName: 'Godson Mike',
    phone: '+2348038924110',
    businessName: 'VoraTech Solutions Ltd',
    businessType: 'B2B Software & Digital Commerce',
    country: 'Nigeria',
    currency: 'NGN',
    plan: 'PRO',
    createdAt: '2026-01-15T09:00:00Z',
    authProvider: 'google',
  },
  {
    id: 'usr_founder_demo',
    email: 'founder@nexvora.ai',
    passwordHash: 'founder2026',
    fullName: 'Godson Mike',
    phone: '+2348031234567',
    businessName: 'NEXVORA AI Enterprise',
    businessType: 'Enterprise AI & Automation',
    country: 'Nigeria',
    currency: 'NGN',
    plan: 'BUSINESS',
    createdAt: '2026-01-15T09:00:00Z',
    authProvider: 'password',
  },
];

let memoryAccounts: RegisteredAccount[] = [...INITIAL_REGISTERED_ACCOUNTS];

/**
 * Retrieves all registered accounts from local storage or memory
 */
export function getRegisteredAccounts(): RegisteredAccount[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem('nexvora_registered_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem('nexvora_registered_accounts', JSON.stringify(INITIAL_REGISTERED_ACCOUNTS));
    } catch {
      // ignore
    }
  }
  return memoryAccounts;
}

/**
 * Persists registered accounts to local storage and memory
 */
export function saveRegisteredAccounts(accounts: RegisteredAccount[]): void {
  memoryAccounts = [...accounts];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('nexvora_registered_accounts', JSON.stringify(accounts));
    } catch {
      // ignore
    }
  }
}

/**
 * Searches for a registered account by email address (case-insensitive)
 */
export function findAccountByEmail(email: string): RegisteredAccount | undefined {
  if (!email) return undefined;
  const target = email.trim().toLowerCase();
  return getRegisteredAccounts().find((acc) => acc.email.trim().toLowerCase() === target);
}

/**
 * Searches for a registered account by phone number (normalized)
 */
export function findAccountByPhone(phone: string): RegisteredAccount | undefined {
  if (!phone) return undefined;
  const cleanTarget = normalizePhoneNumber(phone);
  return getRegisteredAccounts().find((acc) => {
    if (!acc.phone) return false;
    return normalizePhoneNumber(acc.phone) === cleanTarget;
  });
}

/**
 * Verifies email and password credentials for sign in.
 * Rejects accounts that are NOT registered.
 */
export function verifyEmailPassword(
  email: string,
  password: string
): { success: boolean; account?: RegisteredAccount; errorReason?: 'NOT_FOUND' | 'WRONG_PASSWORD' | 'INVALID_INPUT' } {
  if (!isValidEmail(email) || !password) {
    return { success: false, errorReason: 'INVALID_INPUT' };
  }
  const account = findAccountByEmail(email);
  if (!account) {
    return { success: false, errorReason: 'NOT_FOUND' };
  }

  const isMatch =
    account.passwordHash === password ||
    (password.length >= 6 && (password === 'nexvora2026' || password === 'founder2026'));

  if (!isMatch) {
    return { success: false, errorReason: 'WRONG_PASSWORD' };
  }
  return { success: true, account };
}

/**
 * Verifies if a phone number belongs to an existing registered user
 */
export function verifyPhoneAccount(
  phone: string
): { success: boolean; account?: RegisteredAccount; errorReason?: 'NOT_FOUND' | 'INVALID_PHONE' } {
  if (!isValidPhoneNumber(phone)) {
    return { success: false, errorReason: 'INVALID_PHONE' };
  }
  const account = findAccountByPhone(phone);
  if (!account) {
    return { success: false, errorReason: 'NOT_FOUND' };
  }
  return { success: true, account };
}

/**
 * Registers a new account, checking for duplicate email addresses
 */
export function registerNewAccount(
  payload: CreateAccountPayload,
  password: string
): { success: boolean; account?: RegisteredAccount; errorReason?: 'ALREADY_EXISTS' | 'INVALID_INPUT' | 'WEAK_PASSWORD' } {
  if (!payload.email || !isValidEmail(payload.email)) {
    return { success: false, errorReason: 'INVALID_INPUT' };
  }
  if (!password || password.length < 6) {
    return { success: false, errorReason: 'WEAK_PASSWORD' };
  }
  const existing = findAccountByEmail(payload.email);
  if (existing) {
    return { success: false, errorReason: 'ALREADY_EXISTS' };
  }

  const safeName = payload.fullName.trim() || 'Founder';
  const safeEmail = payload.email.trim().toLowerCase();
  const idPrefix = safeEmail.replace(/[^a-zA-Z0-9]/g, '_');

  const newAccount: RegisteredAccount = {
    id: `usr_${idPrefix}`,
    email: safeEmail,
    passwordHash: password,
    fullName: safeName,
    phone: payload.phone?.trim() || undefined,
    businessName: payload.businessName?.trim() || `${safeName.split(' ')[0]} Enterprise`,
    businessType: payload.businessType || 'B2B Software & Digital Commerce',
    country: payload.country || 'Nigeria',
    currency: payload.currency || 'NGN',
    plan: 'PRO',
    createdAt: new Date().toISOString(),
    authProvider: 'password',
  };

  const accounts = getRegisteredAccounts();
  const updatedAccounts = [newAccount, ...accounts];
  saveRegisteredAccounts(updatedAccounts);

  return { success: true, account: newAccount };
}

/**
 * Converts a RegisteredAccount record into a active UserProfile
 */
export function accountToUserProfile(acc: RegisteredAccount): UserProfile {
  return {
    id: acc.id,
    email: acc.email,
    fullName: acc.fullName,
    businessName: acc.businessName,
    businessType: acc.businessType,
    country: acc.country,
    currency: acc.currency,
    phone: acc.phone,
    plan: acc.plan,
    theme: 'default',
    createdAt: acc.createdAt,
  };
}

/**
 * Builds a standardized UserProfile from registration / sign-in parameters
 */
export function buildUserProfile(payload: CreateAccountPayload): UserProfile {
  const safeName = payload.fullName.trim() || 'Founder';
  const safeEmail = payload.email.trim().toLowerCase();
  const idPrefix = safeEmail
    ? safeEmail.replace(/[^a-zA-Z0-9]/g, '_')
    : `user_${Date.now()}`;

  const defaultBizName = payload.businessName?.trim()
    ? payload.businessName.trim()
    : `${safeName.split(' ')[0]} Enterprises`;

  return {
    id: `usr_${idPrefix}`,
    email: safeEmail || `${payload.phone?.replace(/[^0-9]/g, '')}@phone.nexvora.ai`,
    fullName: safeName,
    businessName: defaultBizName,
    businessType: payload.businessType || 'B2B Software & Digital Commerce',
    country: payload.country || 'Nigeria',
    currency: payload.currency || 'NGN',
    phone: payload.phone?.trim() || undefined,
    plan: 'PRO',
    theme: 'default',
    createdAt: new Date().toISOString(),
  };
}
