import { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { type ImportJob, type ImportHistoryItem } from '../types/imports';
import { type ApiResponse } from '../types/api';

export const useImportManager = (activeImportId?: string | null) => {
  const [jobStatus, setJobStatus] = useState<ImportJob | null>(null);
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch historical import logs
  const fetchImportHistory = async () => {
    try {
      const response = await apiClient.get<ApiResponse<ImportHistoryItem[]>>('/contacts/import-history');
      setHistory(response.data.data);
    } catch (err: any) {
      console.error('Failed to sync import history log cluster:', err);
    }
  };

  // 2. Poll the active job status until finished
  useEffect(() => {
    if (!activeImportId) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const response = await apiClient.get<ApiResponse<ImportJob>>(`/contacts/import/${activeImportId}`);
        if (!isMounted) return;

        const job = response.data.data;
        setJobStatus(job);

        // Stop polling if job reaches terminal state
        if (job.status === 'Completed' || job.status === 'Failed') {
          clearInterval(pollInterval);
          fetchImportHistory(); // Refresh logs on completion
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error tracking background processing nodes.');
          clearInterval(pollInterval);
        }
      }
    }, 2000); // Safe 2-second polling window loop

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [activeImportId]);

  // 3. Multipart standard file upload handler
  const uploadCSV = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<ApiResponse<{ importId: string }>>(
        '/contacts/import', 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      fetchImportHistory();
      return response.data.data.importId;
    } catch (err: any) {
      setError(err.message || 'Failed to parse file target execution block.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    jobStatus,
    importHistory: history,
    isUploading,
    importError: error,
    uploadCSV,
    fetchImportHistory
  };
};