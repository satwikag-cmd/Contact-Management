'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import type { Contact } from '../types/contact';

export const useContactQueries = () => {
  const queryClient = useQueryClient();

  // 📡 Clean fetch signature perfectly aligned with your backend payload requirements
  const useFetchContacts = (
    page: number, 
    limit: number, 
    search: string, 
    status: string,
    city?: string,     
    state?: string,    
    country?: string
  ) => {
    return useQuery({
      queryKey: ['contacts', { page, limit, search, status, city, state, country }],
      queryFn: async () => {
        const response = await apiClient.get<{ 
          data: Contact[]; 
          total: number; 
          page: number; 
          limit: number; 
          total_pages: number; 
        }>('/api/v1/contacts', {
          params: { 
            page,
            limit,
            search: search || undefined, 
            status: status !== 'All' ? status : undefined,
            city: city || undefined,
            state: state || undefined,
            country: country || undefined
          }
        });
        return response.data;
      }
    });
  };

  const useCreateContact = () => {
    return useMutation({
      mutationFn: async (newContact: Omit<Contact, 'id' | 'createdAt' | 'lastActivityAt' | 'isDeleted' | 'tags'>) => {
        try {
          const response = await apiClient.post('/api/v1/contacts', newContact);
          return response.data;
        } catch (err: any) {
          // 🚀 THE FIX: Catch the error raw from Axios, extract the body, and throw it downstream
          if (err.response && err.response.data) {
            throw err.response.data;
          }
          throw err;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
      }
    });
  };

  const useUpdateContact = () => {
    return useMutation({
      mutationFn: async ({ id, fields }: { id: string; fields: Partial<Contact> }) => {
        const response = await apiClient.patch(`/api/v1/contacts/${id}`, fields);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['contact-profile', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['contact-profile-edit', variables.id] });
      }
    });
  };

  const useSoftDeleteContact = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        const response = await apiClient.delete(`/api/v1/contacts/${id}`);
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
        const response = await apiClient.post(`/api/v1/contacts/${id}/restore`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
      }
    });
  };

  const useFetchNotes = (contactId: string) => {
    return useQuery({
      queryKey: ['notes', contactId],
      queryFn: async () => {
        const response = await apiClient.get<{ notes: any[] }>(`/api/v1/contacts/${contactId}/notes`);
        return response.data.notes || []; 
      },
      enabled: !!contactId 
    });
  };

  const useAddNote = () => {
    return useMutation({
      mutationFn: async ({ contactId, content }: { contactId: string; content: string }) => {
        const response = await apiClient.post(`/api/v1/contacts/${contactId}/notes`, { 
          note: content 
        });
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['notes', variables.contactId] });
        queryClient.invalidateQueries({ queryKey: ['contact-profile', variables.contactId] });
      }
    });
  };

  const useEditNote = () => {
    return useMutation({
      mutationFn: async ({ contactId, noteId, content }: { contactId: string; noteId: string; content: string }) => {
        const response = await apiClient.put(`/api/v1/contacts/${contactId}/notes/${noteId}`, { 
          note: content 
        });
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['notes', variables.contactId] });
        queryClient.invalidateQueries({ queryKey: ['contact-profile', variables.contactId] });
      }
    });
  };

  const useDeleteNote = () => {
    return useMutation({
      mutationFn: async ({ contactId, noteId }: { contactId: string; noteId: string }) => {
        const response = await apiClient.delete(`/api/v1/contacts/${contactId}/notes/${noteId}`);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['notes', variables.contactId] });
        queryClient.invalidateQueries({ queryKey: ['contact-profile', variables.contactId] });
      }
    });
  };

  const useFetchGlobalTags = () => {
    return useQuery({
      queryKey: ['global-tags'],
      queryFn: async () => {
        const localTags = localStorage.getItem('crm_master_rules_tags');
        if (localTags) return JSON.parse(localTags);
        
        const defaultStarter = ['Lead', 'VIP', 'Customer', 'Prospect'];
        localStorage.setItem('crm_master_rules_tags', JSON.stringify(defaultStarter));
        return defaultStarter;
      }
    });
  };

  const useCreateGlobalTag = () => {
    return useMutation({
      mutationFn: async (newTagName: string) => {
        const cachedTags: string[] = queryClient.getQueryData(['global-tags']) || [];
        const updatedTags = [...cachedTags, newTagName];
        localStorage.setItem('crm_master_rules_tags', JSON.stringify(updatedTags));
        return updatedTags;
      },
      onSuccess: (data) => {
        queryClient.setQueryData(['global-tags'], data);
      }
    });
  };

  const useDeleteGlobalTag = () => {
    return useMutation({
      mutationFn: async (tagNameToRemove: string) => {
        const cachedTags: string[] = queryClient.getQueryData(['global-tags']) || [];
        const updatedTags = cachedTags.filter(t => t !== tagNameToRemove);
        localStorage.setItem('crm_master_rules_tags', JSON.stringify(updatedTags));
        return updatedTags;
      },
      onSuccess: (data) => {
        queryClient.setQueryData(['global-tags'], data);
      }
    });
  };

  const useAssignTag = () => {
    return useMutation({
      mutationFn: async ({ contactId, tagId }: { contactId: string; tagId: string }) => {
        const response = await apiClient.post(`/api/v1/contacts/${contactId}/tags/${tagId}`);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['contact-profile', variables.contactId] });
      }
    });
  };

  const useRemoveTag = () => {
    return useMutation({
      mutationFn: async ({ contactId, tagId }: { contactId: string; tagId: string }) => {
        const response = await apiClient.delete(`/api/v1/contacts/${contactId}/tags/${tagId}`);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['contact-profile', variables.contactId] });
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
    useCreateGlobalTag,
    useDeleteGlobalTag,
    useAssignTag,
    useRemoveTag
  };
};