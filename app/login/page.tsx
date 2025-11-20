import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/users';
import { verifyPassword } from '@/lib/hash';
import { setSession } from '@/lib/session';

async function loginAction(formData: FormData) {
  'use server';

  const email = String(formData.get('email') || '')
    .toLowerCase()
    .trim();
  const password = String(formData.get('password') || '');

  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new Error('Invalid credentials');
  }

  await setSession({ userId: user.id, role: user.role });

  if (user.role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

export default function LoginPage() {
  return (
    <main className='flex justify-center'>
      <form
        action={loginAction}
        className='w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4'
      >
        <h1 className='text-xl font-semibold'>Sign in</h1>

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
          className='w-full bg-blue-600 text-white rounded py-2 text-sm font-medium'
        >
          Sign in
        </button>

        <div className='flex justify-between text-xs text-gray-500'>
          <a href='/reset-password' className='text-blue-600'>
            Forgot password?
          </a>
        </div>
      </form>
    </main>
  );
}
