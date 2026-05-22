// src/components/ContactFilters.tsx
import React from 'react';

interface ContactFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: 'All' | 'Active' | 'Inactive';
  setStatusFilter: (value: 'All' | 'Active' | 'Inactive') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  onAddContactClick: () => void;
  onExportCSV: () => void;
  onOpenQuickList: () => void;
}

export const ContactFilters: React.FC<ContactFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortOrder,
  setSortOrder,
  onAddContactClick,
  onExportCSV,
  onOpenQuickList,
}) => {
  return (
    <div className="glassic-card rounded-2xl p-4 shadow-xs flex flex-col xl:flex-row gap-4 items-center justify-between mb-6 transition-all duration-300 hover:shadow-md">
      
      {/* Search Bar Input box */}
      <div className="relative w-full xl:w-80">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search identity indices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
        />
      </div>

      {/* Responsive Functional Controllers Layout Grid Container */}
      <div className="flex flex-wrap w-full xl:w-auto items-center justify-end gap-3">
        
        {/* Alphabet Sort Component Button */}
        <button
          type="button"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-3 py-2 rounded-xl shadow-xs active:scale-95 transition-all duration-200 cursor-pointer"
          title="Sort directory alphabetically"
        >
          <span>Sort: {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}</span>
          <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        </button>

        {/* View All Quick-List Selector Pop button */}
        <button
          type="button"
          onClick={onOpenQuickList}
          className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-semibold text-xs px-3 py-2 rounded-xl shadow-xs active:scale-95 transition-all duration-200 cursor-pointer"
        >
          👁️ Quick List
        </button>

        {/* Status Filter Controller tabs */}
        <div className="flex bg-slate-200/60 border border-slate-200/80 p-0.5 rounded-xl">
          {(['All', 'Active', 'Inactive'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Native CSV Export compilation trigger */}
        <button
          type="button"
          onClick={onExportCSV}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs active:scale-95 transition-all duration-200 cursor-pointer"
        >
          📥 Export CSV
        </button>

        {/* Primary Append Command link */}
        <button
          type="button"
          onClick={onAddContactClick}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm active:scale-95 hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Contact
        </button>

      </div>
    </div>
  );
};