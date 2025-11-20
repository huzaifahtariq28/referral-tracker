import 'server-only';
import { kv } from './kv';
import { AffiliateInvite } from './types';

function inviteKey(code: string) {
  return `invite:${code}`;
}

export async function createAffiliateInvite(
  email: string,
  createdByAdminId: string
) {
  const id = crypto.randomUUID();
  const inviteCode = crypto.randomUUID().slice(0, 8);
  const invite: AffiliateInvite = {
    id,
    email: email.toLowerCase(),
    inviteCode,
    createdByAdminId,
    createdAt: new Date().toISOString(),
    used: false,
  };
  await kv.set(inviteKey(inviteCode), invite);
  return invite;
}

export async function getInvite(inviteCode: string) {
  return kv.get<AffiliateInvite>(inviteKey(inviteCode));
}

export async function markInviteUsed(inviteCode: string) {
  const invite = await getInvite(inviteCode);
  if (!invite) return null;
  invite.used = true;
  await kv.set(inviteKey(inviteCode), invite);
  return invite;
}
