// src/components/Providers.tsx
'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../api/queryClient';
import { ContactProvider } from '../context/ContactContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ContactProvider>
        {children}
      </ContactProvider>
    </QueryClientProvider>
  );
}