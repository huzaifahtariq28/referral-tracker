import 'server-only';
import { kv } from './kv';
import { User } from './types';

function userKey(id: string) {
  return `user:${id}`;
}
function emailIndexKey(email: string) {
  return `user:email:${email}`;
}
function refCodeIndexKey(code: string) {
  return `user:referral:${code}`;
}

export async function getUserById(id: string) {
  return kv.get<User>(userKey(id));
}

export async function getUserByEmail(email: string) {
  const id = await kv.get<string>(emailIndexKey(email.toLowerCase()));
  return id ? getUserById(id) : null;
}

export async function getUserByReferralCode(code: string) {
  const id = await kv.get<string>(refCodeIndexKey(code));
  return id ? getUserById(id) : null;
}

export async function createUser(user: User) {
  await kv.set(userKey(user.id), user);

  await kv.set(emailIndexKey(user.email), user.id);

  if (user.role === 'affiliate') {
    await kv.sadd('users:affiliates', user.id);
  } else if (user.role === 'admin') {
    await kv.sadd('users:admins', user.id);
  }

  if (user.referralCode) {
    await kv.set(refCodeIndexKey(user.referralCode), user.id);
  }

  return user;
}

export async function updateUser(user: User) {
  await kv.set(userKey(user.id), user);
  return user;
}

export async function listAffiliates(): Promise<User[]> {
  const ids = await kv.smembers<string[]>('users:affiliates');
  if (!ids || ids.length === 0) return [];
  const users = await Promise.all(ids.map((id) => getUserById(id)));
  return users.filter(Boolean) as User[];
}
