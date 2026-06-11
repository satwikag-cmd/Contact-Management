'use client';

import  { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../api/apiClient';

export default function BulkCSVImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobHistory, setJobHistory] = useState<Array<{ id: string; date: string; name: string }>>([]);

  // Load history from browser storage upon hydration
  useEffect(() => {
    const cachedHistory = localStorage.getItem('csv_import_history');
    if (cachedHistory) {
      setJobHistory(JSON.parse(cachedHistory));
    }
  }, []);

  // 📡 REACT QUERY MUTATION
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      try {
        const formData = new FormData();
        formData.append('file', file); // Matches his exact required "file" key identifier

        const response = await apiClient.request({
          url: '/api/v1/contacts/import',
          method: 'POST', // Matches his Go endpoint router mapping rule exactly
          data: formData,
          headers: {
            // Setting this to undefined deletes the global JSON header rules
            // and lets the browser calculate the multi-part layout boundary automatically!
            'Content-Type': undefined 
          }
        });
        
        return response.data;
      } catch (err: any) {
        // 🚀 THE CRITICAL INTERCEPTOR FIX: Capture the raw response body before it escapes!
        if (err.response && err.response.data) {
          throw err.response.data; // Throws the raw body (e.g., { error: "Email format..." }) downstream
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      // 📝 Save this job token details into local history track logs
      const newHistoryItem = {
        id: data.import_id || data.data?.import_id || 'JOB-' + Math.floor(Math.random() * 10000),
        date: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        name: selectedFile?.name || 'Bulk_Dataset.csv'
      };
      const updatedHistory = [newHistoryItem, ...jobHistory];
      setJobHistory(updatedHistory);
      localStorage.setItem('csv_import_history', JSON.stringify(updatedHistory));

      // Redirect cleanly to the tracking instance screen
      router.push(`/contacts/import/${newHistoryItem.id}`);
    },
    onError: (thrownError: any) => {
      // 🛠️ The thrownError variable now contains the exact data body we intercepted above
      console.log("--- CSV IMPORT FAILURE DATA ---", thrownError);

      let serverFeedback = '';

      if (thrownError) {
        // If the Go backend returns { error: "Email format..." } directly
        if (typeof thrownError.error === 'string') {
          serverFeedback = thrownError.error;
        } 
        // If it's wrapped under a 'message' or 'errors' property
        else if (typeof thrownError.message === 'string') {
          serverFeedback = thrownError.message;
        } 
        else if (thrownError.errors && typeof thrownError.errors === 'object') {
          const mappedMessages = Object.values(thrownError.errors);
          if (mappedMessages.length > 0) serverFeedback = String(mappedMessages[0]);
        }
        // If the backend returns a single simple string value layout directly
        else if (typeof thrownError === 'string') {
          serverFeedback = thrownError;
        }
      }

      // If we extracted a message from the Go server, display it! Otherwise use the fallback text.
      setErrorLog(
        serverFeedback 
          ? `Ingestion Error: ${serverFeedback}` 
          : `Ingestion Error: Please ensure the file is a valid CSV and matches the required layout matrix.`
      );
    }
  });

  const handleFileChange = (file: File) => {
    setErrorLog(null);
    setSelectedFile(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorLog('Validation Error: Only authentic CSV (.csv) extensions are supported.');
      return;
    }
    if (file.size === 0) {
      setErrorLog('Validation Error: The selected file contains zero data bytes.');
      return;
    }
    setSelectedFile(file);
  };

  const handleTriggerServerUpload = () => {
    if (!selectedFile) return;
    importMutation.mutate(selectedFile);
  };

  const handleClearHistory = () => {
    if (window.confirm("Purge past ingestion history tracker logs?")) {
      localStorage.removeItem('csv_import_history');
      setJobHistory([]);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 animate-fade-in relative z-10">
      
      {/* Module Navbar Header */}
      <div className="flex justify-between items-center border-b border-slate-200/60 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Bulk Ingestion System</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Asynchronous Data Stream Engine</p>
        </div>
        <button onClick={() => router.push('/contacts')} className="text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
          ◀ Directory Dashboard
        </button>
      </div>

      {errorLog && (
        <div className="bg-red-50 border border-red-200 text-red-600 font-bold text-xs p-3.5 rounded-xl flex items-center gap-2 shadow-2xs">
          <span>❌</span> {errorLog}
        </div>
      )}

      {/* DROPZONE DRAG AND DROP CONTAINER */}
      <div 
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) handleFileChange(file); }}
        className={`border-2 border-dashed rounded-2xl p-14 text-center transition-all flex flex-col items-center justify-center select-none bg-white min-h-[220px] ${
          isDragging ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-300 hover:border-slate-400'
        } ${selectedFile ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} accept=".csv" className="hidden" />
        
        <div className="text-4xl mb-3">{selectedFile ? '📄' : '📊'}</div>
        
        {selectedFile ? (
          <div className="space-y-4 w-full max-w-sm mx-auto">
            <div>
              <h4 className="text-sm font-black text-slate-800 break-all">{selectedFile.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">
                Size Capacity: {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            
            <div className="flex gap-2 justify-center pt-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                className="px-4 py-2 border border-slate-200 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Clear
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleTriggerServerUpload(); }}
                disabled={importMutation.isPending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {importMutation.isPending ? 'Uploading Stream...' : '⚡ Fire Background Import Job'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h4 className="text-sm font-black text-slate-800">Upload Corporate CSV Grid Asset Sheet</h4>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">
              Files are passed straight to background thread workers for ingestion parsing
            </p>
          </>
        )}
      </div>

      {/* 📜 HISTORICAL BACKGROUND TRACKING HISTORY TRACE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Past Ingestion History Logs</h3>
          {jobHistory.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="text-[10px] text-red-500 hover:text-red-600 font-black uppercase tracking-wider cursor-pointer"
            >
              Clear Logs
            </button>
          )}
        </div>

        {jobHistory.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs max-h-48 overflow-y-auto">
            {jobHistory.map((job) => (
              <div 
                key={job.id} 
                onClick={() => router.push(`/contacts/import/${job.id}`)}
                className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-all cursor-pointer group"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors break-all pr-4">{job.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono font-bold">Token: #{job.id}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{job.date}</p>
                  <p className="text-[9px] text-blue-500 font-extrabold uppercase mt-0.5 tracking-wider">Inspect View ↗</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-slate-400 font-bold uppercase tracking-wider text-[11px] select-none bg-slate-50/30 border border-dashed border-slate-100 rounded-xl">
            No previous asynchronous background batches tracked inside this runtime shell.
          </p>
        )}
      </div>

    </div>
  );
}