import 'server-only';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function sha256(input: string) {
  return createHash('sha256').update(input).digest('hex');
}
