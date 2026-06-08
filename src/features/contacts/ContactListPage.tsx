'use client';

import { useContactsManager } from '../../hooks/useContacts';
import type { ContactListQueryParams } from '../../types/contact';

export default function ContactListPage() {
  // 1. Fixed: Match initial payload options explicitly with the ContactListQueryParams type definitions
  const initialQueryParams: ContactListQueryParams = {
    page: 1,
    limit: 10,
    search: '',
    sortField: 'name',
    sortOrder: 'asc',
    tags: []
  };

  const {
    contactsData,
    meta,
    isLoading,
    error,
    params,
    updatePage,
    updateSearch,
    updateSorting,
  } = useContactsManager(initialQueryParams);

  const handleSortTrigger = (field: 'name' | 'createdAt' | 'lastActivityAt') => {
    const isCurrentField = params.sortField === field;
    const nextOrder = isCurrentField && params.sortOrder === 'asc' ? 'desc' : 'asc';
    updateSorting(field, nextOrder);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative z-10 animate-fade-in">
      
      {/* Upper Registry Tracking Metrics Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Enterprise Directory</h1>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">Real-time Node Profile Infrastructure</p>
        </div>
        
        {/* Dynamic Client Query Input Box */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search identity indices..."
            value={params.search || ''}
            onChange={(e) => updateSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Network Response Exception Handling Panels */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 font-bold text-xs px-4 py-3 rounded-xl">
          ⚠️ Operational Exception: {error}
        </div>
      )}

      {/* Core Tabular Matrix Layout Grid */}
      <div className="glassic-card rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                <th 
                  onClick={() => handleSortTrigger('name')}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  Identity Name {params.sortField === 'name' && (params.sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th className="px-6 py-4">Communication Info</th>
                <th className="px-6 py-4">Assigned Tags</th>
                <th 
                  onClick={() => handleSortTrigger('createdAt')}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  Onboarding Date {params.sortField === 'createdAt' && (params.sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th 
                  onClick={() => handleSortTrigger('lastActivityAt')}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  Last Pulse {params.sortField === 'lastActivityAt' && (params.sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold tracking-wide">
                    <div className="inline-block h-4 w-4 rounded-full border-2 border-slate-200 border-t-emerald-600 animate-spin mr-2 align-middle"></div>
                    Syncing localized records from cluster network...
                  </td>
                </tr>
              ) : contactsData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold tracking-wide">
                    No registry contacts found matching current parameters.
                  </td>
                </tr>
              ) : (
                contactsData.map((contact) => (
                  <tr key={contact.id} className="hover:bg-white/60 transition-all duration-100 group">
                    <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {contact.firstName} {contact.lastName}
                    </td>
                    <td className="px-6 py-4 space-y-0.5">
                      <p className="font-semibold text-slate-800">{contact.email || '—'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{contact.mobileNumber || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags && contact.tags.map((tag) => (
                          <span 
                            key={tag.id}
                            className="px-2 py-0.5 text-[9px] font-black tracking-wide uppercase rounded-md bg-slate-100 border border-slate-200 text-slate-500"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {(!contact.tags || contact.tags.length === 0) && <span className="text-slate-300 font-normal italic">Unmapped</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-bold">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-bold">
                      {formatDate(contact.lastActivityAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                            !contact.isDeleted 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                            {/* If isDeleted is false, the contact is Active */}
                            {!contact.isDeleted && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                            {!contact.isDeleted ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Lower Dashboard Pagination Toolbar */}
        {!isLoading && meta && (
          <div className="px-6 py-3.5 bg-white/40 border-t border-slate-200 flex items-center justify-between">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
              Total Entities Logged: {meta.totalRecords}
            </p>
            
            <div className="flex items-center gap-2">
              <button
                disabled={!meta.hasPrevPage}
                onClick={() => updatePage(meta.currentPage - 1)}
                className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wide border border-slate-200 rounded-xl bg-white disabled:opacity-40 select-none transition-all cursor-pointer active:scale-95"
              >
                ◀ Prev
              </button>
              <span className="text-xs text-slate-700 font-bold px-2">
                {meta.currentPage} / {meta.totalPages}
              </span>
              <button
                disabled={!meta.hasNextPage}
                onClick={() => updatePage(meta.currentPage + 1)}
                className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wide border border-slate-200 rounded-xl bg-white disabled:opacity-40 select-none transition-all cursor-pointer active:scale-95"
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}