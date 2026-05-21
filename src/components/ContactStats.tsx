// src/components/ContactStats.tsx
import React from 'react';
import type { Contact } from '../types/contact';

interface ContactStatsProps {
  contacts: Contact[];
}

export const ContactStats: React.FC<ContactStatsProps> = ({ contacts }) => {
  const total = contacts.length;
  const active = contacts.filter(c => c.status === 'Active').length;
  const inactive = total - active;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Card 1 */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex items-center justify-between hover:shadow-md transition-all">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Directory</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{total}</h3>
        </div>
        <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          📁
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex items-center justify-between hover:shadow-md transition-all">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Status</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">{active}</h3>
        </div>
        <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          ⚡
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex items-center justify-between hover:shadow-md transition-all">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inactive Status</p>
          <h3 className="text-2xl font-bold text-slate-500 mt-1">{inactive}</h3>
        </div>
        <div className="h-10 w-10 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center font-bold">
          💤
        </div>
      </div>
    </div>
  );
};