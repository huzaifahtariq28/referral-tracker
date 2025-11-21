import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/users';
import { createPasswordResetToken } from '@/lib/password-reset';
import { sendPasswordResetEmail } from '@/lib/email';
import { Mail, KeyRound } from 'lucide-react';

type Props = {
  searchParams: Promise<{
    status?: string;
  }>;
};

async function requestResetAction(formData: FormData) {
  'use server';

  const email = String(formData.get('email') || '')
    .toLowerCase()
    .trim();

  if (!email) {
    redirect('/reset-password?status=invalid');
  }

  const user = await getUserByEmail(email);

  if (user) {
    const token = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail(user.email, token, user.id);
  }

  redirect('/reset-password?status=sent');
}

export default async function RequestResetPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = sp?.status;

  let message = null;
  let isError = false;

  if (status === 'sent') {
    message = 'If the email exists, a reset link has been sent.';
  }

  if (status === 'invalid') {
    message = 'Please enter a valid email address.';
    isError = true;
  }

  return (
    <main className='min-h-screen flex items-center justify-center px-4'>
      <form
        action={requestResetAction}
        className='w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 border border-gray-200'
      >
        <div className='flex justify-center'>
          <div className='w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg'>
            <KeyRound className='text-white w-7 h-7' />
          </div>
        </div>

        <div className='text-center space-y-1'>
          <h1 className='text-2xl font-bold text-gray-900'>Reset Password</h1>
          <p className='text-sm text-gray-500'>
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {message && (
          <div
            className={`px-4 py-3 rounded-lg text-sm text-center border ${
              isError
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            {message}
          </div>
        )}

        <div className='space-y-1'>
          <label className='text-sm font-medium text-gray-700'>
            Email Address
          </label>
          <div className='relative'>
            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              name='email'
              type='email'
              required
              placeholder='you@example.com'
              className='w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <button
          type='submit'
          className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-3 transition'
        >
          Send Reset Link
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
