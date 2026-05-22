// src/App.tsx
import React, { useState } from 'react';
import { ContactProvider, useContacts } from './context/ContactContext';
import { ContactStats } from './components/ContactStats';
import { ContactFilters } from './components/ContactFilters';
import { ContactTable } from './components/ContactTable';
import { ContactFormModal } from './components/ContactFormModal';
import { ContactViewModal } from './components/ContactViewModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { QuickListModal } from './components/QuickListModal';
import { CustomCursor } from './components/CustomCursor';
import type { Contact } from './types/contact';

const DashboardWorkspace: React.FC = () => {
  const { contacts, addContact, updateContact, deleteContact } = useContacts();

  // Primary filtering query and sort parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals visibility tracking states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQuickListOpen, setIsQuickListOpen] = useState(false);

  // Focus targets operations pointers
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Compute live data transformations (Filter -> Sort structural sequence)
  const processedContacts = contacts
    .filter((contact) => {
      const matchesSearch =
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || contact.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      if (sortOrder === 'asc') return nameA.localeCompare(nameB);
      return nameB.localeCompare(nameA);
    });

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

  const handleSaveContact = (formData: Omit<Contact, 'id' | 'createdDate'>) => {
    setIsActionLoading(true);
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
    if (processedContacts.length === 0) return alert("No database entities map query parameters.");
    const headers = ["First Name", "Last Name", "Email", "Phone", "Company", "Status", "Created Date"];
    const rows = processedContacts.map(c => [c.firstName, c.lastName, c.email, c.phoneNumber, c.companyName, c.status, c.createdDate]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Registry_Extract_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const targetedDeleteName = contacts.find((c) => c.id === targetDeleteId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative">
      
      {/* Structural Custom Target Tracking Pointer */}
      <CustomCursor />
      
      {/* Layout Isolation clipping layer wrapper */}
      <div className="absolute inset-0 w-full h-full min-h-screen overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-emerald-300/20 blur-[130px] mix-blend-multiply animate-blob-one"></div>
        <div className="absolute bottom-[-15%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-blue-300/20 blur-[110px] mix-blend-multiply animate-blob-two"></div>
      </div>

      {/* Corporate Dashboard Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">ContactHub</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Enterprise Directory Portal</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Node Operational</span>
          </div>
        </div>
      </header>

      {/* Primary Context Workspace */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-grow relative z-10">
        <ContactStats contacts={contacts} />
        
        <ContactFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onAddContactClick={handleOpenAddForm}
          onExportCSV={handleExportCSV}
          onOpenQuickList={() => setIsQuickListOpen(true)}
        />

        <ContactTable
          contacts={processedContacts}
          onView={handleOpenViewModal}
          onEdit={handleOpenEditForm}
          onDelete={handleOpenDeleteModal}
        />
      </main>

      {/* Dialog Overlay Modals Layer Pipelines */}
      <ContactFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveContact} editingContact={selectedContact} />
      <ContactViewModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} contact={selectedContact} />
      <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} contactName={targetedDeleteName ? `${targetedDeleteName.firstName} ${targetedDeleteName.lastName}` : ''} />
      
      {/* Quick-List pop dialogue pipeline linking directly to full detail profile sheet inspector */}
      <QuickListModal 
        isOpen={isQuickListOpen} 
        onClose={() => setIsQuickListOpen(false)} 
        contacts={processedContacts} 
        onSelectContact={handleOpenViewModal} 
      />

      {/* Simulated Async Global Loading Screen overlay */}
      {isActionLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-xs animate-fade-in">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-slate-200 border-t-emerald-600 animate-spin"></div>
            <span className="text-xs font-bold text-slate-700 tracking-wide">Syncing Directory Cluster...</span>
          </div>
        </div>
      )}

      <footer className="bg-white/50 border-t border-slate-200/60 py-3 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider z-10">
        &copy; {new Date().getFullYear()} Contact Management Dashboard. All node parameters finalized.
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ContactProvider>
      <DashboardWorkspace />
    </ContactProvider>
  );
};

export default App;