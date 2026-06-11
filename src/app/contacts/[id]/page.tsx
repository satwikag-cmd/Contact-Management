'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/apiClient';

export default function ViewContactProfileRoute() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Stateful interactive trackers for Notes Forms
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // 📡 REACT QUERY LIVE DATA FETCHER (Hits his endpoint: /api/v1/contacts/:id)
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['contact-profile', id],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/api/v1/contacts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // --- LIVE SERVER NOTES MUTATION HOOKS ---
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiClient.post(`/api/v1/contacts/${id}/notes`, { 
        note: content 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-profile', id] });
      setNewNoteText('');
    },
  });

  const editNoteMutation = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      return await apiClient.put(`/api/v1/contacts/${id}/notes/${noteId}`, { 
        note: content 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-profile', id] });
      setEditingNoteId(null);
      setEditingText('');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      return await apiClient.delete(`/api/v1/contacts/${id}/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-profile', id] });
    },
  });

  // Loading Screen Layout
  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3 select-none">
        <div className="h-6 w-6 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Loading Live Operational Node Profile...</p>
      </div>
    );
  }

  // Error Mesh Screen Layout
  if (isError || !profile) {
    return (
      <div className="p-12 text-center bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-wider max-w-5xl mx-auto">
        ⚠️ Failed to mount profile record from endpoint. Check server connection logs.
      </div>
    );
  }

  // 📝 Safely unpack nested schema coordinates from his server payload
  const basicInfo = profile["Basic Information"] || {};
  const activitySummary = profile["Activity Summary"] || {};
  const activityTimeline = profile["Activity Timeline"] || [];
  const notes = profile["Notes"] || [];

  const contactName = basicInfo["Name"] || "Unknown Subject";
  const emailTarget = basicInfo["Email"] || "—";
  const mobileVector = basicInfo["Mobile Number"] || "—";
  const birthDate = basicInfo["Date of Birth"] || "";
  const genderDesignation = basicInfo["Gender"] || "unspecified";
  
  // ✅ COMPLETE SPEC LOCATION BINDINGS MAP MATCH
  const city = basicInfo["Location"]?.["City"] || "—";
  const state = basicInfo["Location"]?.["State"] || "—";
  const country = basicInfo["Location"]?.["Country"] || "—";
  const fullLocationString = city !== "—" ? `${city}, ${state}, ${country}` : "Global Instance Node";

  // --- ACTIONS HANDLERS ---
  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addNoteMutation.mutate(newNoteText.trim());
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editingText.trim()) return;
    editNoteMutation.mutate({ noteId, content: editingText.trim() });
  };

  const handleDeleteNoteClick = (noteId: string) => {
    if (window.confirm("Are you sure you want to purge this interaction note?")) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 animate-fade-in relative z-10">
      
      {/* Dynamic Back-routing */}
      <button 
        onClick={() => router.push('/contacts')}
        className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
      >
        ◀ Return to Directory
      </button>

      {/* Profile Header Block */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 font-black text-xl uppercase shadow-sm select-none">
            {contactName[0]}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{contactName}</h2>
              <button 
                onClick={() => router.push(`/contacts/${id}/edit`)}
                className="px-2 py-0.5 border border-blue-200 text-blue-600 bg-blue-50/20 text-[10px] font-black rounded-lg uppercase tracking-wider hover:bg-blue-50 cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{fullLocationString}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200">
          Node Context Resolved
        </span>
      </div>

      {/* Dynamic Activity Summary Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(activitySummary).map(([key, value]: any) => (
          <div key={key} className="bg-white p-3.5 border border-slate-200 rounded-xl text-center shadow-2xs">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider line-clamp-1">{key.replace("Total ", "")}</p>
            <p className="text-lg font-black text-slate-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Twin Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Specifications Metadata */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Core Specifications</h3>
            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">Email address</p>
                <p className="text-slate-900 mt-0.5 font-bold break-all">{emailTarget}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">Mobile number vector</p>
                <p className="text-slate-900 mt-0.5 font-bold">{mobileVector}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">Gender designation</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 font-black text-[10px] uppercase rounded">
                  {genderDesignation || 'unspecified'}
                </span>
              </div>
              
              {/* ✅ COMPLETED DATE OF BIRTH SPECIFICATION RENDER */}
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">Date of birth</p>
                <p className="text-slate-900 mt-0.5 font-bold">
                  {birthDate ? new Date(birthDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>

              {/* ✅ NEW FULL GEOGRAPHICAL SPECIFICATIONS LAYOUT CONTAINER */}
              <div className="border-t pt-3 grid grid-cols-3 gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-center">
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-wide">City</p>
                  <p className="text-slate-800 font-extrabold mt-0.5">{city}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-wide">State</p>
                  <p className="text-slate-800 font-extrabold mt-0.5">{state}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-wide">Country</p>
                  <p className="text-slate-800 font-extrabold mt-0.5">{country}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Activity Timeline Array Ledger Feed */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">System Audit Timeline</h3>
            <div className="space-y-4 relative pl-3 border-l border-slate-100">
              {activityTimeline.length > 0 ? (
                activityTimeline.map((item: any) => (
                  <div key={item.id} className="relative text-xs space-y-0.5">
                    <div className="absolute -left-[16.5px] top-1 h-2 w-2 rounded-full bg-emerald-500 border border-white shadow-xs" />
                    <p className="font-bold text-slate-800 capitalize">{item.activity_type.replace("_", " ")}</p>
                    <p className="text-slate-500 text-[11px] font-medium leading-normal">{item.details}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      {new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[11px] font-bold text-slate-400 uppercase italic">Timeline index cleared.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Notes Workspace Logs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Note Add Submission Frame */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Append Interaction Transcript Note</h3>
            <form onSubmit={handleAddNoteSubmit} className="space-y-3">
              <textarea
                placeholder="Log profile metrics conversation snippets, workspace logs notes, or system checklist overrides directly..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              />
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={addNoteMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-40"
                >
                  {addNoteMutation.isPending ? 'Submitting...' : 'Submit Note Entry'}
                </button>
              </div>
            </form>
          </div>

          {/* Dynamic reverse-chronological notes historical log feed */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">Historical Account Notes Ledger</h3>
            {notes && notes.length > 0 ? (
              notes.map((note: any) => {
                const activeNoteText = note.note || note.note_content || note.content || '';

                return (
                  <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs relative group transition-all">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <span>Logged on {new Date(note.created_at || note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3 text-xs font-bold lowercase tracking-wide">
                        {editingNoteId !== note.id ? (
                          <>
                            <button 
                              onClick={() => { setEditingNoteId(note.id); setEditingText(activeNoteText); }} 
                              className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                            >
                              edit
                            </button>
                            <button onClick={() => handleDeleteNoteClick(note.id)} className="text-red-500 hover:text-red-600 font-bold cursor-pointer">delete</button>
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
                      <p className="text-xs font-medium text-slate-700 leading-relaxed break-words">
                        {activeNoteText}
                      </p>
                    )}
                  </div>
                );
              })
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