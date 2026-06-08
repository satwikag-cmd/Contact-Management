'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function ImportHistoryRoute() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Ingestion Archival Log</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Historical Upload Operations Ledger</p>
        </div>
        <button onClick={() => router.push('/contacts')} className="text-xs font-black uppercase text-slate-400 hover:text-slate-600">
          Return Home
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-xs text-slate-400 text-center font-bold uppercase tracking-wider">
        No background migration history on this ledger partition instance.
      </div>
    </div>
  );
}