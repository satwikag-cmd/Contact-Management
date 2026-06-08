// src/utils/env.ts
export const env = {
  // Using globalThis tells TypeScript to look at the global runtime environment safely
  NEXT_PUBLIC_API_URL: (typeof window !== 'undefined' ? (globalThis as any).process?.env?.NEXT_PUBLIC_API_URL : undefined) || 'https://api.kasplo.crm/v1',
} as const;