// src/components/QuickListModal.tsx
import React from 'react';
import type { Contact } from '../types/contact';

interface QuickListModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
}

export const QuickListModal: React.FC<QuickListModalProps> = ({ isOpen, onClose, contacts, onSelectContact }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col animate-scale-up">
        
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Directory Quick Index</h3>
            <p className="text-[10px] text-slate-400 font-medium">Select any profile record to map full specifications</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 max-h-[350px] overflow-y-auto space-y-1.5">
          {contacts.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">No indices matching parameters.</p>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => {
                  onSelectContact(contact);
                  onClose();
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-emerald-50/60 border border-transparent hover:border-emerald-100 flex items-center justify-between group transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    {contact.firstName[0]}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-900 transition-colors">
                    {contact.firstName} {contact.lastName}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-all">
                  Inspect
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};