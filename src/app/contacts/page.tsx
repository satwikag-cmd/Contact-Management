'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useContacts } from '../../context/ContactContext';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';

export default function ContactListPage() {
  const router = useRouter();
  
  // Revert back to using your robust local data state engine cleanly
  const { contacts, updateContact, clearAllDuplicates } = useContacts();

  // Primary layout query variables
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [genderFilter, setGenderFilter] = useState<string>('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  const totalCount = contacts.length;
  const activeCount = contacts.filter(c => !c.isDeleted).length;
  const inactiveCount = contacts.filter(c => c.isDeleted).length;

  // --- LOCAL MULTI-VARIABLE RECONCILIATION FILTER & SORT DATA LOOP ---
  const filteredContacts = contacts.filter((contact) => {
    const emailString = contact.email || '';
    const mobileString = contact.mobileNumber || '';
    const contactGender = contact.gender || 'Male';
    
    const matchesSearch =
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emailString.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mobileString.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'Active' && contact.isDeleted) return false;
    if (statusFilter === 'Inactive' && !contact.isDeleted) return false;
    if (genderFilter !== 'All' && contactGender !== genderFilter) return false;

    return matchesSearch;
  });

  const sortedContacts = filteredContacts.sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

  const totalPages = Math.ceil(sortedContacts.length / pageSize) || 1;
  const paginatedContacts = sortedContacts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSoftDeleteClick = (id: string) => {
    setTargetDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmSoftDelete = () => {
    if (targetDeleteId) {
      updateContact(targetDeleteId, { isDeleted: true });
      setIsDeleteOpen(false);
      setTargetDeleteId(null);
    }
  };

  const handleRestoreClick = (id: string) => {
    updateContact(id, { isDeleted: false });
  };

  return (
    <div className="space-y-6 relative z-10">
      
      {/* Analytics Counter Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Directory</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg">📁</div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Status</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg">⚡</div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Inactive Status</p>
            <h3 className="text-2xl font-black text-slate-700 mt-1">{inactiveCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg">💤</div>
        </div>
      </div>
      
      {/* Control Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            <input 
              type="text"
              placeholder="Search via name, email, phone..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
            />
          </div>

          <select
            value={genderFilter}
            onChange={(e) => { setGenderFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
          >
            <option value="asc">Sort: Name (A → Z)</option>
            <option value="desc">Sort: Name (Z → A)</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-end w-full md:w-auto">
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-500">
            {(['All', 'Active', 'Inactive'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === tab ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button 
            onClick={clearAllDuplicates}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            ✨ Purge Duplicates
          </button>

          <button 
            onClick={() => router.push('/contacts/create')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            + Add Contact
          </button>
        </div>
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
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {paginatedContacts.length > 0 ? (
                paginatedContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">{contact.firstName} {contact.lastName}</td>
                    <td className="px-6 py-4 text-slate-400 font-medium">{contact.email || '—'}</td>
                    <td className="px-6 py-4 text-slate-500">{contact.mobileNumber || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-extrabold uppercase">
                        {contact.gender || 'Male'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{contact.location || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        !contact.isDeleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {!contact.isDeleted ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 text-xs font-bold">
                      <button onClick={() => router.push(`/contacts/${contact.id}`)} className="text-slate-400 hover:text-slate-600 cursor-pointer">View</button>
                      <button onClick={() => router.push(`/contacts/${contact.id}/edit`)} className="text-blue-600 hover:text-blue-700 cursor-pointer">Edit</button>
                      
                      {!contact.isDeleted ? (
                        <button onClick={() => handleSoftDeleteClick(contact.id)} className="text-red-500 hover:text-red-600 cursor-pointer">Delete</button>
                      ) : (
                        <button onClick={() => handleRestoreClick(contact.id)} className="text-emerald-600 hover:text-emerald-700 cursor-pointer">Restore</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-wider bg-slate-50/20">
                    No active index records found matching the selection parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500 select-none">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-all"
            >
              Previous
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-all"
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