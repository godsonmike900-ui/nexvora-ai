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
