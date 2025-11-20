// app/admin/signup/page.tsx
import { redirect } from 'next/navigation';
import { hashPassword } from '@/lib/hash';
import { createUser, getUserByEmail } from '@/lib/users';
import { setSession } from '@/lib/session';
import { User } from '@/lib/types';

async function adminSignupAction(formData: FormData) {
  'use server';

  const email = String(formData.get('email') || '')
    .toLowerCase()
    .trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) throw new Error('Missing fields');

  const existing = await getUserByEmail(email);
  if (existing) throw new Error('Email already used');

  const passwordHash = await hashPassword(password);
  const user: User = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  await createUser(user);
  await setSession({ userId: user.id, role: user.role });

  redirect('/admin');
}

export default function AdminSignupPage() {
  return (
    <main className='flex justify-center'>
      <form
        action={adminSignupAction}
        className='w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4'
      >
        <h1 className='text-xl font-semibold'>Admin Signup</h1>

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
            minLength={8}
            className='w-full border rounded px-3 py-2 text-sm'
          />
        </div>

        <button
          type='submit'
          className='w-full bg-gray-900 text-white rounded py-2 text-sm font-medium'
        >
          Create admin
        </button>
      </form>
    </main>
  );
}
