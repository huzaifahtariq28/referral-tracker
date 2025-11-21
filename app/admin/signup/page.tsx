import { redirect } from 'next/navigation';
import { hashPassword } from '@/lib/hash';
import { createUser, getUserByEmail } from '@/lib/users';
import { setSession } from '@/lib/session';
import { User } from '@/lib/types';
import Link from 'next/link';
import { Shield, Mail, Lock, User as UserIcon } from 'lucide-react';

async function adminSignupAction(formData: FormData) {
  'use server';

  const fullName = String(formData.get('fullName') || '').trim();
  const email = String(formData.get('email') || '')
    .toLowerCase()
    .trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!fullName || !email || !password || !confirmPassword) {
    redirect('/admin/signup?error=missing_fields');
  }

  if (password !== confirmPassword) {
    redirect('/admin/signup?error=password_mismatch');
  }

  if (password.length < 8) {
    redirect('/admin/signup?error=weak_password');
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    redirect('/admin/signup?error=email_exists');
  }

  const passwordHash = await hashPassword(password);

  const user: User = {
    id: crypto.randomUUID(),
    fullName,
    email,
    passwordHash,
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  await createUser(user);
  await setSession({ userId: user.id, role: user.role });

  redirect('/admin');
}

export default async function AdminSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const error = sp?.error;

  const errors: Record<string, string> = {
    missing_fields: 'Please fill in all fields.',
    password_mismatch: 'Passwords do not match.',
    weak_password: 'Password must be at least 8 characters.',
    email_exists: 'This email is already in use.',
  };

  const message = error ? errors[error] : null;

  return (
    <main className='min-h-screen flex items-center justify-center px-4'>
      <form
        action={adminSignupAction}
        className='w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 border border-gray-200'
      >
        <div className='flex justify-center'>
          <div className='w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center shadow-lg'>
            <Shield className='text-white w-7 h-7' />
          </div>
        </div>

        <div className='text-center space-y-1'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Admin Account Setup
          </h1>
          <p className='text-sm text-gray-500'>
            Create a secure administrator account
          </p>
        </div>

        {message && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center'>
            {message}
          </div>
        )}

        <div className='space-y-1'>
          <label className='text-sm font-medium text-gray-700'>Full Name</label>
          <div className='relative'>
            <UserIcon className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              name='fullName'
              type='text'
              required
              placeholder='Admin Name'
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
              required
              placeholder='admin@example.com'
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
              minLength={8}
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
              minLength={8}
              placeholder='••••••••'
              className='w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <button
          type='submit'
          className='w-full bg-gray-900 hover:bg-black text-white font-medium rounded-lg py-3 transition'
        >
          Create Admin Account
        </button>

        <p className='text-sm text-center text-gray-500'>
          <Link href='/' className='text-blue-600 hover:underline'>
            Back to home
          </Link>
        </p>
      </form>
    </main>
  );
}
