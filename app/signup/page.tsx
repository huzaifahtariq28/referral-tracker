import { redirect } from 'next/navigation';
import { hashPassword } from '@/lib/hash';
import { createUser, getUserByEmail, getUserByReferralCode } from '@/lib/users';
import { incrementAffiliateCount, recordReferral } from '@/lib/referrals';
import {
  createAffiliateInvite,
  getInvite,
  markInviteUsed,
} from '@/lib/invites';
import { setSession } from '@/lib/session';
import { Role, User } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: {
    ref?: string;
    invite?: string;
  };
};

async function signupAction(formData: FormData) {
  'use server';

  const email = String(formData.get('email') || '')
    .toLowerCase()
    .trim();
  const password = String(formData.get('password') || '');
  const ref = String(formData.get('ref') || '') || undefined;
  const invite = String(formData.get('invite') || '') || undefined;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error('Email already in use');
  }

  if (invite) {
    const inviteObj = await getInvite(invite);
    if (!inviteObj || inviteObj.used || inviteObj.email !== email) {
      throw new Error('Invalid or used invite');
    }
  }

  const passwordHash = await hashPassword(password);

  const id = crypto.randomUUID();
  const referralCode =
    email.split('@')[0].replace(/[^a-z0-9]/gi, '') + '-' + id.slice(0, 6);

  let referredBy: string | null = null;
  const role: Role = 'affiliate';

  if (ref) {
    const referrer = await getUserByReferralCode(ref);
    if (referrer && referrer.role === 'affiliate') {
      referredBy = ref;
    }
  }

  const user: User = {
    id,
    email,
    passwordHash,
    role,
    referralCode,
    referredBy,
    createdAt: new Date().toISOString(),
  };

  await createUser(user);
  await incrementAffiliateCount();

  if (referredBy) {
    await recordReferral(referredBy, user.id);
  }

  if (invite) {
    await markInviteUsed(invite);
  }

  await setSession({ userId: user.id, role: user.role });

  redirect('/dashboard');
}

export default function SignupPage({ searchParams }: Props) {
  const ref = searchParams.ref || '';
  const invite = searchParams.invite || '';

  return (
    <main className='flex justify-center'>
      <form
        action={signupAction}
        className='w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4'
      >
        <h1 className='text-xl font-semibold'>Affiliate Signup</h1>

        {ref && (
          <p className='text-sm text-gray-600'>
            You were referred with code:{' '}
            <span className='font-mono bg-gray-100 px-2 py-1 rounded'>
              {ref}
            </span>
          </p>
        )}
        {invite && (
          <p className='text-sm text-gray-600'>
            You are joining via an invite.
          </p>
        )}

        <input type='hidden' name='ref' value={ref} />
        <input type='hidden' name='invite' value={invite} />

        <div className='space-y-1'>
          <label className='block text-sm font-medium'>Email</label>
          <input
            name='email'
            type='email'
            required
            className='w-full border rounded px-3 py-2 text-sm'
          />
        </div>

        <div className='space-y-1'>
          <label className='block text-sm font-medium'>Password</label>
          <input
            name='password'
            type='password'
            required
            minLength={6}
            className='w-full border rounded px-3 py-2 text-sm'
          />
        </div>

        <button
          type='submit'
          className='w-full bg-blue-600 text-white rounded py-2 text-sm font-medium'
        >
          Create affiliate account
        </button>

        <p className='text-xs text-gray-500 text-center'>
          Already have an account?{' '}
          <a href='/login' className='text-blue-600'>
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}
