'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useContactQueries } from '../../../hooks/useContactQueries';

export default function CreateContactPage() {
  const router = useRouter();
  const { useCreateContact } = useContactQueries();
  const createMutation = useCreateContact();
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    gender: 'Male',
    dateOfBirth: '',
    location: ''
  });
  
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!form.firstName.trim()) {
      setValidationError('Validation Rule Flag: First name is explicitly mandatory.');
      return;
    }
    if (!form.email.trim() && !form.mobileNumber.trim()) {
      setValidationError('Validation Rule Flag: Either an email address or mobile vector must be provided.');
      return;
    }

    try {
      // Execute background mutation to sync into corporate database tables
      await createMutation.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || null,
        mobileNumber: form.mobileNumber.trim() || null,
        location: form.location.trim() || undefined,
        gender: form.gender as any,
        dateOfBirth: form.dateOfBirth || undefined
      });

      router.push('/contacts');
    } catch (err: any) {
      setValidationError(err?.message || 'API Mutation failed. Check console trace logs.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in relative z-10">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Onboard New Profile</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Initialize structural database instance</p>
      </div>

      <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 font-bold text-xs rounded-xl">
            ⚠️ {validationError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">First Name *</label>
            <input type="text" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Last Name</label>
            <input type="text" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
            <input type="text" placeholder="example@kasplo.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Mobile Number</label>
            <input type="text" placeholder="+91 85230 76025" value={form.mobileNumber} onChange={e => setForm({...form, mobileNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Gender</label>
            <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Date of Birth</label>
            <input type="date" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Location City</label>
          <input type="text" placeholder="e.g. Kurnool" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button type="button" onClick={() => router.push('/contacts')} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer">Cancel</button>
          <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">
            {createMutation.isPending ? 'Registering...' : 'Register Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}