export default function HomePage() {
  return (
    <main className='flex flex-col gap-4'>
      <h1 className='text-2xl font-bold'>Welcome</h1>
      <p className='text-gray-700'>
        This is a simple, secure referral tracking app. Affiliates can sign up,
        get a unique referral link, and track their referrals.
      </p>
      <div className='flex flex-col sm:flex-row gap-3 mt-4'>
        <a
          href='/signup'
          className='px-4 py-2 rounded-lg bg-blue-600 text-white text-center'
        >
          Become an affiliate
        </a>
        <a
          href='/login'
          className='px-4 py-2 rounded-lg border border-gray-300 text-center'
        >
          Sign in
        </a>
      </div>
    </main>
  );
}
