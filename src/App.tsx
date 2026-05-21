// src/App.tsx
import React, { useState } from 'react';
import { ContactProvider, useContacts } from './context/ContactContext';
import { ContactFilters } from './components/ContactFilters';
import { ContactTable } from './components/ContactTable';
import { ContactFormModal } from './components/ContactFormModal';
import { ContactViewModal } from './components/ContactViewModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ContactStats } from './components/ContactStats';
import type { Contact } from './types/contact';

const DashboardWorkspace: React.FC = () => {
  const { contacts, addContact, updateContact, deleteContact } = useContacts();

    const [isActionLoading, setIsActionLoading] = useState(false);

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modals management states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Active records targeting states
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  // Realtime search and filter compute pipeline [cite: 33, 34]
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || contact.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Action orchestration handlers
  const handleOpenAddForm = () => {
    setSelectedContact(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (contact: Contact) => {
    setSelectedContact(contact);
    setIsFormOpen(true);
  };

  const handleOpenViewModal = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewOpen(true);
  };

  const handleOpenDeleteModal = (id: string) => {
    setTargetDeleteId(id);
    setIsDeleteOpen(true);
  };

  // State mutation executions
  const handleSaveContact = (formData: Omit<Contact, 'id' | 'createdDate'>) => {
    setIsActionLoading(true);
    
    // Simulate a high-speed 600ms API roundtrip database save
    setTimeout(() => {
      if (selectedContact) {
        updateContact(selectedContact.id, formData);
      } else {
        addContact(formData);
      }
      setIsActionLoading(false);
    }, 600);
  };

  const handleConfirmDelete = () => {
    if (targetDeleteId) {
      setIsActionLoading(true);
      setTimeout(() => {
        deleteContact(targetDeleteId);
        setIsDeleteOpen(false);
        setTargetDeleteId(null);
        setIsActionLoading(false);
      }, 500);
    }
  };

  const handleExportCSV = () => {
    if (filteredContacts.length === 0) return alert("No contact records available to export.");

    // Define headers matching assignment requirements
    const headers = ["First Name", "Last Name", "Email", "Phone", "Company", "Status", "Created Date"];
    
    const rows = filteredContacts.map(c => [
      c.firstName,
      c.lastName,
      c.email,
      c.phoneNumber,
      c.companyName,
      c.status,
      c.createdDate
    ]);

    // Construct standard CSV string format
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    // Trigger browser downloader anchor pipeline natively
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Directory_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get the targeted name to display in delete message confirmation box safely
  const targetedDeleteName = contacts.find((c) => c.id === targetDeleteId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative">
      
      {/* FIXED OVERFLOW CLIPPING WRAPPER FOR BACKGROUND BLOBS */}
      <div className="absolute inset-0 w-full h-full min-h-screen overflow-hidden pointer-events-none z-0">
        {/* Blob 1 */}
        <div className="absolute top-[-15%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-emerald-300/25 blur-[120px] mix-blend-multiply animate-blob-one"></div>
        {/* Blob 2 */}
        <div className="absolute bottom-[-15%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-blue-300/25 blur-[110px] mix-blend-multiply animate-blob-two"></div>
      </div>

      {/* Header View - Ensure z-20 keeps it sitting neatly above the background mask */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">ContactHub</h1>
            <p className="text-xs text-slate-500 font-medium">Contact Management Portal</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-600 font-medium">System Active</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <ContactStats contacts={contacts} />

        <ContactFilters
          onExportCSV={handleExportCSV}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onAddContactClick={handleOpenAddForm}
        />

        <ContactTable
          contacts={filteredContacts}
          onView={handleOpenViewModal}
          onEdit={handleOpenEditForm}
          onDelete={handleOpenDeleteModal}
        />
      </main>

      {/* Dynamic Overlay Dialog Layer Pipelines */}
      <ContactFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveContact}
        editingContact={selectedContact}
      />

      <ContactViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        contact={selectedContact}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        contactName={targetedDeleteName ? `${targetedDeleteName.firstName} ${targetedDeleteName.lastName}` : ''}
      />

      {/* Structural Footer Layer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400 font-medium">
        &copy; {new Date().getFullYear()} Contact Management Portal. Built with precision.
      </footer>
    </div>
  );

  {/* Global Action Processing Loader Overlay */}
  {isActionLoading && (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/20 backdrop-blur-xs animate-fade-in">
      <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-100 flex items-center gap-4">
        {/* Sleek CSS Spinner */}
        <div className="h-6 w-6 rounded-full border-3 border-emerald-100 border-t-emerald-600 animate-spin"></div>
        <span className="text-sm font-semibold text-slate-700 tracking-wide">Updating Directory...</span>
      </div>
    </div>
  )}
};

const App: React.FC = () => {
  return (
    <ContactProvider>
      <DashboardWorkspace />
    </ContactProvider>
  );
};

export default App;