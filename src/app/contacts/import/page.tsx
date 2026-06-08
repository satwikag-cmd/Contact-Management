'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useContacts } from '../../../context/ContactContext';
import type { Contact } from '../../../types/contact';

interface PreImportRecord {
  firstName: string;
  lastName: string;
  email: string | null;
  mobileNumber: string | null;
  gender: string;
  location: string;
  isValid: boolean;
  errorReason?: string;
}

export default function BulkCSVImportPage() {
  const router = useRouter();
  const { contacts, addContact } = useContacts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Staging array to hold records for previewing before final confirmation
  const [previewRecords, setPreviewRecords] = useState<PreImportRecord[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // --- 1. FILE SELECTION HANDLER ---
  const handleFileChange = (file: File) => {
    setErrorLog(null);
    setPreviewRecords([]);
    setSelectedFile(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorLog('Validation Error: Only authentic CSV (.csv) extensions are supported.');
      return;
    }
    if (file.size === 0) {
      setErrorLog('Validation Error: The selected file is empty.');
      return;
    }

    setSelectedFile(file);
    parseAndValidateCSV(file);
  };

  // --- 2. STRICT SCHEMA PARSER & VALIDATION MACHINE ---
  // --- 2. SMART SCHEMA PARSER & VALIDATION MACHINE ---
  const parseAndValidateCSV = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return setErrorLog('System Error: Unable to read file data.');

      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines[0]?.startsWith('sep=')) lines.shift(); // Strip Excel separation markers

      if (lines.length <= 1) {
        setErrorLog('Validation Error: Spreadsheet contains header cells but zero data rows.');
        return;
      }

      // Read headers and normalize them by stripping spaces, underscores, hyphens, and converting to lowercase
      // Example: "First Name", "FirstName", "first_name" -> all become "firstname"
      const headers = lines[0].split(',').map(h => 
        h.trim().toLowerCase().replace(/[\s\-_]/g, '')
      );

      // --- FLEXIBLE SCHEMA GUARD MATCHING ---
      const firstNameIdx = headers.findIndex(h => h === 'firstname' || h === 'name');
      const lastNameIdx = headers.findIndex(h => h === 'lastname');
      const emailIdx = headers.findIndex(h => h === 'emailaddress' || h === 'email' || h === 'mail');
      const mobileIdx = headers.findIndex(h => h === 'mobilenumber' || h === 'phone' || h === 'phonenumber' || h === 'mobile');
      const genderIdx = headers.findIndex(h => h === 'gender');
      const locationIdx = headers.findIndex(h => h === 'location' || h === 'city');

      // Check for structural absolute requirements (First Name and Gender)
      if (firstNameIdx === -1) {
        setErrorLog('Schema Rejection Error: Could not locate a column for "First Name" or "Name". Action Aborted.');
        setSelectedFile(null);
        return;
      }

      if (genderIdx === -1) {
        setErrorLog('Schema Rejection Error: Missing mandatory column "Gender" inside CSV headers. Action Aborted.');
        setSelectedFile(null);
        return;
      }

    const parsedRows: PreImportRecord[] = lines.slice(1).map((row) => {
      const columns = row.split(',').map(c => c.trim());
      
      const firstName = columns[firstNameIdx] || '';
      const lastName = lastNameIdx !== -1 ? columns[lastNameIdx] : '';
      const email = emailIdx !== -1 ? columns[emailIdx] : '';
      const mobileNumber = mobileIdx !== -1 ? columns[mobileIdx] : '';
      const gender = genderIdx !== -1 ? columns[genderIdx] : '';
      const location = locationIdx !== -1 ? columns[locationIdx] : '';

      let isValid = true;
      let errorReason = '';

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanPhone = mobileNumber.replace(/[\s\-()+]/g, '');
      
      const isEmailValid = email ? emailRegex.test(email) : false;
      const isPhoneValid = cleanPhone ? cleanPhone.length >= 10 : false;

      const normalizedGender = gender.trim().toLowerCase();
      let finalGender = '';
      if (normalizedGender === 'male') finalGender = 'Male';
      else if (normalizedGender === 'female') finalGender = 'Female';
      else if (normalizedGender === 'other') finalGender = 'Other';

      if (!firstName) {
        isValid = false;
        errorReason = 'Missing mandatory parameter: First Name';
      } 
      // CRITICAL SECURITY FIX: Fail rows that don't have AT LEAST one well-formatted contact path
      else if (!email && !mobileNumber) {
        isValid = false;
        errorReason = 'Data Error: Profile must contain at least one valid Email or Mobile Vector.';
      } 
      else if (email && !isEmailValid) {
        isValid = false;
        errorReason = 'Format Error: Invalid structure path provided for Email address.';
      } 
      else if (mobileNumber && !isPhoneValid) {
        isValid = false;
        errorReason = 'Format Error: Mobile number string length is too short (Must be >= 10 digits).';
      } 
      else if (!gender) {
        isValid = false;
        errorReason = 'Data Error: Empty gender row parameters are not allowed.';
      } 
      else if (!finalGender) {
        isValid = false;
        errorReason = `Data Error: Invalid gender token value ("${gender}"). Must be Male, Female, or Other.`;
      }

      return {
        firstName,
        lastName,
        email: isEmailValid ? email : null,
        mobileNumber: isPhoneValid ? mobileNumber : null,
        gender: finalGender || gender,
        location,
        isValid,
        errorReason
      };
    });

      setPreviewRecords(parsedRows);
    };

    reader.readAsText(file);
  };

  // --- 3. FINAL DIRECTORY COMMIT CONFIRMATION TRIGGER ---
 // --- 3. FINAL DIRECTORY COMMIT CONFIRMATION TRIGGER ---
  const handleFinalizeImport = () => {
    // FIX 1: Filter to loop strictly over VALID rows only
    const validRecords = previewRecords.filter(r => r.isValid);
    
    if (validRecords.length === 0) {
      alert("Aborted: Zero valid records are present inside this staging patch bundle.");
      return;
    }

    setIsImporting(true);

    let newlyAddedCount = 0;
    let duplicateSkippedCount = 0;

    validRecords.forEach((record) => {
      const isDuplicate = contacts.some(existingContact => {
        const emailMatch = record.email && 
          existingContact.email?.toLowerCase().trim() === record.email.toLowerCase().trim();
          
        const phoneMatch = record.mobileNumber && 
          existingContact.mobileNumber?.replace(/[\s\-()]/g, '') === record.mobileNumber.replace(/[\s\-()]/g, '');

        return emailMatch || phoneMatch;
      });

      if (!isDuplicate) {
        addContact({
          firstName: record.firstName,
          lastName: record.lastName,
          email: record.email,
          mobileNumber: record.mobileNumber,
          gender: record.gender as any,
          location: record.location || undefined
        });
        newlyAddedCount++;
      } else {
        duplicateSkippedCount++;
      }
    });

    setTimeout(() => {
      setIsImporting(false);
      
      if (duplicateSkippedCount > 0) {
        alert(`Ingestion Settled:\n✓ Sync complete: ${newlyAddedCount} new profile nodes registered.\n⚠️ Skipped: ${duplicateSkippedCount} duplicate matching records detected to prevent looping entries.`);
      } else {
        alert(`Success: Mapped ${newlyAddedCount} fresh directory nodes up-circuit cleanly!`);
      }
      
      router.push('/contacts');
    }, 600);
  };

  const validCount = previewRecords.filter(r => r.isValid).length;
  const brokenCount = previewRecords.filter(r => !r.isValid).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 animate-fade-in relative z-10">
      
      {/* Module Navbar Header */}
      <div className="flex justify-between items-center border-b border-slate-200/60 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Bulk Ingestion System</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Staged Review Data Pipeline</p>
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

      {/* STEP pass A: DROPZONE ENGINE VIEW CONTAINER */}
      {previewRecords.length === 0 && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) handleFileChange(file); }}
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all flex flex-col items-center justify-center select-none bg-white min-h-[260px] ${
            isDragging ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} accept=".csv" className="hidden" />
          <div className="text-4xl mb-3">📊</div>
          <h4 className="text-sm font-black text-slate-800">Upload Corporate CSV Grid Asset Sheet</h4>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">Strict schema checks enabled: Missing column entries will instantly abort</p>
        </div>
      )}

      {/* STEP pass B: THE PREVIEW REVIEW MATRIX WINDOW GRID */}
      {previewRecords.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Staging Metrics Information Row Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-6 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Total Rows Detected</span>
                <span className="text-base font-black text-slate-900 font-mono">{previewRecords.length}</span>
              </div>
              <div>
                <span className="text-emerald-500 font-bold uppercase text-[9px] block">Valid & Ready</span>
                <span className="text-base font-black text-emerald-600 font-mono">{validCount}</span>
              </div>
              <div>
                <span className="text-red-500 font-bold uppercase text-[9px] block">Flagged Violations</span>
                <span className="text-base font-black text-red-500 font-mono">{brokenCount}</span>
              </div>
            </div>

            {/* ACTION TRIGGERS: CONFIRMATION LAYER INTERACTION HANDLES */}
            <div className="flex gap-3">
              <button 
                onClick={() => setPreviewRecords([])} 
                className="px-4 py-2 border border-slate-200 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Reset Upload
              </button>
              <button 
                onClick={handleFinalizeImport}
                disabled={validCount === 0 || isImporting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isImporting ? 'Syncing...' : `✓ Import ${validCount} Items to Main Directory`}
              </button>
            </div>
          </div>

          {/* Render Data Preview Table Workspace */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left border-collapse relative">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Row Evaluation</th>
                    <th className="px-6 py-3">First Name</th>
                    <th className="px-6 py-3">Last Name</th>
                    <th className="px-6 py-3">Email Address</th>
                    <th className="px-6 py-3">Mobile Vector</th>
                    <th className="px-6 py-3">Gender</th>
                    <th className="px-6 py-3">Location City</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                  {previewRecords.map((rec, i) => (
                    <tr key={i} className={`transition-colors ${rec.isValid ? 'hover:bg-slate-50/40' : 'bg-red-50/30'}`}>
                      <td className="px-6 py-3.5">
                        {rec.isValid ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wide border border-emerald-100">Clean</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[9px] font-black uppercase tracking-wide border border-red-200" title={rec.errorReason}>
                            Error: {rec.errorReason}
                          </span>
                        )}
                      </td>
                      <td className={`px-6 py-3.5 ${!rec.firstName ? 'text-slate-300 italic text-[11px]' : 'text-slate-900 font-bold'}`}>{rec.firstName || 'empty'}</td>
                      <td className="px-6 py-3.5 text-slate-500">{rec.lastName || '—'}</td>
                      <td className="px-6 py-3.5 text-slate-400 font-medium">{rec.email || '—'}</td>
                      <td className="px-6 py-3.5 text-slate-500">{rec.mobileNumber || '—'}</td>
                      <td className={`px-6 py-3.5 ${!rec.gender ? 'text-red-500/80 font-black italic' : 'text-slate-700 font-bold'}`}>{rec.gender || 'missing'}</td>
                      <td className="px-6 py-3.5 text-slate-400">{rec.location || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}