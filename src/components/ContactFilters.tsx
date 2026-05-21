// src/components/ContactFilters.tsx
import React from 'react';

interface ContactFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: 'All' | 'Active' | 'Inactive';
  setStatusFilter: (value: 'All' | 'Active' | 'Inactive') => void;
  onAddContactClick: () => void;
  onExportCSV: () => void;
}

export const ContactFilters: React.FC<ContactFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onAddContactClick,
  onExportCSV, // Destructure the new function prop here!
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      
      {/* Search Input Box */}
      <div className="relative w-full md:w-96">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
        />
      </div>

      {/* Filter Tabs & Add Button Controls */}
      <div className="flex flex-wrap w-full md:w-auto items-center justify-between md:justify-end gap-3">
        
        {/* Status Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {(['All', 'Active', 'Inactive'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Global Action Button */}
        <button
          type="button"
          onClick={onAddContactClick}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm active:scale-98 transition-all cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Contact
        </button>

        <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-sm px-4 py-2 rounded-lg shadow-xs active:scale-95 transition-all cursor-pointer"
            >
            📥 Export CSV
        </button>
      </div>

    </div>
  );
};