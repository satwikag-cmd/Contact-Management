// src/context/ContactContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Contact } from '../types/contact';

interface ContactContextType {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'lastActivityAt' | 'isDeleted' | 'tags'>) => void;
  updateContact: (id: string, updatedContact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  clearAllDuplicates: () => void; // Added cleanup trigger handle
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const savedContacts = localStorage.getItem('cms_contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  }, []);

  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem('cms_contacts', JSON.stringify(contacts));
    }
  }, [contacts]);

  const addContact = (newContactData: Omit<Contact, 'id' | 'createdAt' | 'lastActivityAt' | 'isDeleted' | 'tags'>) => {
    const newContact: Contact = {
      ...newContactData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      tags: [],
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      isDeleted: false,
    };
    setContacts((prev) => [newContact, ...prev]);
  };

  const updateContact = (id: string, updatedFields: Partial<Contact>) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id ? { ...contact, ...updatedFields, lastActivityAt: new Date().toISOString() } : contact
      )
    );
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  // --- GLOBAL DE-DUPLICATION ENGINE SYSTEM ---
  const clearAllDuplicates = () => {
    setContacts((prevContacts) => {
      const seenEmails = new Set<string>();
      const seenPhones = new Set<string>();
      const uniqueContacts: Contact[] = [];
      let duplicateCount = 0;

      // Scan backwards (keep the newest added entries, drop the older duplicates)
      prevContacts.forEach((contact) => {
        const emailKey = contact.email?.toLowerCase().trim();
        // Normalize phone number by removing spaces, dashes, and parentheses
        const phoneKey = contact.mobileNumber?.replace(/[\s\-()]/g, '');

        let isDuplicate = false;

        if (emailKey && seenEmails.has(emailKey)) isDuplicate = true;
        if (phoneKey && seenPhones.has(phoneKey)) isDuplicate = true;

        if (isDuplicate) {
          duplicateCount++;
        } else {
          if (emailKey) seenEmails.add(emailKey);
          if (phoneKey) seenPhones.add(phoneKey);
          uniqueContacts.push(contact);
        }
      });

      alert(`Database Sweep Settled:\nIdentified and purged ${duplicateCount} duplicate row records from index maps.`);
      return uniqueContacts;
    });
  };

  return (
    <ContactContext.Provider value={{ contacts, addContact, updateContact, deleteContact, clearAllDuplicates }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (!context) throw new Error('useContacts must be used within a ContactProvider');
  return context;
};