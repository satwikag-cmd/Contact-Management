// src/hooks/useContacts.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import type { Contact, ContactListQueryParams } from '../types/contact';
import type { PaginationResponse } from '../types/api';

// Self-contained query debounce mechanism
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const useContactsManager = (initialParams: ContactListQueryParams) => {
  const [params, setParams] = useState<ContactListQueryParams>(initialParams);
  const [data, setData] = useState<PaginationResponse<Contact> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search term by 400ms to throttle excess backend endpoint fires
  const debouncedSearch = useDebounce(params.search, 400);

  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PaginationResponse<Contact>>('/contacts', {
        params: {
          page: params.page,
          limit: params.limit,
          sortField: params.sortField,
          sortOrder: params.sortOrder,
          // Only map string query filters if they possess concrete values
          search: debouncedSearch?.trim() ? debouncedSearch : undefined,
          tags: params.tags && params.tags.length > 0 ? params.tags.join(',') : undefined,
          country: params.country || undefined,
          state: params.state || undefined,
          city: params.city || undefined,
        },
      });
      setData(response.data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while syncing data collections.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run execution pipeline whenever criteria modifiers mutate
  useEffect(() => {
    fetchContacts();
  }, [
    params.page,
    params.limit,
    params.sortField,
    params.sortOrder,
    params.country,
    params.state,
    params.city,
    params.tags,
    debouncedSearch,
  ]);

  const updatePage = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const updateSearch = (query: string) => {
    setParams((prev) => ({ ...prev, search: query, page: 1 }));
  };

  const updateSorting = (field: 'name' | 'createdAt' | 'lastActivityAt', order: 'asc' | 'desc') => {
    setParams((prev) => ({ ...prev, sortField: field, sortOrder: order }));
  };

  const updateLocationFilters = (filters: { country?: string; state?: string; city?: string }) => {
    setParams((prev) => ({ ...prev, ...filters, page: 1 }));
  };

  return {
    contactsData: data?.data || [],
    meta: data?.meta || null,
    isLoading,
    error,
    params,
    updatePage,
    updateSearch,
    updateSorting,
    updateLocationFilters,
    refetchContacts: fetchContacts,
  };
};