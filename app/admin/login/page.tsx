// app/admin/login/page.tsx
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/users';
import { verifyPassword } from '@/lib/hash';
import { setSession } from '@/lib/session';

async function adminLoginAction(formData: FormData) {
  'use server';

  const email = String(formData.get('email') || '')
    .toLowerCase()
    .trim();
  const password = String(formData.get('password') || '');

  const user = await getUserByEmail(email);
  if (!user || user.role !== 'admin') {
    throw new Error('Invalid credentials');
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new Error('Invalid credentials');
  }

  await setSession({ userId: user.id, role: user.role });
  redirect('/admin');
}

export default function AdminLoginPage() {
  return (
    <main className='flex justify-center'>
      <form
        action={adminLoginAction}
        className='w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4'
      >
        <h1 className='text-xl font-semibold'>Admin Login</h1>

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
            className='w-full border rounded px-3 py-2 text-sm'
          />
        </div>

        <button
          type='submit'
          className='w-full bg-gray-900 text-white rounded py-2 text-sm font-medium'
        >
          Sign in as admin
        </button>
      </form>
    </main>
  );
}
