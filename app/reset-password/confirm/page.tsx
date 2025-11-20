// app/reset-password/confirm/page.tsx
import { redirect } from 'next/navigation';
import {
  verifyPasswordResetToken,
  clearPasswordResetToken,
} from '@/lib/password-reset';
import { getUserById, updateUser } from '@/lib/users';
import { hashPassword } from '@/lib/hash';

type Props = {
  searchParams: {
    token?: string;
    uid?: string;
  };
};

async function resetAction(formData: FormData) {
  'use server';

  const token = String(formData.get('token') || '');
  const uid = String(formData.get('uid') || '');
  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirm') || '');

  if (!token || !uid) throw new Error('Invalid link');
  if (password !== confirm) throw new Error('Passwords do not match');
  if (password.length < 6) throw new Error('Password too short');

  const valid = await verifyPasswordResetToken(uid, token);
  if (!valid) throw new Error('Invalid or expired token');

  const user = await getUserById(uid);
  if (!user) throw new Error('User not found');

  user.passwordHash = await hashPassword(password);
  await updateUser(user);
  await clearPasswordResetToken(uid);

  redirect('/login');
}

export default function ConfirmResetPage({ searchParams }: Props) {
  const token = searchParams.token || '';
  const uid = searchParams.uid || '';

  if (!token || !uid) {
    return (
      <main>
        <p className='text-red-600 text-sm'>Invalid password reset link.</p>
      </main>
    );
  }

  return (
    <main className='flex justify-center'>
      <form
        action={resetAction}
        className='w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4'
      >
        <h1 className='text-xl font-semibold'>Set a new password</h1>

        <input type='hidden' name='token' value={token} />
        <input type='hidden' name='uid' value={uid} />

        <div className='space-y-1'>
          <label className='block text-sm font-medium'>New password</label>
          <input
            name='password'
            type='password'
            required
            minLength={6}
            className='w-full border rounded px-3 py-2 text-sm'
          />
        </div>

        <div className='space-y-1'>
          <label className='block text-sm font-medium'>Confirm password</label>
          <input
            name='confirm'
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
          Update password
        </button>
      </form>
    </main>
  );
}
