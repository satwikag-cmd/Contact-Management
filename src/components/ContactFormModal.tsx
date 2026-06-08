// src/components/ContactFormModal.tsx
import React, { useState, useEffect } from 'react';
import type { Contact } from '../types/contact';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'createdAt' | 'lastActivityAt' | 'tags'>) => void;
  editingContact: Contact | null;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingContact,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    location: '',
    isDeleted: false, // Local tracking flag for status toggles
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (editingContact) {
      setFormData({
        firstName: editingContact.firstName || '',
        lastName: editingContact.lastName || '',
        email: editingContact.email || '',
        mobileNumber: editingContact.mobileNumber || '',
        location: editingContact.location || '',
        isDeleted: !!editingContact.isDeleted,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        location: '',
        isDeleted: false,
      });
    }
    setErrors({});
  }, [editingContact, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.mobileNumber.trim() && !phoneRegex.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || null,
        mobileNumber: formData.mobileNumber.trim() || null,
        location: formData.location.trim() || undefined,
        isDeleted: formData.isDeleted, // Pass the boolean flag down to App.tsx
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-scale-up">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">
            {editingContact ? 'Edit Contact Details' : 'Create New Contact Record'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 transition-all ${
                  errors.firstName ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 transition-all ${
                  errors.lastName ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="text"
              placeholder="example@kasplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 transition-all ${
                errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
            <input
              type="text"
              placeholder="e.g., +91 98765 43210"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 transition-all ${
                errors.mobileNumber ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'
              }`}
            />
            {errors.mobileNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.mobileNumber}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location City</label>
            <input
              type="text"
              placeholder="e.g., Kurnool"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Added Status Selection Toggles Map directly to unified isDeleted Boolean values */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Account Operational Status</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="isDeleted"
                  checked={formData.isDeleted === false}
                  onChange={() => setFormData({ ...formData, isDeleted: false })}
                  className="accent-emerald-600 h-4 w-4"
                />
                Active
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="isDeleted"
                  checked={formData.isDeleted === true}
                  onChange={() => setFormData({ ...formData, isDeleted: true })}
                  className="accent-slate-600 h-4 w-4"
                />
                Inactive
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              {editingContact ? 'Save Modifications' : 'Register Contact'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};