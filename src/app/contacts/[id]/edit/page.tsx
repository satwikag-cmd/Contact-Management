'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../api/apiClient';
import { useContactQueries } from '../../../../hooks/useContactQueries';

export default function EditContactPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { useFetchGlobalTags } = useContactQueries();

  // Fetch the master tags to build checkbox configuration menu
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

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // 📡 FETCH LIVE SCHEMA FROM BACKEND VIEW PROFILE
  const { data: profile, isLoading } = useQuery({
    queryKey: ['contact-profile', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/contacts/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (profile) {
      const basicInfo = profile["Basic Information"] || {};
      const location = basicInfo["Location"] || {};
      const nameParts = (basicInfo["Name"] || "").split(" ");
      
      // Parse gender case styling to capital for input dropdown matching
      const rawGender = basicInfo["Gender"] || 'Male';
      const parsedGender = rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase();

      setForm({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(" ") || '',
        email: basicInfo["Email"] || '',
        mobileNumber: basicInfo["Mobile Number"] || '',
        gender: parsedGender,
        dateOfBirth: basicInfo["Date of Birth"] ? new Date(basicInfo["Date of Birth"]).toISOString().split('T')[0] : '',
        city: location["City"] || '',
        state: location["State"] || '',
        country: location["Country"] || ''
      });

      // Pull pre-existing profile tags cleanly
      const serverTags = profile["Tags"] || profile["tags"] || basicInfo["Tags"] || [];
      setSelectedTags(serverTags.map((t: any) => typeof t === 'string' ? t : t.name));
    }
  }, [profile, id]); // ✅ ADDED 'id' HERE: Forces the form state to completely wipe and update when you click a different contact!

  // ✅ REVERTED TO PUT: Restored your exact working endpoint method from yesterday
  const editMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await apiClient.put(`/api/v1/contacts/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-profile', id] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      router.push(`/contacts/${id}`);
    },
    onError: (err: any) => {
      setValidationError(err?.response?.data?.message || err?.message || 'Server rejected updates layout configuration layout.');
    }
  });

  const handleTagCheckboxToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!form.firstName.trim()) {
      setValidationError('Validation Error: First name is explicitly mandatory.');
      return;
    }

    // Keep payload exactly as you designed it yesterday
    editMutation.mutate({
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
    });
  };

  if (isLoading) return <div className="p-12 text-center text-xs font-black text-slate-400 uppercase tracking-wider">Syncing Record Form Parameters...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in relative z-10">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Modify Identity Parameters</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Commit real-time database mutations</p>
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
            <input type="text" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Mobile Number</label>
            <input type="text" value={form.mobileNumber} onChange={e => setForm({...form, mobileNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">City</label>
            <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">State / Province</label>
            <input type="text" value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Country</label>
            <input type="text" value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none" />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-50">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Modify Profile Tags Assignment</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {globalTags.map((tag: any) => {
              const tagString = typeof tag === 'string' ? tag : tag.name;
              const isChecked = selectedTags.includes(tagString);
              return (
                <label key={tagString} className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none ${isChecked ? 'border-blue-500 bg-blue-50/20' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}>
                  <span className="text-xs font-bold text-slate-700">{tagString}</span>
                  <input type="checkbox" checked={isChecked} onChange={() => handleTagCheckboxToggle(tagString)} className="accent-blue-600 h-3.5 w-3.5" />
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button type="button" onClick={() => router.push(`/contacts/${id}`)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
          <button type="submit" disabled={editMutation.isPending} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all">{editMutation.isPending ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  );
}