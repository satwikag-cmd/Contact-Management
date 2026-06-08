'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useContacts } from '../../../../context/ContactContext';

export default function EditContactFormRoute() {
  const { id } = useParams();
  const router = useRouter();
  const { contacts, updateContact } = useContacts();

  const contact = contacts.find(c => c.id === id);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    location: ''
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (contact) {
      setForm({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        mobileNumber: contact.mobileNumber || '',
        location: contact.location || ''
      });
    }
  }, [contact]);

  if (!contact) {
    return <div className="p-6 text-xs text-slate-400 font-bold uppercase tracking-wider">Identity profile not found in index.</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!form.firstName.trim()) {
      setValidationError('Validation Error: First name is explicitly mandatory.');
      return;
    }
    if (!form.email.trim() && !form.mobileNumber.trim()) {
      setValidationError('Validation Error: Either email address or mobile vector must be provided.');
      return;
    }

    // Save modifications up-circuit down into the central context store layer
    updateContact(contact.id, {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim() || null,
      mobileNumber: form.mobileNumber.trim() || null,
      location: form.location.trim() || undefined
    });

    router.push('/contacts');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in relative z-10">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Modify Profile Record</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Update enterprise catalog indices</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 font-bold text-xs rounded-xl">
            ⚠️ {validationError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">First Name *</label>
            <input type="text" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Last Name</label>
            <input type="text" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
          <input type="text" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Mobile Number</label>
          <input type="text" value={form.mobileNumber} onChange={e => setForm({...form, mobileNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Location City</label>
          <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button type="button" onClick={() => router.push('/contacts')} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">Save Changes</button>
        </div>
      </form>
    </div>
  );
}