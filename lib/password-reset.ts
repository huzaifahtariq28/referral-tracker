import 'server-only';
import { kv } from './kv';
import { PasswordResetToken } from './types';
import { sha256 } from './hash';

function resetKey(userId: string) {
  return `passwordReset:${userId}`;
}

export async function createPasswordResetToken(userId: string) {
  const rawToken = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const token: PasswordResetToken = {
    userId,
    tokenHash,
    expiresAt,
  };

  await kv.set(resetKey(userId), token);

  return rawToken;
}

export async function verifyPasswordResetToken(userId: string, token: string) {
  const stored = await kv.get<PasswordResetToken>(resetKey(userId));
  if (!stored) return false;
  if (new Date(stored.expiresAt).getTime() < Date.now()) return false;
  const hash = sha256(token);
  return stored.tokenHash === hash;
}

export async function clearPasswordResetToken(userId: string) {
  await kv.del(resetKey(userId));
}
