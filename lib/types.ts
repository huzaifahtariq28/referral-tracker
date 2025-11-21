export type Role = 'affiliate' | 'admin';

export type User = {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  referralCode?: string;
  referredBy?: string | null;
  createdAt: string;
};

export type ReferralEvent = {
  id: string;
  referrerCode: string;
  referredUserId: string;
  createdAt: string;
};

export type GlobalStats = {
  totalAffiliates: number;
  totalReferrals: number;
};

export type PasswordResetToken = {
  userId: string;
  tokenHash: string;
  expiresAt: string;
};

export type AffiliateInvite = {
  id: string;
  email: string;
  inviteCode: string;
  createdByAdminId: string;
  createdAt: string;
  used: boolean;
};
