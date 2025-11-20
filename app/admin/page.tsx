// app/admin/page.tsx
import { requireAdmin } from '@/lib/session';
import { getGlobalStats } from '@/lib/referrals';
import { listAffiliates } from '@/lib/users';
import { createAffiliateInvite } from '@/lib/invites';
import { sendAffiliateInviteEmail } from '@/lib/email';

async function inviteAction(formData: FormData) {
  'use server';
  const session = await requireAdmin();
  const email = String(formData.get('email') || '')
    .toLowerCase()
    .trim();
  if (!email) throw new Error('Email required');

  const invite = await createAffiliateInvite(email, session.userId);
  await sendAffiliateInviteEmail(email, invite.inviteCode);
}

export default async function AdminDashboardPage() {
  const _admin = await requireAdmin();
  const stats = await getGlobalStats();
  const affiliates = await listAffiliates();

  return (
    <main className='space-y-6'>
      <h1 className='text-2xl font-semibold'>Admin Dashboard</h1>

      <section className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='bg-white rounded-xl shadow p-4'>
          <p className='text-sm text-gray-500'>Total affiliates</p>
          <p className='text-3xl font-bold'>{stats.totalAffiliates}</p>
        </div>
        <div className='bg-white rounded-xl shadow p-4'>
          <p className='text-sm text-gray-500'>Total referrals</p>
          <p className='text-3xl font-bold'>{stats.totalReferrals}</p>
        </div>
      </section>

      <section className='bg-white rounded-xl shadow p-4 space-y-3'>
        <h2 className='text-sm font-semibold text-gray-700'>
          Invite new affiliate
        </h2>
        <form action={inviteAction} className='flex flex-col sm:flex-row gap-3'>
          <input
            name='email'
            type='email'
            placeholder='affiliate@example.com'
            required
            className='flex-1 border rounded px-3 py-2 text-sm'
          />
          <button
            type='submit'
            className='px-4 py-2 rounded bg-blue-600 text-white text-sm'
          >
            Send invite
          </button>
        </form>
        <p className='text-xs text-gray-500'>
          An email with a signup link will be sent to the provided address.
        </p>
      </section>

      <section className='bg-white rounded-xl shadow p-4 space-y-3'>
        <h2 className='text-sm font-semibold text-gray-700'>Affiliates</h2>
        {affiliates.length === 0 ? (
          <p className='text-sm text-gray-500'>No affiliates yet.</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='border-b bg-gray-50'>
                  <th className='text-left py-2 px-2'>Email</th>
                  <th className='text-left py-2 px-2'>Code</th>
                  <th className='text-left py-2 px-2'>Referred by</th>
                  <th className='text-left py-2 px-2'>Joined</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((a) => (
                  <tr key={a.id} className='border-b last:border-0'>
                    <td className='py-2 px-2'>{a.email}</td>
                    <td className='py-2 px-2 font-mono'>
                      {a.referralCode || '-'}
                    </td>
                    <td className='py-2 px-2'>
                      {a.referredBy ? a.referredBy : '-'}
                    </td>
                    <td className='py-2 px-2'>
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <form action={logoutAction}>
        <button
          type='submit'
          className='text-sm text-red-600 hover:text-red-800'
        >
          Log out
        </button>
      </form>
    </main>
  );
}

async function logoutAction() {
  'use server';
  const { clearSession } = await import('@/lib/session');
  await clearSession();
}
