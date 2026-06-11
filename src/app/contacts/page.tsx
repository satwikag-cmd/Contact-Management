'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useContactQueries } from '../../hooks/useContactQueries';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';

export default function ContactListPage() {
  const router = useRouter();
  const { useFetchContacts, useSoftDeleteContact, useFetchGlobalTags } = useContactQueries();

  // 🎛️ SYSTEM CORE QUERY PARAMETERS (Initialized directly from localStorage if present)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'asc' | 'desc'>('newest');

  // 🚀 APPLIED NETWORK SEARCH STRINGS
  const [searchQuery, setSearchQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [stateQuery, setStateQuery] = useState('');
  const [countryQuery, setCountryQuery] = useState('');

  // ✏️ LOCAL INPUT BUFFER STATES (Type smoothly without losing input focus!)
  const [searchTerm, setSearchTerm] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [stateInput, setStateInput] = useState('');
  const [countryInput, setCountryInput] = useState('');

  // 📂 ADVANCED FILTERS SYSTEM DRAWER TOGGLE
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  // 🏷️ OTHER LOCAL FILTER STATES
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [createdDateFilter, setCreatedDateFilter] = useState('');
  const [activityDateFilter, setActivityDateFilter] = useState('');

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  // Query global tags list out of local client cache
  const { data: globalTags = [] } = useFetchGlobalTags();

  // 📡 FETCH LIVE ROWS FROM BACKEND - FULLY DYNAMIC NOW!
  const { data: serverPayload, isLoading, isError } = useFetchContacts(
    currentPage,      // 🔄 Sends real page index coordinates dynamically
    pageSize,         // 🔄 Sends your 5, 10, 15 page sizes over the wire
    searchQuery, 
    genderFilter,     // 🔄 Sends chosen gender parameter string to the Go terminal
    cityQuery || undefined,     
    stateQuery || undefined,    
    countryQuery || undefined   
  );
  const deleteMutation = useSoftDeleteContact();
  const contactsList = serverPayload?.data || [];

  // 🛠️ 1. HYDRATE STATE FROM LOCAL STORAGE ON COMPONENT MOUNT
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem('contact_hub_saved_filters');
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        
        // 🔹 1. Apply instantly to Core Dropdown Parameters
        if (parsed.pageSize) setPageSize(parsed.pageSize);
        if (parsed.genderFilter) setGenderFilter(parsed.genderFilter);
        if (parsed.sortOrder) setSortOrder(parsed.sortOrder);
        
        // 🔹 2. Apply instantly to Active Applied Network Queries (Crucial Fix!)
        if (parsed.searchQuery) setSearchQuery(parsed.searchQuery);
        if (parsed.cityQuery) setCityQuery(parsed.cityQuery);
        if (parsed.stateQuery) setStateQuery(parsed.stateQuery);
        if (parsed.countryQuery) setCountryQuery(parsed.countryQuery);
        
        // 🔹 3. Apply instantly to Local Input Visual Buffers so text stays visible
        if (parsed.searchQuery) setSearchTerm(parsed.searchQuery);
        if (parsed.cityQuery) setCityInput(parsed.cityQuery);
        if (parsed.stateQuery) setStateInput(parsed.stateQuery);
        if (parsed.countryQuery) setCountryInput(parsed.countryQuery);
        
        // 📂 4. Automatically keep the Advanced Drawer open if advanced parameters exist!
        if (parsed.cityQuery || parsed.stateQuery || parsed.countryQuery) {
          setIsDrawerExpanded(true);
        }
      }
    } catch (e) {
      console.error("Failed to read localStorage filters layout", e);
    }
  }, []);

  // 💾 2. SYNCHRONIZE ACTIVE STATES TO LOCAL STORAGE ON ANY CHANGE
  useEffect(() => {
    const filterObject = {
      pageSize,
      genderFilter,
      sortOrder,
      searchQuery,
      cityQuery,
      stateQuery,
      countryQuery
    };
    localStorage.setItem('contact_hub_saved_filters', JSON.stringify(filterObject));
  }, [pageSize, genderFilter, sortOrder, searchQuery, cityQuery, stateQuery, countryQuery]);

  // --- ⌨️ TRIGGER SEARCH HANDLERS ---
  const handleApplyFilters = () => {
    setSearchQuery(searchTerm.trim());
    setCityQuery(cityInput.trim());
    setStateQuery(stateInput.trim());
    setCountryQuery(countryInput.trim());
    setCurrentPage(1); 
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  const handleToggleFilter = (value: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    setState(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
    setCurrentPage(1); 
  };

  const clearAllFilters = () => {
    setSearchTerm(''); setCityInput(''); setStateInput(''); setCountryInput('');
    setSearchQuery(''); setCityQuery(''); setStateQuery(''); setCountryQuery('');
    setSelectedFilterTags([]); setCreatedDateFilter(''); setActivityDateFilter('');
    setGenderFilter('All'); setSortOrder('newest');
    setCurrentPage(1);
    
    // Completely purge the persistent object out of disk memory
    localStorage.removeItem('contact_hub_saved_filters');
  };

  // --- 🧬 ALIGNED DATA PREPARATION LAYER ---
  // The backend already handles your filters, pagination cuts, and location targets!
  // We apply localized sorting and client-side secondary metadata tags tracking on the data array.
  // --- 🧬 ALIGNED DATA PREPARATION LAYER ---
  // The backend already handles your search, gender, and location parameters natively!
  // We only track profile tag matches and custom date boundaries in frontend memory.
  const filteredContacts = [...contactsList]
    .filter((contact: any) => {
      // 🏷️ Profile Tag matching (Frontend memory helper)
      if (selectedFilterTags.length > 0) {
        const contactTags: string[] = contact.tags || [];
        const hasMatchingTag = selectedFilterTags.every(t => 
          contactTags.map(ct => ct.toLowerCase()).includes(t.toLowerCase())
        );
        if (!hasMatchingTag) return false;
      }
      
      // 📅 Date calendar range parameters
      if (createdDateFilter) {
        const contactCreated = new Date(contact.created_at || contact.createdAt).toISOString().split('T')[0];
        if (contactCreated !== createdDateFilter) return false;
      }
      if (activityDateFilter) {
        const contactActivity = new Date(contact.last_activity_at || contact.lastActivityAt).toISOString().split('T')[0];
        if (contactActivity !== activityDateFilter) return false;
      }

      return true;
    })
    .sort((a: any, b: any) => {
      if (sortOrder === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortOrder === 'oldest') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      
      const nameA = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
      const nameB = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
      if (sortOrder === 'asc') return nameA.localeCompare(nameB);
      if (sortOrder === 'desc') return nameB.localeCompare(nameA);
      return 0;
    });

  // --- 🔢 SERVER METADATA RECONCILIATION ---
  // We map the total boundaries directly to the counter object returned by his Go API!
  const serverTotalRecords = serverPayload?.total || filteredContacts.length;
  const totalPagesCount = serverPayload?.total_pages || Math.ceil(serverTotalRecords / pageSize) || 1;
  
  // No more manual client-side .slice() array truncating.
  // The Go server sends the exact sliced chunk, so we use it directly!
  const paginatedContacts = filteredContacts;

  const handleSoftDeleteClick = (id: string) => {
    setTargetDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmSoftDelete = async () => {
    if (targetDeleteId) {
      await deleteMutation.mutateAsync(targetDeleteId);
      setIsDeleteOpen(false);
      setTargetDeleteId(null);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); 
  };

  if (isLoading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-3 select-none">
        <div className="h-6 w-6 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Syncing Data with Teammate's Laptop...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-wider">
        ⚠️ Connection Failed. Make sure his server is running on port 8081 and CORS is allowed!
      </div>
    );
  }

  return (
    <div className="space-y-6 relative z-10">
      
      {/* Analytics Counter Banner Cards */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Filtered Directory Records</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{serverTotalRecords}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg">📁</div>
        </div>
      </div>
      
      {/* Control Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col gap-3.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative w-full md:w-64">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
              <input 
                type="text"
                placeholder="Type and press Enter to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>

            <select
              value={pageSize}
              onChange={(e) => { handlePageSizeChange(Number(e.target.value)); }}
              className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={5}>Show 5 Rows</option>
              <option value={10}>Show 10 Rows</option>
              <option value={15}>Show 15 Rows</option>
              <option value={20}>Show 20 Rows</option>
            </select>

            <select
              value={genderFilter}
              onChange={(e) => { setGenderFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="newest">Sort: Newest Added</option>
              <option value="oldest">Sort: Oldest Added</option>
              <option value="asc">Sort: Name (A → Z)</option>
              <option value="desc">Sort: Name (Z → A)</option>
            </select>

            <button 
              type="button"
              onClick={() => setIsDrawerExpanded(!isDrawerExpanded)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer flex items-center gap-1.5 ${
                isDrawerExpanded ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ⚙️ {isDrawerExpanded ? 'Hide Filters' : 'Advanced Filters'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-end">
            <button 
              onClick={() => router.push('/contacts/create')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              + Add Contact
            </button>
          </div>
        </div>

        {/* 🛠️ COLLAPSIBLE EXPANDED ADVANCED DRAWER BLOCK */}
        {isDrawerExpanded && (
          <div className="pt-4 border-t border-slate-100 space-y-4 animate-fade-in text-xs font-semibold text-slate-600">
            
            {/* TAG FILTER CHIPS */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Filter by Profile Tags</span>
              <div className="flex flex-wrap gap-2">
                {globalTags.map((tag: string) => {
                  const isActive = selectedFilterTags.includes(tag);
                  return (
                    <button key={tag} type="button" onClick={() => handleToggleFilter(tag, selectedFilterTags, setSelectedFilterTags)} className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-black' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                      {tag} {isActive && '✕'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* THREE SPECIFIC SEARCH INPUTS FOR COUNTRY, STATE, CITY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Filter by Country</label>
                <input 
                  type="text" 
                  placeholder="Type and press Enter..." 
                  value={countryInput} 
                  onChange={e => setCountryInput(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-semibold" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Filter by State</label>
                <input 
                  type="text" 
                  placeholder="Type and press Enter..." 
                  value={stateInput} 
                  onChange={e => setStateInput(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-semibold" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Filter by City</label>
                <input 
                  type="text" 
                  placeholder="Type and press Enter..." 
                  value={cityInput} 
                  onChange={e => setCityInput(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-semibold" 
                />
              </div>
            </div>

            {/* DATE SELECT FIELD INPUT FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Created Date</span>
                <input type="date" value={createdDateFilter} onChange={e => { setCreatedDateFilter(e.target.value); setCurrentPage(1); }} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer text-slate-700" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Last Activity Date</span>
                <input type="date" value={activityDateFilter} onChange={e => { setActivityDateFilter(e.target.value); setCurrentPage(1); }} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer text-slate-700" />
              </div>
              <div className="flex items-end justify-end gap-2">
                <button type="button" onClick={clearAllFilters} className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-black rounded-xl border border-red-200 cursor-pointer transition-colors">Clear All</button>
                <button type="button" onClick={handleApplyFilters} className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl cursor-pointer transition-colors shadow-2xs">Apply Filters</button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Main Database Table Layout View */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-wider select-none">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {paginatedContacts.length > 0 ? (
                paginatedContacts.map((contact: any) => (
                  <tr key={contact.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {contact.first_name || ''} {contact.last_name || ''}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium">{contact.email || '—'}</td>
                    <td className="px-6 py-4 text-slate-500">{contact.mobile_number || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-extrabold uppercase">
                        {contact.gender || 'Male'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags && contact.tags.length > 0 ? (
                          contact.tags.map((tag: string, index: number) => (
                            <span 
                              key={index}
                              className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-extrabold uppercase tracking-wide"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-300 font-normal text-[11px]">none</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 text-xs font-bold">
                      <button onClick={() => router.push(`/contacts/${contact.id}`)} className="text-slate-400 hover:text-slate-600 cursor-pointer">View</button>
                      <button onClick={() => router.push(`/contacts/${contact.id}/edit`)} className="text-blue-600 hover:text-blue-700 cursor-pointer">Edit</button>
                      <button onClick={() => handleSoftDeleteClick(contact.id)} className="text-red-500 hover:text-red-600 cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-wider bg-slate-50/20">
                    No active index records found matching the selection parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Navigation Footer */}
        <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500 select-none">
          <span>Showing {paginatedContacts.length} rows of <span className="text-slate-800 font-mono font-black">{serverTotalRecords}</span> entries</span>
          
          <div className="flex gap-2 items-center">
            <span className="mr-2 text-slate-400">Page {currentPage} of {totalPagesCount}</span>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-all shadow-2xs"
            >
              Previous
            </button>
            <button 
              disabled={currentPage === totalPagesCount}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPagesCount))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-all shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={confirmSoftDelete} 
        contactName="" 
      />
    </div>
  );
}