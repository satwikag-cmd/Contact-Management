// src/features/contacts/ContactProfilePage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContacts } from '../../context/ContactContext';
import type { Note, ActivityTimelineItem } from '../../types/contact';

export default function ContactProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contacts } = useContacts();

  // Find the target profile record matching the current URL location parameter
  const contact = contacts.find((c) => c.id === id);

  // Mock states mirroring your teammate's GET endpoints for notes and activities
  const [notes, setNotes] = useState<Note[]>([
    { id: 'n1', contactId: id || '', content: 'Initial introduction call completed. Client interested in enterprise tier.', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'n2', contactId: id || '', content: 'Follow-up email sent regarding API integration documentation parameters.', createdAt: new Date().toISOString() }
  ]);

  const [activities] = useState<ActivityTimelineItem[]>([
    { id: 'a1', type: 'system', description: 'Profile initialized in CRM ledger', timestamp: contact?.createdAt || new Date().toISOString() },
    { id: 'a2', type: 'note_added', description: 'Interaction transcript log appended to record', timestamp: new Date().toISOString() }
  ]);

  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  if (!contact) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-xl mx-auto">
        <p className="text-sm font-bold text-slate-700">Identity Node Absent</p>
        <p className="text-xs text-slate-400 mt-1">The requested profile cannot be loaded from the current database index.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl">
          Return to Directory
        </button>
      </div>
    );
  }

  // --- INTERACTION LOGIC (Maps directly to note endpoints) ---
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      contactId: contact.id,
      content: newNoteText.trim(),
      createdAt: new Date().toISOString()
    };

    setNotes([newNote, ...notes]);
    setNewNoteText('');
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingText(note.content);
  };

  const handleSaveEdit = (noteId: string) => {
    setNotes(notes.map(n => n.id === noteId ? { ...n, content: editingText.trim(), updatedAt: new Date().toISOString() } : n));
    setEditingNoteId(null);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm("Are you sure you want to purge this record note from ledger?")) {
      setNotes(notes.filter(n => n.id !== noteId));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4 animate-fade-in">
      {/* Return Navigation */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
      >
        ◀ Back to Directory
      </button>

      {/* Profile Header Block */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-xl uppercase shadow-xs">
            {contact.firstName[0]}{contact.lastName[0]}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{contact.firstName} {contact.lastName}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{contact.location || 'Global Instance'}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
          !contact.isDeleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {!contact.isDeleted ? 'Active Node' : 'Inactive Node'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Hand: Core Info Metadata Sheet */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Profile Core Specifications</h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-slate-400 text-[10px] uppercase">Email Target</p>
                <p className="font-semibold text-slate-800 mt-0.5 break-all">{contact.email || '—'}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 text-[10px] uppercase">Mobile Vector</p>
                <p className="font-semibold text-slate-800 mt-0.5">{contact.mobileNumber || '—'}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 text-[10px] uppercase">System Registration Time</p>
                <p className="font-semibold text-slate-500 mt-0.5">{new Date(contact.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Interactive Notes Logger Board */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes Input Field form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Append Interaction Transcript</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                placeholder="Log conversation metrics, business flags, or project criteria here..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer">
                  Submit Note Entry
                </button>
              </div>
            </form>
          </div>

          {/* Notes Workspace Stream Container */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">Historical Notes Feed</h3>
            {notes.map((note) => (
              <div key={note.id} className="bg-white/80 border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs relative group transition-all">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>Logged on {new Date(note.createdAt).toLocaleDateString('en-IN')}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    {editingNoteId !== note.id ? (
                      <>
                        <button onClick={() => handleStartEdit(note)} className="text-blue-500 hover:text-blue-700 font-bold cursor-pointer">Edit</button>
                        <button onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:text-red-700 font-bold cursor-pointer">Delete</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleSaveEdit(note.id)} className="text-emerald-600 hover:text-emerald-800 font-bold cursor-pointer">Save</button>
                        <button onClick={() => setEditingNoteId(null)} className="text-slate-500 hover:text-slate-700 font-bold cursor-pointer">Cancel</button>
                      </>
                    )}
                  </div>
                </div>
                {editingNoteId === note.id ? (
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-slate-50"
                    rows={2}
                  />
                ) : (
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">{note.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}