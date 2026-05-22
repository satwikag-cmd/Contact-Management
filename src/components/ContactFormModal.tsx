// src/components/ContactFormModal.tsx
import React, { useState, useEffect } from 'react';
import type { Contact } from '../types/contact';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'createdDate'>) => void;
  editingContact: Contact | null;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  companyName?: string;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingContact,
}) => {
  // 1. Unified Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  // 2. Local Validation Errors State
  const [errors, setErrors] = useState<FormErrors>({});

  // Populate fields if we are editing an existing record [cite: 21, 36]
  useEffect(() => {
    if (editingContact) {
      setFormData({
        firstName: editingContact.firstName,
        lastName: editingContact.lastName,
        email: editingContact.email,
        phoneNumber: editingContact.phoneNumber,
        companyName: editingContact.companyName,
        status: editingContact.status,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        companyName: '',
        status: 'Active',
      });
    }
    setErrors({});
  }, [editingContact, isOpen]);

  if (!isOpen) return null;

  // 3. Native Form Validation Logics [cite: 35, 43]
  // Inside src/components/ContactFormModal.tsx

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Enterprise Phone Regex: Accepts spaces, dashes, parentheses, international plus codes, and 7-15 digits
    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    
    // Email Validation Layer
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // UPGRADED: Phone Number Validation Layer
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number (e.g., +91 98765 43210)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md劇 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-scale-up">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">
            {editingContact ? 'Edit Contact Details [cite: 21, 36]' : 'Create New Contact Record [cite: 20]'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body / Input Form [cite: 8] */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Row 1: Names [cite: 9, 10] */}
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

          {/* Row 2: Contact Data Fields [cite: 11, 12] */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="text"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 transition-all ${
                errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 transition-all ${
                errors.phoneNumber ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'
              }`}
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phoneNumber}</p>}
          </div>

          {/* Row 3: Company Setup [cite: 13] */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 transition-all ${
                errors.companyName ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'
              }`}
            />
            {errors.companyName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.companyName}</p>}
          </div>

          {/* Row 4: Status Fields Toggle [cite: 14] */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Account Operational Status [cite: 14]</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={formData.status === 'Active'}
                  onChange={() => setFormData({ ...formData, status: 'Active' })}
                  className="accent-emerald-600 h-4 w-4"
                />
                Active [cite: 14]
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={formData.status === 'Inactive'}
                  onChange={() => setFormData({ ...formData, status: 'Inactive' })}
                  className="accent-slate-600 h-4 w-4"
                />
                Inactive [cite: 14]
              </label>
            </div>
          </div>

          {/* Footer Interactive Actions */}
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
              {editingContact ? 'Save Modifications [cite: 36]' : 'Register Contact [cite: 20]'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};