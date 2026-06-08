// src/components/ContactViewModal.tsx
import React, { useRef } from 'react';
import type { Contact } from '../types/contact';
import { useContacts } from '../context/ContactContext';

interface ContactViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
}

export const ContactViewModal: React.FC<ContactViewModalProps> = ({ isOpen, onClose, contact }) => {
  // Safe extraction of avatar update handler if defined inside your context engine
  const contextData = useContacts();
  const updateContactAvatar = (contextData as any).updateContactAvatar;
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !contact) return null;

  const formatDate = (isoString: string) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("Image is too large. Please upload an image smaller than 1.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string' && typeof updateContactAvatar === 'function') {
        updateContactAvatar(contact.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelector = () => {
    fileInputRef.current?.click();
  };

  const isActive = !contact.isDeleted;
  const avatarUrl = (contact as any).avatar;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">Contact Specifications</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Profile Header Avatar Section */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />

            <div 
              onClick={triggerFileSelector}
              className="relative h-16 w-16 rounded-full group overflow-hidden bg-emerald-50 border border-emerald-200 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-sm"
              title="Click to add/change profile image"
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-emerald-700 font-bold text-xl uppercase select-none">
                  {(contact.firstName?.[0] || '')}{(contact.lastName?.[0] || '')}
                </span>
              )}

              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[9px] font-bold text-white tracking-wide transition-opacity duration-200">
                <svg className="h-4 w-4 mb-0.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                UPLOAD
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">{contact.firstName} {contact.lastName}</h4>
              <p className="text-sm font-medium text-slate-500">{contact.location || 'No Location specified'}</p>
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-4 text-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-50 pb-2">
              <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Email Address</span>
              <span className="text-slate-900 font-medium mt-0.5 sm:mt-0 break-all">{contact.email || '—'}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-50 pb-2">
              <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Mobile Number</span>
              <span className="text-slate-900 font-medium mt-0.5 sm:mt-0">{contact.mobileNumber || '—'}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-50 pb-2">
              <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Account Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 sm:mt-0 w-fit ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between pb-1">
              <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Registration Date</span>
              <span className="text-slate-500 font-medium mt-0.5 sm:mt-0 text-xs">{formatDate(contact.createdAt)}</span>
            </div>
          </div>

          {/* Close Action Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
            >
              Close Window
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};