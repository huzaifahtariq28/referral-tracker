// app/dashboard/page.tsx
import { requireAuth } from '@/lib/session';
import { getUserById, getUserByReferralCode } from '@/lib/users';
import { getReferralsForCode } from '@/lib/referrals';
import { CopyField } from '@/components/CopyField';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export default async function DashboardPage() {
  const session = await requireAuth();
  const user = await getUserById(session.userId);

  if (!user || user.role !== 'affiliate') {
    throw new Error('Not an affiliate');
  }

  const referralCode = user.referralCode!;
  const referralLink = `${APP_URL}/signup?ref=${encodeURIComponent(
    referralCode
  )}`;

  const events = await getReferralsForCode(referralCode);

  return (
    <main className='space-y-6'>
      <h1 className='text-2xl font-semibold'>Affiliate Dashboard</h1>

      <section className='bg-white rounded-xl shadow p-4 space-y-2'>
        <h2 className='text-sm font-medium text-gray-700'>
          Your referral link
        </h2>
        <CopyField value={referralLink} />
      </section>

      <section className='bg-white rounded-xl shadow p-4 space-y-3'>
        <div className='flex flex-wrap justify-between items-center gap-3'>
          <div>
            <h2 className='text-sm font-medium text-gray-700'>
              Total referrals
            </h2>
            <p className='text-3xl font-bold'>{events.length}</p>
          </div>
        </div>

        <div className='mt-4'>
          <h3 className='text-sm font-semibold text-gray-700 mb-2'>
            Your referrals
          </h3>
          {events.length === 0 ? (
            <p className='text-sm text-gray-500'>
              No one has signed up using your link yet.
            </p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr className='border-b bg-gray-50'>
                    <th className='text-left py-2 px-2'>Email</th>
                    <th className='text-left py-2 px-2'>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {await Promise.all(
                    events.map(async (ev) => {
                      const u = await getUserById(ev.referredUserId);
                      return {
                        ev,
                        email: u?.email ?? 'Unknown',
                      };
                    })
                  ).then((rows) =>
                    rows.map(({ ev, email }) => (
                      <tr key={ev.id} className='border-b last:border-0'>
                        <td className='py-2 px-2'>
                          {/* mask email slightly */}
                          {email.replace(/(.{2}).+(@.+)/, '$1***$2')}
                        </td>
                        <td className='py-2 px-2'>
                          {new Date(ev.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
