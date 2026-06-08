'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ImportJobStatusRoute() {
  const { importId } = useParams();
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 animate-fade-in">
      <div>
        <h3 className="text-sm font-black text-slate-900">Import Job Token: #{importId}</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Asynchronous Data Engine Analytics</p>
      </div>
      <div className="p-4 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-100">
        ✓ Package processing sequence complete. Data stream unified up-circuit.
      </div>
      <button onClick={() => router.push('/contacts')} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl">
        Return to Directory Dashboard
      </button>
    </div>
  );
}