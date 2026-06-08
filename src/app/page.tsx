'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/contacts');
  }, [router]);

  return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="h-4 w-4 rounded-full border-2 border-slate-200 border-t-emerald-600 animate-spin"></div>
        <span className="text-xs font-bold text-slate-600">Initializing Router Handshake...</span>
      </div>
    </div>
  );
}