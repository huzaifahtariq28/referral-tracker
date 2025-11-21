import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/users';
import { verifyPassword } from '@/lib/hash';
import { setSession } from '@/lib/session';
import { Mail, Lock, LogIn } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function loginAction(formData: FormData) {
  'use server';

  const email = String(formData.get('email') || '')
    .toLowerCase()
    .trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    redirect('/login?error=missing_fields');
  }

  const user = await getUserByEmail(email);
  if (!user) {
    redirect('/login?error=invalid');
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    redirect('/login?error=invalid');
  }

  await setSession({ userId: user.id, role: user.role });

  if (user.role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const error = sp?.error;

  const errorMap: Record<string, string> = {
    missing_fields: 'Please fill in all fields.',
    invalid: 'Invalid email or password.',
  };

  const errorMessage = error ? errorMap[error] : null;

  return (
    <main className='min-h-screen flex items-center justify-center px-4'>
      <form
        action={loginAction}
        className='w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 border border-gray-200'
      >
        <div className='flex justify-center'>
          <div className='w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg'>
            <LogIn className='text-white w-7 h-7' />
          </div>
        </div>

        <div className='text-center space-y-1'>
          <h1 className='text-2xl font-bold text-gray-900'>Welcome back</h1>
          <p className='text-sm text-gray-500'>Sign in to your account</p>
        </div>

        {errorMessage && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center'>
            {errorMessage}
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

        <div className='space-y-1'>
          <label className='text-sm font-medium text-gray-700'>Password</label>
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              name='password'
              type='password'
              required
              placeholder='••••••••'
              className='w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <button
          type='submit'
          className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-3 transition'
        >
          Sign In
        </button>

        <div className='flex justify-between text-sm text-gray-500'>
          <Link
            href='/reset-password'
            className='text-blue-600 hover:underline'
          >
            Forgot password?
          </Link>

          <Link href='/signup' className='text-blue-600 hover:underline'>
            Create account
          </Link>
        </div>
      </form>
    </main>
  );
}
