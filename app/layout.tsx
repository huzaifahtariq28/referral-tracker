import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Referral Tracker',
  description: 'Simple referral tracking app',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body className='min-h-screen bg-gray-50'>
        <div className='max-w-4xl mx-auto px-4 py-6'>
          <header className='flex items-center justify-between mb-6'>
            <a href='/' className='text-lg font-semibold'>
              Referral Tracker
            </a>
            <nav className='space-x-3 text-sm'>
              <a href='/signup' className='text-gray-700 hover:text-blue-600'>
                Affiliate Signup
              </a>
              <a href='/login' className='text-gray-700 hover:text-blue-600'>
                Login
              </a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
