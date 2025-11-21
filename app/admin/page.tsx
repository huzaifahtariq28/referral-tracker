import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import { getGlobalStats, getReferralsForCode } from '@/lib/referrals';
import { listAffiliates, getUserById } from '@/lib/users';
import { createAffiliateInvite } from '@/lib/invites';
import { sendAffiliateInviteEmail } from '@/lib/email';

async function inviteAction(formData: FormData) {
  'use server';

  const session = await requireAdmin();
  const email = String(formData.get('email') || '')
    .toLowerCase()
    .trim();

  if (!email) {
    redirect('/admin?error=missing_email');
  }

  const invite = await createAffiliateInvite(email, session.userId);
  await sendAffiliateInviteEmail(email, invite.inviteCode);
  redirect('/admin?success=invite_sent');
}

async function logoutAction() {
  'use server';
  const { clearSession } = await import('@/lib/session');
  await clearSession();
  redirect('/');
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const sp = await searchParams;
  const stats = await getGlobalStats();
  const affiliates = await listAffiliates();

  const error = sp?.error;
  const success = sp?.success;

  const errorMap: Record<string, string> = {
    missing_email: 'Please enter an email address.',
  };

  const successMap: Record<string, string> = {
    invite_sent: 'Invite email sent successfully.',
  };

  const errorMessage = error ? errorMap[error] : null;
  const successMessage = success ? successMap[success] : null;

  const affiliatesWithStats = await Promise.all(
    affiliates.map(async (a) => {
      const referrals = a.referralCode
        ? await getReferralsForCode(a.referralCode)
        : [];

      const recent = await Promise.all(
        referrals.slice(-3).map(async (r) => {
          const u = await getUserById(r.referredUserId);
          return u?.email ?? 'Unknown';
        })
      );

      const masked = recent.map((email) =>
        email.replace(/(.{2}).+(@.+)/, '$1***$2')
      );

      return {
        ...a,
        referralCount: referrals.length,
        recentReferrals: masked,
      };
    })
  );

  return (
    <main className='space-y-8 px-2 sm:px-0'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
          Admin Dashboard
        </h1>

        <form action={logoutAction}>
          <button
            type='submit'
            className='text-sm text-red-600 hover:text-red-800 font-medium'
          >
            Log out
          </button>
        </form>
      </div>

      {errorMessage && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center'>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center'>
          {successMessage}
        </div>
      )}

      <section className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-5 text-white'>
          <p className='text-sm opacity-90'>Total Affiliates</p>
          <p className='text-3xl font-extrabold mt-2'>
            {stats.totalAffiliates}
          </p>
        </div>

        <div className='bg-linear-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-5 text-white'>
          <p className='text-sm opacity-90'>Total Referrals</p>
          <p className='text-3xl font-extrabold mt-2'>{stats.totalReferrals}</p>
        </div>
      </section>

      <section className='bg-white rounded-2xl shadow-lg p-5 border border-gray-200 space-y-4'>
        <h2 className='text-lg font-semibold text-gray-800'>
          Invite New Affiliate
        </h2>

        <form action={inviteAction} className='flex flex-col sm:flex-row gap-3'>
          <input
            name='email'
            type='email'
            placeholder='affiliate@example.com'
            required
            className='flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button
            type='submit'
            className='px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition'
          >
            Send Invite
          </button>
        </form>

        <p className='text-xs text-gray-500'>
          An email with a signup link will be sent.
        </p>
      </section>

      <section className='bg-white rounded-2xl shadow-lg p-5 border border-gray-200 space-y-4'>
        <h2 className='text-lg font-semibold text-gray-800'>
          Affiliates & Stats
        </h2>

        {affiliatesWithStats.length === 0 ? (
          <p className='text-sm text-gray-500'>No affiliates yet.</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full text-sm border-collapse'>
              <thead>
                <tr className='bg-gray-100 text-gray-600 uppercase text-xs tracking-wider'>
                  <th className='text-left py-3 px-3'>Email</th>
                  <th className='text-left py-3 px-3'>Code</th>
                  <th className='text-left py-3 px-3'>Referred By</th>
                  <th className='text-left py-3 px-3'>Referrals</th>
                  <th className='text-left py-3 px-3'>Recent Referrals</th>
                  <th className='text-left py-3 px-3'>Joined</th>
                </tr>
              </thead>
              <tbody>
                {affiliatesWithStats.map((a) => (
                  <tr
                    key={a.id}
                    className='border-b last:border-0 hover:bg-gray-50 transition'
                  >
                    <td className='py-3 px-3'>{a.email}</td>
                    <td className='py-3 px-3 font-mono text-blue-600'>
                      {a.referralCode || '-'}
                    </td>
                    <td className='py-3 px-3'>{a.referredBy || '-'}</td>
                    <td className='py-3 px-3 font-semibold'>
                      {a.referralCount}
                    </td>
                    <td className='py-3 px-3 text-gray-500 text-xs'>
                      {a.recentReferrals.length === 0
                        ? '-'
                        : a.recentReferrals.join(', ')}
                    </td>
                    <td className='py-3 px-3 text-gray-500'>
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
