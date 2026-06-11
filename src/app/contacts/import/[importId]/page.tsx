'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../api/apiClient';

export default function ImportJobStatusRoute() {
  // 🎯 Safely extracting importId to match your exact folder name rulebook
  const params = useParams();
  const importId = params?.importId;
  const router = useRouter();

  // 📡 LIVE POLLING STATUS ENGINE (Fires every 2 seconds matching his description)
  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['import-job-status', importId],
    queryFn: async () => {
      // Hits his exact endpoint matching your route token parameter structural shape
      const response = await apiClient.get(`/api/v1/contacts/import/${importId}`);
      return response.data; 
    },
    enabled: !!importId,
    refetchInterval: (query) => {
      const currentStatus = query.state.data?.status;
      // Stops the loop when status matches "completed" or "failed"
      return currentStatus === 'completed' || currentStatus === 'failed' ? false : 2000;
    }
  });

  if (isLoading) {
    return (
      <div className="h-[40vh] flex flex-col items-center justify-center gap-2 max-w-xl mx-auto">
        <div className="h-5 w-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Connecting to Thread Status...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-white border border-slate-200 rounded-2xl text-center text-red-600 font-bold text-xs uppercase tracking-wider">
        ⚠️ Failed to fetch job status metrics from his endpoint. Check connection.
      </div>
    );
  }

  // --- MAP EXACT BACKEND JSON SCHEMAS KEYS ---
  const total = job.total_records || 0;
  const processed = job.processed_records || 0;
  const successful = job.successful_records || 0;
  const failed = job.failed_records || 0;
  
  // Use his backend calculated completion percentage string safely
  const progressPercentage = job.completion_percentage || "0.00";

  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';

  return (
    <div className="max-w-xl mx-auto my-12 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6 animate-fade-in relative z-10">
      
      {/* Header Info Block */}
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-900 break-all">Import Job Token: #{importId}</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Asynchronous Data Engine Analytics</p>
      </div>

      {/* Dynamic Status Alert Message Card */}
      {isCompleted ? (
        <div className="p-4 bg-emerald-50 text-emerald-800 font-medium text-xs rounded-xl border border-emerald-200 space-y-1">
          <p className="font-black uppercase text-[10px] tracking-wider text-emerald-700">✓ Ingestion Settled (Status: Completed)</p>
          <p>Package processing complete! All clean rows are successfully integrated inside your directory database map grid.</p>
        </div>
      ) : isFailed ? (
        <div className="p-4 bg-red-50 text-red-800 font-medium text-xs rounded-xl border border-red-200 space-y-1">
          <p className="font-black uppercase text-[10px] tracking-wider text-red-700">❌ Thread Crash (Status: Failed)</p>
          <p>The worker thread rejected this dataset file. Verify structure column fields formatting rulebook guidelines.</p>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 text-amber-800 font-medium text-xs rounded-xl border border-amber-200 space-y-1">
          <p className="font-black uppercase text-[10px] tracking-wider text-amber-700 animate-pulse">⚡ Job Status: {job.status || 'Processing'}</p>
          <p>His laptop backend core threads are actively streaming and saving your spreadsheet right now.</p>
        </div>
      )}

      {/* 📊 LIVE DYNAMIC PROGRESS BAR ANIMATOR */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Ingestion Velocity Status</span>
          <span className="font-mono text-slate-900 font-black">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/40">
          <div 
            className={`h-full transition-all duration-500 ease-out ${
              isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-blue-500 animate-pulse'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 📈 REAL-TIME STATS LOG COUNTERS GRID */}
      <div className="grid grid-cols-2 gap-4 border border-slate-100 p-4 rounded-xl bg-slate-50/50">
        <div className="space-y-0.5">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Records Rows</span>
          <p className="text-base font-black text-slate-900 font-mono">{total.toLocaleString()}</p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Processed Records</span>
          <p className="text-base font-black text-blue-600 font-mono">{processed.toLocaleString()}</p>
        </div>
        <div className="space-y-0.5 border-t border-slate-100 pt-2.5">
          <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">Successful Import</span>
          <p className="text-base font-black text-emerald-600 font-mono">{successful.toLocaleString()}</p>
        </div>
        <div className="space-y-0.5 border-t border-slate-100 pt-2.5">
          <span className="text-[9px] font-black uppercase text-red-500 tracking-wider">Failed Violations</span>
          <p className="text-base font-black text-red-500 font-mono">{failed.toLocaleString()}</p>
        </div>
      </div>

      {/* Foot Actions Panel */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button 
          onClick={() => router.push('/contacts/import')} 
          className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-extrabold text-xs rounded-xl transition-all cursor-pointer text-center"
        >
          ← Ingestion Hub
        </button>
        <button 
          onClick={() => router.push('/contacts')} 
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs text-center"
        >
          Directory Dashboard
        </button>
      </div>

    </div>
  );
}