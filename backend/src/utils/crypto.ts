import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt an object using AES-256-GCM
 * Returns a Buffer containing: iv (16 bytes) + authTag (16 bytes) + encrypted data
 */
export function encrypt(data: object): Buffer {
  const key = getEncryptionKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const text = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: iv (16) + authTag (16) + encrypted
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypt a Buffer that was encrypted with the encrypt function
 */
export function decrypt<T = object>(buffer: Buffer): T {
  const key = getEncryptionKey();
  const iv = buffer.subarray(0, 16);
  const authTag = buffer.subarray(16, 32);
  const encrypted = buffer.subarray(32);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8')) as T;
}

/**
 * Hash data using SHA-256 (for PII like email, phone)
 */
export function hashData(data: string): string {
  return createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Generate a random API key
 * Format: sk_live_<32 random hex chars>
 */
export function generateApiKey(): string {
  const randomPart = randomBytes(16).toString('hex');
  return `sk_live_${randomPart}`;
}

/**
 * Generate a secure random token (for invites, etc.)
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}
