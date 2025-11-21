import { redirect } from 'next/navigation';
import {
  verifyPasswordResetToken,
  clearPasswordResetToken,
} from '@/lib/password-reset';
import { getUserById, updateUser } from '@/lib/users';
import { hashPassword } from '@/lib/hash';
import { Lock, ShieldCheck } from 'lucide-react';

type Props = {
  searchParams: Promise<{
    token?: string;
    uid?: string;
    error?: string;
  }>;
};

async function resetAction(formData: FormData) {
  'use server';

  const token = String(formData.get('token') || '');
  const uid = String(formData.get('uid') || '');
  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirm') || '');

  if (!token || !uid) {
    redirect('/reset-password/confirm?error=invalid_link');
  }

  if (password !== confirm) {
    redirect(`/reset-password/confirm?token=${token}&uid=${uid}&error=nomatch`);
  }

  if (password.length < 6) {
    redirect(`/reset-password/confirm?token=${token}&uid=${uid}&error=short`);
  }

  const valid = await verifyPasswordResetToken(uid, token);
  if (!valid) {
    redirect('/reset-password/confirm?error=expired');
  }

  const user = await getUserById(uid);
  if (!user) {
    redirect('/reset-password/confirm?error=missing_user');
  }

  user.passwordHash = await hashPassword(password);
  await updateUser(user);
  await clearPasswordResetToken(uid);

  redirect('/login?reset=success');
}

export default async function ConfirmResetPage({ searchParams }: Props) {
  const sp = await searchParams;

  const token = sp?.token || '';
  const uid = sp?.uid || '';
  const error = sp?.error;

  const errorMap: Record<string, string> = {
    invalid_link: 'Invalid password reset link.',
    nomatch: 'Passwords do not match.',
    short: 'Password must be at least 6 characters.',
    expired: 'This reset link has expired.',
    missing_user: 'User account not found.',
  };

  const errorMessage = error ? errorMap[error] : null;

  if (!token || !uid) {
    return (
      <main className='min-h-screen flex items-center justify-center px-4'>
        <div className='bg-white border border-gray-200 shadow-lg rounded-2xl p-6 text-center text-red-600 text-sm'>
          Invalid or expired password reset link.
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen flex items-center justify-center px-4'>
      <form
        action={resetAction}
        className='w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 border border-gray-200'
      >
        <div className='flex justify-center'>
          <div className='w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg'>
            <ShieldCheck className='text-white w-7 h-7' />
          </div>
        </div>

        <div className='text-center space-y-1'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Set a New Password
          </h1>
          <p className='text-sm text-gray-500'>
            Choose a strong password for your account
          </p>
        </div>

        {errorMessage && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center'>
            {errorMessage}
          </div>
        )}

        <input type='hidden' name='token' value={token} />
        <input type='hidden' name='uid' value={uid} />

        <div className='space-y-1'>
          <label className='text-sm font-medium text-gray-700'>
            New Password
          </label>
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
              name='confirm'
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
          Update Password
        </button>

        <div className='text-center'>
          <a href='/login' className='text-sm text-blue-600 hover:underline'>
            Back to Sign In
          </a>
        </div>
      </form>
    </main>
  );
}
