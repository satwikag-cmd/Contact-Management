// src/components/ContactTable.tsx
import React from 'react';
import type { Contact } from '../types/contact';

interface ContactTableProps {
  contacts: Contact[];
  onView: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({ contacts, onView, onEdit, onDelete }) => {
  
  // Format Date Helper mapping to strict ISO timestamp structures
  const formatDate = (isoString: string) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // If there are zero matching elements, render an explicit, clear empty state
  if (contacts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-900">No contacts found</h3>
        <p className="text-xs text-slate-400 mt-1">Try modifying your search query or filter settings.</p>
      </div>
    );
  }

  return (
    <div className="glassic-card rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 transition-all duration-300 bg-white/80 backdrop-blur-md">
      
      {/* Desktop Layout View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
            {contacts.map((contact) => {
              const isActive = !contact.isDeleted;
              return (
                <tr key={contact.id} className="hover:bg-white/70 transition-all duration-150 group">
                  <td className="px-6 py-3.5 font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {contact.firstName} {contact.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{contact.email || '—'}</td>
                  <td className="px-6 py-4 text-slate-500">{contact.mobileNumber || '—'}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{contact.location || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => onView(contact)} className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 rounded transition-colors cursor-pointer">
                      View
                    </button>
                    <button onClick={() => onEdit(contact)} className="text-blue-600 hover:text-blue-700 text-xs font-semibold px-2 py-1 rounded transition-colors cursor-pointer">
                      Edit
                    </button>
                    <button onClick={() => onDelete(contact.id)} className="text-red-600 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded transition-colors cursor-pointer">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stack Layout View */}
      <div className="grid grid-cols-1 divide-y divide-slate-100 md:hidden">
        {contacts.map((contact) => {
          const isActive = !contact.isDeleted;
          return (
            <div key={contact.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-slate-900">{contact.firstName} {contact.lastName}</h4>
                  <p className="text-xs text-slate-500">{contact.location || 'No Location specified'}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="text-xs space-y-1 text-slate-500">
                <p><strong className="text-slate-700">Email:</strong> {contact.email || '—'}</p>
                <p><strong className="text-slate-700">Phone:</strong> {contact.mobileNumber || '—'}</p>
                <p><strong className="text-slate-700">Added:</strong> {formatDate(contact.createdAt)}</p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-50 text-xs">
                <button onClick={() => onView(contact)} className="text-slate-600 font-medium px-2 py-1 bg-slate-50 border border-slate-200 rounded-md cursor-pointer">
                  View
                </button>
                <button onClick={() => onEdit(contact)} className="text-blue-600 font-medium px-2 py-1 bg-blue-50 border border-blue-100 rounded-md cursor-pointer">
                  Edit
                </button>
                <button onClick={() => onDelete(contact.id)} className="text-red-600 font-medium px-2 py-1 bg-red-50 border border-red-100 rounded-md cursor-pointer">
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};