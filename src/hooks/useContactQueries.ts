// src/hooks/useContactQueries.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import type { Contact, Note, Tag } from '../types/contact';

export const useContactQueries = () => {
  const queryClient = useQueryClient();

  // ==========================================
  // 👥 CONTACTS DATA APIS TRACKS
  // ==========================================
  
  const useFetchContacts = (search: string, status: string) => {
    return useQuery({
      queryKey: ['contacts', { search, status }],
      queryFn: async () => {
        const response = await apiClient.get<{ data: Contact[] }>('/contacts', {
          params: { search: search || undefined, status: status !== 'All' ? status : undefined }
        });
        return response.data.data;
      }
    });
  };

  const useCreateContact = () => {
    return useMutation({
      mutationFn: async (newContact: Omit<Contact, 'id' | 'createdAt' | 'lastActivityAt' | 'isDeleted' | 'tags'>) => {
        const response = await apiClient.post('/contacts', newContact);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
      }
    });
  };

  const useUpdateContact = () => {
    return useMutation({
      mutationFn: async ({ id, fields }: { id: string; fields: Partial<Contact> }) => {
        const response = await apiClient.patch(`/contacts/${id}`, fields);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['contact', variables.id] });
      }
    });
  };

  const useSoftDeleteContact = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        const response = await apiClient.delete(`/contacts/${id}`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
      }
    });
  };

  const useRestoreContact = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        const response = await apiClient.post(`/contacts/${id}/restore`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
      }
    });
  };

  // ==========================================
  // 📝 INTERACTION NOTES MANAGEMENT APIS
  // ==========================================

  // Fetch all historical account notes ledger assigned to a specific contact ID
  const useFetchNotes = (contactId: string) => {
    return useQuery({
      queryKey: ['notes', contactId],
      queryFn: async () => {
        const response = await apiClient.get<{ data: Note[] }>(`/contacts/${contactId}/notes`);
        return response.data.data;
      },
      enabled: !!contactId // Only fire request if a valid ID string is mounted
    });
  };

  const useAddNote = () => {
    return useMutation({
      mutationFn: async ({ contactId, content }: { contactId: string; content: string }) => {
        const response = await apiClient.post(`/contacts/${contactId}/notes`, { content });
        return response.data;
      },
      onSuccess: (_, variables) => {
        // Refresh the specific notes cache list partition instantly
        queryClient.invalidateQueries({ queryKey: ['notes', variables.contactId] });
      }
    });
  };

  const useEditNote = () => {
    return useMutation({
      mutationFn: async ({ contactId, noteId, content }: { contactId: string; noteId: string; content: string }) => {
        const response = await apiClient.patch(`/contacts/${contactId}/notes/${noteId}`, { content });
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['notes', variables.contactId] });
      }
    });
  };

  const useDeleteNote = () => {
    return useMutation({
      mutationFn: async ({ contactId, noteId }: { contactId: string; noteId: string }) => {
        const response = await apiClient.delete(`/contacts/${contactId}/notes/${noteId}`);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['notes', variables.contactId] });
      }
    });
  };

  // ==========================================
  // 🏷️ TAXONOMY TAG MANAGEMENT APIS
  // ==========================================

  // Fetch the global corporate tag rules taxonomy list choices
  const useFetchGlobalTags = () => {
    return useQuery({
      queryKey: ['global-tags'],
      queryFn: async () => {
        const response = await apiClient.get<{ data: Tag[] }>('/tags');
        return response.data.data;
      }
    });
  };

  const useAssignTag = () => {
    return useMutation({
      mutationFn: async ({ contactId, tagId }: { contactId: string; tagId: string }) => {
        const response = await apiClient.post(`/contacts/${contactId}/tags/${tagId}`);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['contact', variables.contactId] });
      }
    });
  };

  const useRemoveTag = () => {
    return useMutation({
      mutationFn: async ({ contactId, tagId }: { contactId: string; tagId: string }) => {
        const response = await apiClient.delete(`/contacts/${contactId}/tags/${tagId}`);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['contact', variables.contactId] });
      }
    });
  };

  return {
    useFetchContacts,
    useCreateContact,
    useUpdateContact,
    useSoftDeleteContact,
    useRestoreContact,
    
    useFetchNotes,
    useAddNote,
    useEditNote,
    useDeleteNote,
    
    useFetchGlobalTags,
    useAssignTag,
    useRemoveTag
  };
};