import { redirect } from 'next/navigation';
import { hashPassword } from '@/lib/hash';
import { createUser, getUserByEmail, getUserByReferralCode } from '@/lib/users';
import { incrementAffiliateCount, recordReferral } from '@/lib/referrals';
import { getInvite, markInviteUsed } from '@/lib/invites';
import { setSession } from '@/lib/session';
import { Role, User } from '@/lib/types';
import { UserPlus, User as UserIcon, Mail, Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    ref?: string;
    invite?: string;
    error?: string;
  }>;
};

async function signupAction(formData: FormData) {
  'use server';

  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '')
    .toLowerCase()
    .trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');
  const ref = String(formData.get('ref') || '') || undefined;
  const invite = String(formData.get('invite') || '') || undefined;

  if (!name || !email || !password || !confirmPassword) {
    redirect('/signup?error=missing');
  }

  if (password !== confirmPassword) {
    redirect('/signup?error=password');
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    redirect('/signup?error=email');
  }

  if (invite) {
    const inviteObj = await getInvite(invite);
    if (!inviteObj || inviteObj.used || inviteObj.email !== email) {
      redirect('/signup?error=invite');
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
    fullName: name,
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

export default async function SignupPage({ searchParams }: Props) {
  const sp = await searchParams;

  const ref = sp?.ref || '';
  const invite = sp?.invite || '';
  const error = sp?.error;

  let errorMessage = '';

  if (error === 'missing') errorMessage = 'All fields are required.';
  if (error === 'password') errorMessage = 'Passwords do not match.';
  if (error === 'email') errorMessage = 'Email is already in use.';
  if (error === 'invite') errorMessage = 'Invalid or used invite link.';

  return (
    <main className='min-h-screen flex items-center justify-center px-4'>
      <form
        action={signupAction}
        className='w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-5 border border-gray-200'
      >
        <div className='flex justify-center'>
          <div className='w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg'>
            <UserPlus className='text-white w-7 h-7' />
          </div>
        </div>

        <div className='text-center space-y-1'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Join as Affiliate
          </h1>
          <p className='text-sm text-gray-500'>
            Create your account to start earning referrals
          </p>
        </div>

        {ref && (
          <p className='text-sm text-gray-600 text-center'>
            Referred by code:{' '}
            <span className='font-mono bg-gray-100 px-2 py-1 rounded'>
              {ref}
            </span>
          </p>
        )}

        {invite && (
          <p className='text-sm text-gray-600 text-center'>
            You are joining via an invitation.
          </p>
        )}

        {errorMessage && (
          <div className='bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm text-center'>
            {errorMessage}
          </div>
        )}

        <input type='hidden' name='ref' value={ref} />
        <input type='hidden' name='invite' value={invite} />

        <div className='space-y-1'>
          <label className='text-sm font-medium text-gray-700'>Full Name</label>
          <div className='relative'>
            <UserIcon className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              name='name'
              type='text'
              placeholder='John Doe'
              required
              className='w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-sm font-medium text-gray-700'>
            Email Address
          </label>
          <div className='relative'>
            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              name='email'
              type='email'
              placeholder='you@example.com'
              required
              className='w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-sm font-medium text-gray-700'>Password</label>
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              name='password'
              type='password'
              required
              minLength={6}
              placeholder='••••••••'
              className='w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-sm font-medium text-gray-700'>
            Confirm Password
          </label>
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              name='confirmPassword'
              type='password'
              required
              minLength={6}
              placeholder='••••••••'
              className='w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <button
          type='submit'
          className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-3 transition'
        >
          Sign Up
        </button>

        <p className='text-sm text-center text-gray-600'>
          Already have an account?{' '}
          <a href='/login' className='text-blue-600 hover:underline'>
            Sign In
          </a>
        </p>
      </form>
    </main>
  );
}
