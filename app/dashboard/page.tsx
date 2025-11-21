import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/session';
import { getUserById } from '@/lib/users';
import { getReferralsForCode } from '@/lib/referrals';
import { CopyField } from '@/components/CopyField';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const error = sp?.error;

  const session = await requireAuth();
  const user = await getUserById(session.userId);

  if (!user || user.role !== 'affiliate') {
    redirect('/?error=not_authorized');
  }

  const referralCode = user.referralCode!;
  const referralLink = `${APP_URL}/signup?ref=${encodeURIComponent(
    referralCode
  )}`;

  const events = await getReferralsForCode(referralCode);

  const errorMap: Record<string, string> = {
    session_expired: 'Your session expired. Please log in again.',
  };

  const errorMessage = error ? errorMap[error] : null;

  return (
    <main className='space-y-8 px-2 sm:px-0'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
          Affiliate Dashboard
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

      <section className='bg-white rounded-2xl shadow-lg p-5 border border-gray-200 space-y-3'>
        <h2 className='text-sm font-semibold text-gray-700'>
          Your Referral Link
        </h2>
        <CopyField value={referralLink} />
      </section>

      <section className='bg-white rounded-2xl shadow-lg p-5 border border-gray-200 space-y-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h2 className='text-sm font-medium text-gray-600 uppercase tracking-wide'>
              Total Referrals
            </h2>
            <p className='text-4xl font-extrabold text-blue-600'>
              {events.length}
            </p>
          </div>
        </div>

        <div>
          <h3 className='text-sm font-semibold text-gray-700 mb-3'>
            Your Referrals
          </h3>

          {events.length === 0 ? (
            <div className='text-sm text-gray-500 bg-gray-50 rounded-lg p-4'>
              No one has signed up using your link yet.
            </div>
          ) : (
            <div className='overflow-x-auto rounded-lg border border-gray-200'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr className='bg-gray-100 text-gray-600 uppercase text-xs tracking-wider'>
                    <th className='text-left py-3 px-4'>Email</th>
                    <th className='text-left py-3 px-4'>Joined</th>
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
                      <tr
                        key={ev.id}
                        className='border-t hover:bg-gray-50 transition'
                      >
                        <td className='py-3 px-4 font-mono text-gray-800'>
                          {email.replace(/(.{2}).+(@.+)/, '$1***$2')}
                        </td>
                        <td className='py-3 px-4 text-gray-500'>
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
    </main>
  );
}

async function logoutAction() {
  'use server';
  const { clearSession } = await import('@/lib/session');
  await clearSession();
  redirect('/?message=logged_out');
}
