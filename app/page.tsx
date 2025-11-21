export default function HomePage() {
  return (
    <main className='min-h-screen flex items-center justify-center px-4'>
      <div className='w-full max-w-3xl'>
        <div className='bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-200'>
          <div className='text-center space-y-4'>
            <div className='mx-auto w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl shadow-sm'>
              R
            </div>

            <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight'>
              Welcome to Referral Tracker
            </h1>

            <p className='text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed'>
              A simple and secure platform where affiliates can sign up,
              generate unique referral links, and track signups in real-time.
            </p>
          </div>

          <div className='mt-10 flex flex-col sm:flex-row gap-3 justify-center'>
            <a
              href='/signup'
              className='w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 text-white font-medium text-center hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]'
            >
              Become an Affiliate
            </a>

            <a
              href='/login'
              className='w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 font-medium text-center hover:bg-gray-50 transition-all shadow-sm hover:shadow-md active:scale-[0.98]'
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
