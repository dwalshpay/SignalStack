import { createHash } from 'crypto';

/**
 * Consumer email domain blocklist
 * From frontend: /src/lib/constants.ts
 */
const CONSUMER_EMAIL_DOMAINS = new Set([
  // Global
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'hotmail.com',
  'hotmail.co.uk',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'zoho.com',
  'gmx.com',
  'gmx.net',
  'mail.com',
  // Australia
  'bigpond.com',
  'bigpond.net.au',
  'optusnet.com.au',
  'ozemail.com.au',
  'tpg.com.au',
  'internode.on.net',
  'dodo.com.au',
  // Regional
  'qq.com',
  '163.com',
  '126.com',
  'mail.ru',
  'yandex.ru',
  'yandex.com',
  'naver.com',
  'daum.net',
  'web.de',
  'orange.fr',
  'free.fr',
  'libero.it',
  'wp.pl',
  'o2.pl',
]);

/**
 * Hash email using SHA-256 (Meta CAPI requirement)
 * Normalizes to lowercase and trims whitespace before hashing
 */
export function hashEmail(email: string): string {
  const normalized = email.toLowerCase().trim();
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Hash phone number using SHA-256 (Meta CAPI requirement)
 * Removes all non-numeric characters before hashing
 */
export function hashPhone(phone: string): string {
  // Remove all non-numeric characters except leading +
  const normalized = phone.replace(/[^\d+]/g, '');
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Hash any data using SHA-256
 */
export function hashData(data: string): string {
  return createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Check if email is from a consumer domain
 */
export function isConsumerEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  return domain ? CONSUMER_EMAIL_DOMAINS.has(domain) : false;
}

/**
 * Get email type (business or consumer)
 */
export function getEmailType(email: string): 'business' | 'consumer' {
  return isConsumerEmail(email) ? 'consumer' : 'business';
}

/**
 * Normalize phone to E.164 format (basic normalization)
 * For proper E.164, you'd want a library like libphonenumber
 */
export function normalizePhone(phone: string, defaultCountryCode: string = '+61'): string {
  // Remove all non-numeric characters except leading +
  let normalized = phone.replace(/[^\d+]/g, '');

  // If no country code, add default
  if (!normalized.startsWith('+')) {
    // Remove leading 0 if present (common in AU numbers)
    if (normalized.startsWith('0')) {
      normalized = normalized.slice(1);
    }
    normalized = defaultCountryCode + normalized;
  }

  return normalized;
}
