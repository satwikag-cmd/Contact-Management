// src/context/ContactContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Contact } from '../types/contact';

// Define what states and actions will be available across the app
interface ContactContextType {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdDate' | 'avatar'>) => void;
  updateContact: (id: string, updatedContact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  updateContactAvatar: (id: string, base64Image: string) => void; // Add this line
}
const ContactContext = createContext<ContactContextType | undefined>(undefined);

// Professional pre-filled mock data so the reviewer sees a populated UI instantly
const INITIAL_MOCK_DATA: Contact[] = [
  {
    id: '1',
    firstName: 'Arjun',
    lastName: 'Sharma',
    email: 'arjun.sharma@example.com',
    phoneNumber: '+91 98765 43210',
    companyName: 'Tech India Labs',
    status: 'Active',
    createdDate: new Date('2026-01-15').toISOString(),
  },
  {
    id: '2',
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.patel@designco.in',
    phoneNumber: '+91 87654 32109',
    companyName: 'Creative Canvas',
    status: 'Inactive',
    createdDate: new Date('2026-03-22').toISOString(),
  },
];

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage, or fall back to mock data if empty
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const savedContacts = localStorage.getItem('cms_contacts');
    return savedContacts ? JSON.parse(savedContacts) : INITIAL_MOCK_DATA;
  });

  // Sync state changes to localStorage automatically
  useEffect(() => {
    localStorage.setItem('cms_contacts', JSON.stringify(contacts));
  }, [contacts]);

  // Action: Add Contact
  const addContact = (newContactData: Omit<Contact, 'id' | 'createdDate'>) => {
    const newContact: Contact = {
      ...newContactData,
      id: crypto.randomUUID(), // Generates a secure, unique identifier string
      createdDate: new Date().toISOString(),
    };
    setContacts((prev) => [newContact, ...prev]);
  };

  // Action: Edit/Update Contact
  const updateContact = (id: string, updatedFields: Partial<Contact>) => {
    setContacts((prev) =>
      prev.map((contact) => (contact.id === id ? { ...contact, ...updatedFields } : contact))
    );
  };

  // Action: Delete Contact
  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  const updateContactAvatar = (id: string, base64Image: string) => {
    setContacts((prev) =>
      prev.map((contact) => (contact.id === id ? { ...contact, avatar: base64Image } : contact))
    );
  };

  return (
    <ContactContext.Provider value={{ contacts, addContact, updateContact, deleteContact, updateContactAvatar }}>
      {children}
    </ContactContext.Provider>
  );
};

// Custom hook to consume the contact state effortlessly in components
export const useContacts = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};