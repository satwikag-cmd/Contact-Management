'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useContacts } from '../../../context/ContactContext';
import type { Note, Tag } from '../../../types/contact';

export default function ViewContactProfileRoute() {
  const { id } = useParams();
  const router = useRouter();
  const { contacts, updateContact } = useContacts();

  // Find the target contact profile record inside our global state context
  const contact = contacts.find(c => c.id === id);

  // Stateful interactive trackers for Notes Management UI Tasks
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Stateful tracking for Tags Management UI Tasks
  const [availableTags] = useState<Tag[]>([
    { id: 't1', name: 'Lead', color: 'bg-blue-500' },
    { id: 't2', name: 'Enterprise', color: 'bg-purple-500' },
    { id: 't3', name: 'Customer', color: 'bg-emerald-500' },
    { id: 't4', name: 'Partner', color: 'bg-amber-500' }
  ]);

  // Seed local profile data logs safely upon hydration
  useEffect(() => {
    if (contact) {
      // Pull items from localStorage if available, or fall back to standard logs
      const cachedNotes = localStorage.getItem(`notes_${contact.id}`);
      if (cachedNotes) {
        setNotes(JSON.parse(cachedNotes));
      } else {
        setNotes([
          { id: 'n1', contactId: contact.id, content: 'Initial profile initialized inside Next.js CRM matrix core shell.', createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: 'n2', contactId: contact.id, content: 'Onboarding verification checklist requirements fully satisfied.', createdAt: new Date().toISOString() }
        ]);
      }
    }
  }, [contact]);

  // Save changes to notes cluster locally whenever mutations occur
  useEffect(() => {
    if (contact && notes.length > 0) {
      localStorage.setItem(`notes_${contact.id}`, JSON.stringify(notes));
    }
  }, [notes, contact]);

  if (!contact) {
    return (
      <div className="p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-wider bg-white rounded-2xl border border-slate-200">
        Identity profile instance not located inside active index nodes.
      </div>
    );
  }

  // --- NOTES INTERACTION MANAGEMENT HANDLERS ---
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNoteItem: Note = {
      id: `note-${Date.now()}`,
      contactId: contact.id,
      content: newNoteText.trim(),
      createdAt: new Date().toISOString()
    };

    // Prepend to array to show notes in reverse chronological order as required
    setNotes([newNoteItem, ...notes]);
    setNewNoteText('');
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingText(note.content);
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editingText.trim()) return;
    setNotes(notes.map(n => n.id === noteId ? { ...n, content: editingText.trim(), updatedAt: new Date().toISOString() } : n));
    setEditingNoteId(null);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm("Are you sure you want to purge this structural interaction note?")) {
      setNotes(notes.filter(n => n.id !== noteId));
    }
  };

  // --- TAGS INTERACTION MANAGEMENT HANDLERS ---
  const handleTagToggle = (tag: Tag) => {
    const currentTags = contact.tags || [];
    const hasTag = currentTags.some(t => t.id === tag.id);
    
    let updatedTagsArray: Tag[];
    if (hasTag) {
      // Remove tag operation
      updatedTagsArray = currentTags.filter(t => t.id !== tag.id);
    } else {
      // Assign tag operation
      updatedTagsArray = [...currentTags, tag];
    }

    // Mutate state down into core Context Provider store engine
    updateContact(contact.id, { tags: updatedTagsArray });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 animate-fade-in relative z-10">
      
      {/* Dynamic Back-routing Controller */}
      <button 
        onClick={() => router.push('/contacts')}
        className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
      >
        ◀ Return to Directory
      </button>

      {/* Profile Information Header Block Frame */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 font-black text-xl uppercase shadow-sm select-none">
            {contact.firstName[0]}{contact.lastName[0]}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{contact.firstName} {contact.lastName}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{contact.location || 'Global Instance Node'}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
          !contact.isDeleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {!contact.isDeleted ? 'Active Profile Instance' : 'Soft-Deleted Instance'}
        </span>
      </div>

      {/* Twin Segment Grid Partitioning Frame layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Metadata Specifications & Tag Selectors */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Core Specifications</h3>
            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">Email target</p>
                <p className="text-slate-900 mt-0.5 font-bold break-all">{contact.email || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">Mobile vector</p>
                <p className="text-slate-900 mt-0.5 font-bold">{contact.mobileNumber || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">Gender designation</p>
                <p className="text-slate-900 mt-0.5 font-bold">{contact.gender || 'Male'}</p>
              </div>
            </div>
          </div>

          {/* Reusable Multi-Select Tag Selector Module Wrapper */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Taxonomy Profile Tags</h3>
            
            {/* Active assigned tag display labels badges tray */}
            <div className="flex flex-wrap gap-1.5 min-h-6 pb-2">
              {(contact.tags || []).length > 0 ? (
                contact.tags.map(t => (
                  <span key={t.id} className={`px-2 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-wider ${t.color || 'bg-slate-500'}`}>
                    {t.name}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide italic">No tags assigned.</span>
              )}
            </div>

            {/* Checkbox matrix mapping selector options fields */}
            <div className="space-y-2 pt-1 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Toggle Taxonomy Assignment</p>
              {availableTags.map((tag) => {
                const isAssigned = (contact.tags || []).some(t => t.id === tag.id);
                return (
                  <label key={tag.id} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                    <span className="text-xs font-bold text-slate-700">{tag.name}</span>
                    <input 
                      type="checkbox" 
                      checked={isAssigned} 
                      onChange={() => handleTagToggle(tag)}
                      className="accent-emerald-600 h-4 w-4 cursor-pointer" 
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center/Right Column: Interactive Notes Management Logger Board */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notes input submission form interface tray */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Append Interaction Transcript Note</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                placeholder="Log business metrics conversation snippets, validation feedback loops, or criteria files notes..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              />
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer">
                  Submit Note Entry
                </button>
              </div>
            </form>
          </div>

          {/* Dynamic reverse-chronological notes historical log feed */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">Historical Account Notes Ledger</h3>
            {notes.length > 0 ? (
              notes.map((note) => (
                <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs relative group transition-all">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <span>Logged on {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    
                    {/* Interactive action management tools layout */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3 text-xs font-bold lowercase tracking-wide">
                      {editingNoteId !== note.id ? (
                        <>
                          <button onClick={() => handleStartEdit(note)} className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer">edit</button>
                          <button onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:text-red-600 font-bold cursor-pointer">delete</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleSaveEdit(note.id)} className="text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer">save</button>
                          <button onClick={() => setEditingNoteId(null)} className="text-slate-500 hover:text-slate-600 font-bold cursor-pointer">cancel</button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingNoteId === note.id ? (
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none bg-slate-50"
                      rows={2}
                    />
                  ) : (
                    <p className="text-xs font-medium text-slate-700 leading-relaxed break-words">{note.content}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center p-8 bg-slate-50/40 border border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
                Zero conversation notes mapped to this identity pipeline partition.
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}