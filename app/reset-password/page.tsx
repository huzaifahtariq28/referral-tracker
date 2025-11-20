// app/reset-password/page.tsx
import { getUserByEmail } from '@/lib/users';
import { createPasswordResetToken } from '@/lib/password-reset';
import { sendPasswordResetEmail } from '@/lib/email';

async function requestResetAction(formData: FormData) {
  'use server';

  const email = String(formData.get('email') || '')
    .toLowerCase()
    .trim();
  if (!email) return;

  const user = await getUserByEmail(email);
  // Do not reveal if user exists
  if (user) {
    const token = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail(user.email, token, user.id);
  }
}

export default function RequestResetPage() {
  return (
    <main className='flex justify-center'>
      <form
        action={requestResetAction}
        className='w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4'
      >
        <h1 className='text-xl font-semibold'>Reset password</h1>
        <p className='text-sm text-gray-600'>
          Enter your email and we&apos;ll send you a link to reset your
          password.
        </p>

        <div className='space-y-1'>
          <label className='block text-sm font-medium'>Email</label>
          <input
            name='email'
            type='email'
            required
            className='w-full border rounded px-3 py-2 text-sm'
          />
        </div>

        <button
          type='submit'
          className='w-full bg-blue-600 text-white rounded py-2 text-sm font-medium'
        >
          Send reset link
        </button>

        <p className='text-xs text-gray-500'>
          If the email exists, a reset link will be sent.
        </p>
      </form>
    </main>
  );
}
