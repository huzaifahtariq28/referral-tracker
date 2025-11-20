'use client';

import { useState } from 'react';

export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className='flex items-center gap-2'>
      <input
        readOnly
        value={value}
        className='flex-1 border rounded px-3 py-2 text-sm bg-gray-50'
      />
      <button
        type='button'
        onClick={onCopy}
        className='px-3 py-2 text-xs rounded bg-gray-800 text-white'
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
