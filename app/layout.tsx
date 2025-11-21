import './globals.css';
import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Referral Tracker',
  description: 'Simple referral tracking app',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body className='min-h-screen bg-white text-gray-900'>
        <div className='max-w-4xl mx-auto px-4 py-6'>
          <header className='flex items-center justify-between pb-4'>
            <Link href='/' className='text-xl font-semibold text-gray-900'>
              Referral Tracker
            </Link>

            <nav className='flex items-center gap-4 text-sm'>
              <Link
                href='/signup'
                className='text-gray-600 hover:text-gray-900 transition'
              >
                Sign Up
              </Link>

              <Link
                href='/login'
                className='text-gray-600 hover:text-gray-900 transition'
              >
                Login
              </Link>
            </nav>
          </header>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
