import 'server-only';
import { kv } from './kv';
import { ReferralEvent, GlobalStats } from './types';

function referralKey(id: string) {
  return `referral:${id}`;
}

function referralByReferrerKey(refCode: string) {
  return `referrals:byRef:${refCode}`;
}

const GLOBAL_STATS_KEY = 'stats:global';

export async function recordReferral(
  referrerCode: string,
  referredUserId: string
) {
  const id = crypto.randomUUID();
  const event: ReferralEvent = {
    id,
    referrerCode,
    referredUserId,
    createdAt: new Date().toISOString(),
  };

  await kv.set(referralKey(id), event);
  await kv.sadd(referralByReferrerKey(referrerCode), id);

  // update global stats
  const stats = (await kv.get<GlobalStats>(GLOBAL_STATS_KEY)) || {
    totalAffiliates: 0,
    totalReferrals: 0,
  };
  stats.totalReferrals += 1;
  await kv.set(GLOBAL_STATS_KEY, stats);

  return event;
}

export async function incrementAffiliateCount() {
  const stats = (await kv.get<GlobalStats>(GLOBAL_STATS_KEY)) || {
    totalAffiliates: 0,
    totalReferrals: 0,
  };
  stats.totalAffiliates += 1;
  await kv.set(GLOBAL_STATS_KEY, stats);
}

export async function getGlobalStats() {
  const stats = (await kv.get<GlobalStats>(GLOBAL_STATS_KEY)) || {
    totalAffiliates: 0,
    totalReferrals: 0,
  };
  return stats;
}

export async function getReferralsForCode(refCode: string) {
  const ids = await kv.smembers<string[]>(referralByReferrerKey(refCode));
  if (!ids || ids.length === 0) return [];
  const events = await Promise.all(
    ids.map((id) => kv.get<ReferralEvent>(referralKey(id)))
  );
  return events.filter(Boolean) as ReferralEvent[];
}
