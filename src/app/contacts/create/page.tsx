'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useContactQueries } from '../../../hooks/useContactQueries';

export default function CreateContactPage() {
  const router = useRouter();
  const { useCreateContact, useFetchGlobalTags } = useContactQueries();
  const createMutation = useCreateContact();
  
  // 📡 Dynamically fetch the master configuration taxonomy tags list from local state cache
  const { data: globalTags = [] } = useFetchGlobalTags();
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    gender: 'Male',
    dateOfBirth: '',
    city: '',
    state: '',
    country: ''
  });
  
  // Tracker array string to manage selected tag names
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleTagCheckboxToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

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
      await createMutation.mutateAsync({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim() || null,
        mobile_number: form.mobileNumber.trim() || null,
        gender: form.gender.toLowerCase(),
        date_of_birth: form.dateOfBirth || null, 
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        country: form.country.trim() || null,
        tags: selectedTags 
      } as any);

      router.push('/contacts');
    } catch (serverError: any) {
      // 🛠️ 1. LOG THE CLEANED ERROR OBJECT FROM THE NEW HOOK PIPELINE
      console.log("--- CLEANED HOOK ERROR ---", serverError);

      if (serverError) {
        // Path A & B: If it's a validation map directly or nested under an 'errors' key
        const possibleMap = serverError.errors || serverError.message || serverError;

        if (possibleMap && typeof possibleMap === 'object' && !Array.isArray(possibleMap)) {
          const errorMessages = Object.values(possibleMap);
          if (errorMessages.length > 0) {
            setValidationError(String(errorMessages[0]));
            return;
          }
        }
        
        // Path C: If it's sent back as a simple text string layout
        if (typeof serverError === 'string') {
          setValidationError(serverError);
          return;
        }
        if (typeof serverError.message === 'string') {
          setValidationError(serverError.message);
          return;
        }
      }

      // 🛠️ 3. FINAL FALLBACK IF THE ENTRIES BREAK RADICALLY
      setValidationError('The data is already associated or an unexpected error occurred.');
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
            <input type="date" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Location City</label>
            <input type="text" placeholder="Kurnool" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">State / Province</label>
            <input type="text" placeholder="AP" value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Country</label>
            <input type="text" placeholder="India" value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
          </div>
        </div>

        {/* 🏷️ DYNAMIC GLOBAL CHIPS TAXONOMY OPTIONS BLOCK */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Assign Profile Tags (Global Taxonomies Rulebook)</label>
          {globalTags.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {globalTags.map((tag: any) => {
                const tagString = typeof tag === 'string' ? tag : tag.name; 
                const isChecked = selectedTags.includes(tagString);
                return (
                  <label key={tagString} className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none ${
                    isChecked ? 'border-blue-500 bg-blue-50/20' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                  }`}>
                    <span className="text-xs font-bold text-slate-700">{tagString}</span>
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={() => handleTagCheckboxToggle(tagString)}
                      className="accent-blue-600 h-3.5 w-3.5 cursor-pointer" 
                    />
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
              No tag selections found inside global configuration rule files. Add tags via your configuration console dashboard tab first.
            </p>
          )}
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