'use client';

import React, { useState } from 'react';
import type { Tag } from '../../../types/contact';

export default function NextTagSettingsPage() {
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: 'Lead', color: 'bg-blue-500' },
    { id: '2', name: 'Customer', color: 'bg-emerald-500' }
  ]);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Tag Configuration Engine</h1>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">Manage taxonomy labels for data filtering</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tags.map((tag) => (
          <div key={tag.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${tag.color || 'bg-slate-400'}`}></span>
              <span className="text-xs font-bold text-slate-700">{tag.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}