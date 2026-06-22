'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../../../api/apiClient';
import { env } from '../../../../utils/env';

interface WebSocketJobPayload {
  status: string;
  total_records: number;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  completion_percentage: string;
}

export default function ImportJobStatusRoute() {
  const params = useParams();
  const importId = params?.importId;
  const router = useRouter();

  // 🎛️ SYSTEM CORE STATE BUFFERS
  const [job, setJob] = useState<WebSocketJobPayload | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'websocket_live' | 'polling_fallback' | 'closed'>('connecting');
  
  // 🔹 FIXED: Type set to any to clear the NodeJS.Timeout compiler warning
  const pollingIntervalRef = useRef<any>(null);

  // 📡 FALLBACK METHOD: Standard HTTP Polling if WebSocket fails
  const triggerFallbackPolling = async () => {
    if (pollingIntervalRef.current) return; 
    
    console.log("⚠️ WebSocket handshake resting. Activating Fallback Polling...");
    setConnectionStatus('polling_fallback');

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await apiClient.get(`/api/v1/contacts/import/${importId}`);
        const rawData = response.data;
        console.log("📩 Polling response received:", rawData);
        
        const total = Number(rawData.total_records ?? rawData.TotalRecords ?? 0);
        const processed = Number(rawData.processed_records ?? rawData.ProcessedRecords ?? 0);
        const calculatedPercentage = total > 0 ? ((processed / total) * 100).toFixed(2) : "0.00";

        const unifiedPayload: WebSocketJobPayload = {
          status: rawData.status || rawData.Status || 'processing',
          total_records: total,
          processed_records: processed,
          successful_records: Number(rawData.successful_records ?? rawData.SuccessfulRecords ?? 0),
          failed_records: Number(rawData.failed_records ?? rawData.FailedRecords ?? 0),
          completion_percentage: String(rawData.completion_percentage ?? rawData.CompletionPercentage ?? calculatedPercentage)
        };

        setJob(unifiedPayload);

        const statusLower = unifiedPayload.status.toLowerCase();
        if (statusLower === 'completed' || statusLower === 'failed') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.warn("Polling lookup tick deferred safely.");
      }
    }, 1500); 
  };

  // 📡 PRIMARY SYSTEM: WebSocket Connection Pipeline
  useEffect(() => {
    if (!importId) return;

    // 🚀 STRICTMODE MOUNT GUARD TRACKER
    let isComponentMounted = true;
    
    // Declare references to be accessible in both connection and cleanup lifecycle
    let socket: WebSocket | null = null;
    let connectTimeoutId: any = null;

    try {
      const apiUrl = env.NEXT_PUBLIC_API_URL || '';
      const socketHost = apiUrl.replace(/^https?:\/\//, '');
      const wsProtocol = apiUrl.startsWith('https') ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${socketHost}/api/v1/contacts/ws/import/${importId}`;
      
      // Delay connection slightly to avoid double-connection issues during React StrictMode unmount/remount
      connectTimeoutId = setTimeout(() => {
        if (!isComponentMounted) return;

        try {
          socket = new WebSocket(wsUrl);

          socket.onopen = () => {
            if (!isComponentMounted) {
              if (socket) socket.close();
              return;
            }
            console.log('--- WEBSOCKET CONNECTION ESTABLISHED WITH HARSHA\'S COMPUTER ---');
            setConnectionStatus('websocket_live');
          };

          socket.onmessage = (event) => {
            if (!isComponentMounted) return;
            console.log("📩 WebSocket message received:", event.data);
            console.log(
              "WS Update:",
              JSON.parse(event.data).processed_records
            );
            try {
              const rawData = JSON.parse(event.data);
              const total = Number(rawData.total_records ?? rawData.TotalRecords ?? 0);
              const processed = Number(rawData.processed_records ?? rawData.ProcessedRecords ?? 0);
              const calculatedPercentage = total > 0 ? ((processed / total) * 100).toFixed(2) : "0.00";

              const unifiedPayload: WebSocketJobPayload = {
                status: rawData.status || rawData.Status || 'processing',
                total_records: total,
                processed_records: processed,
                successful_records: Number(rawData.successful_records ?? rawData.SuccessfulRecords ?? 0),
                failed_records: Number(rawData.failed_records ?? rawData.FailedRecords ?? 0),
                completion_percentage: String(rawData.completion_percentage ?? rawData.CompletionPercentage ?? calculatedPercentage)
              };

              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
                setConnectionStatus('websocket_live');
              }

              setJob(unifiedPayload);
            } catch (err) {
              console.warn("Muted background parsing text packet:", err);
            }
          };

          socket.onerror = (error) => {
            if (!isComponentMounted) return;
            console.warn("WebSocket handshake missed. Shifting execution to backup channels...");
            triggerFallbackPolling();
          };

          socket.onclose = (event) => {
            if (!isComponentMounted) return;
            console.log(`--- WEBSOCKET CHANNEL CLOSED --- Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
            triggerFallbackPolling();
          };
        } catch (err) {
          triggerFallbackPolling();
        }
      }, 100);

    } catch (err) {
      triggerFallbackPolling();
    }

    // Cleanup lifecycle
    return () => {
      console.log("🧹 Cleanup running, closing connections/timers for importId:", importId);
      isComponentMounted = false;
      if (connectTimeoutId) {
        clearTimeout(connectTimeoutId);
      }
      if (socket) {
        socket.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [importId]);

  // Loading Screen handling
  if (connectionStatus === 'connecting' && !job) {
    return (
      <div className="h-[40vh] flex flex-col items-center justify-center gap-2 max-w-xl mx-auto">
        <div className="h-5 w-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Syncing Multi-Thread Engine Status...</p>
      </div>
    );
  }

  const total = job?.total_records || 0;
  const processed = job?.processed_records || 0;
  const successful = job?.successful_records || 0;
  const failed = job?.failed_records || 0;
  const progressPercentage = job?.completion_percentage || "0.00";

  const isCompleted = job?.status === 'completed' || job?.status === 'Completed';
  const isFailed = job?.status === 'failed' || job?.status === 'Failed';

  return (
    <div className="max-w-xl mx-auto my-12 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6 animate-fade-in relative z-10">
      
      {/* Header Info Block */}
      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 break-all">Import Job Token: #{importId}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Asynchronous Data Engine Analytics</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[9px] font-black uppercase tracking-wider text-slate-500">
          <span className={`h-1.5 w-1.5 rounded-full ${connectionStatus === 'websocket_live' ? 'bg-emerald-500 animate-ping' : 'bg-blue-500 animate-pulse'}`} />
          {connectionStatus === 'websocket_live' ? 'Live WebSocket Stream' : 'Sync Engine Active'}
        </div>
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
          <p className="font-black uppercase text-[10px] tracking-wider text-amber-700 animate-pulse">⚡ Ingest Pipeline: Processing</p>
          <p>Background asynchronous threads are streaming database entries right now. Calculations are reflecting live below.</p>
        </div>
      )}

      {/* 📊 LIVE DYNAMIC PROGRESS BAR ANIMATOR */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Real-Time Ingestion Progress</span>
          <span className="font-mono text-slate-900 font-black">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/40">
          <div 
            className={`h-full transition-all duration-300 ease-out ${
              isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-blue-500'
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