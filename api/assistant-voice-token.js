import { createHmac, timingSafeEqual } from 'node:crypto';

const TTL_MS = 5 * 60 * 1000;

function signature(text, expires, key) {
  return createHmac('sha256', `ankur-ai-twin-voice:${key}`).update(`${expires}:${text}`).digest('hex');
}

export function signVoice(text, key, now = Date.now()) {
  if (!key) return null;
  const expires = now + TTL_MS;
  return `${expires}.${signature(text, expires, key)}`;
}

export function verifyVoice(text, token, key, now = Date.now()) {
  if (typeof text !== 'string' || typeof token !== 'string' || !key) return false;
  const [rawExpires, rawSignature, extra] = token.split('.');
  const expires = Number(rawExpires);
  if (extra || !Number.isSafeInteger(expires) || expires < now || expires > now + TTL_MS || !/^[a-f0-9]{64}$/.test(rawSignature || '')) return false;
  const actual = Buffer.from(rawSignature, 'hex');
  const expected = Buffer.from(signature(text, expires, key), 'hex');
  return timingSafeEqual(actual, expected);
}
