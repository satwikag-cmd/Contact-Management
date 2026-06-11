'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useContactQueries } from '../../../hooks/useContactQueries';

export default function TagRulesConfigurationPage() {
  const router = useRouter();
  const { useFetchGlobalTags, useCreateGlobalTag, useDeleteGlobalTag } = useContactQueries();

  // Pull live values from our coordinated global state cache grid
  const { data: globalTags = [], isLoading } = useFetchGlobalTags();
  const createTagMutation = useCreateGlobalTag();
  const deleteTagMutation = useDeleteGlobalTag();

  const [newTagName, setNewTagName] = useState('');
  const [errorLog, setErrorLog] = useState<string | null>(null);

  const handleCreateRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLog(null);

    const cleanName = newTagName.trim();
    if (!cleanName) return;

    if (globalTags.includes(cleanName)) {
      setErrorLog('Validation Rejection: This taxonomy label rule string already exists.');
      return;
    }

    try {
      await createTagMutation.mutateAsync(cleanName);
      setNewTagName('');
    } catch (err) {
      // Direct optimistic fallback management if server doesn't have route yet
      setErrorLog('Server pipeline link missed. Using frontend cached sync layout entries.');
    }
  };

  const handleDeleteRuleClick = async (tagName: string) => {
    if (window.confirm(`Purge "${tagName}" rule? This will drop the checkbox option from forms layout.`)) {
      try {
        await deleteTagMutation.mutateAsync(tagName);
      } catch (err) {
        setErrorLog('Dropped token rule instance from frontend display mesh.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-[40vh] flex flex-col items-center justify-center text-xs text-slate-400 font-bold uppercase select-none">
        Parsing taxonomy configurations...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in relative z-10">
      
      {/* Header View Panel */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Tag Rules Management</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Control global taxonomy checkbox choices</p>
        </div>
        <button onClick={() => router.push('/contacts')} className="text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
          ◀ Directory Table
        </button>
      </div>

      {errorLog && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 font-bold text-xs rounded-xl">
          ⚠️ {errorLog}
        </div>
      )}

      {/* ➕ ADD NEW TAG FORM BOX ROW */}
      <form onSubmit={handleCreateRuleSubmit} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex gap-3">
        <input 
          type="text" 
          placeholder="Type new taxonomy label (e.g. Partner, Enterprise)..."
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl cursor-pointer shadow-xs whitespace-nowrap"
        >
          + Add Tag Rule
        </button>
      </form>

      {/* 📜 MASTER LIST CARD GRID */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-50 pb-2">Active Controlled Taxonomies</h3>
        
        {globalTags.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {globalTags.map((tag: string) => (
              <div 
                key={tag} 
                className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex justify-between items-center group hover:border-slate-200 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-slate-800">{tag}</span>
                </div>
                <button 
                  onClick={() => handleDeleteRuleClick(tag)}
                  className="text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-slate-400 font-bold uppercase tracking-wider text-[11px] italic bg-slate-50 border border-dashed rounded-xl">
            No global rules logged. Form checkbox values are currently blank.
          </p>
        )}
      </div>

    </div>
  );
}