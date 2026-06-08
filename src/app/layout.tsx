// src/app/layout.tsx
import React from 'react';
import Link from 'next/link';
import Providers from '../components/Providers'; 
import { CustomCursor } from '../components/CustomCursor';
import './globals.css';

export const metadata = {
  title: 'ContactHub',
  description: 'Kasplo Contact Management Module',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex flex-col justify-between relative antialiased text-slate-800">
        
        {/* Background Decorative Blur Effects */}
        <div className="absolute inset-0 w-full h-full min-h-screen overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-15%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-emerald-300/10 blur-[130px]" />
          <div className="absolute bottom-[-15%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-blue-300/10 blur-[110px]" />
        </div>

        {/* Global Corporate Header Navigation */}
        <header className="bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-xs relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">ContactHub</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Enterprise Directory Portal</p>
            </div>
            
            <nav className="flex items-center gap-6 text-xs font-black uppercase tracking-wider text-slate-500">
              <Link href="/contacts" className="hover:text-emerald-600 transition-colors">Directory</Link>
              <Link href="/contacts/import" className="hover:text-emerald-600 transition-colors">Bulk Import</Link>
              <Link href="/settings/tags" className="hover:text-emerald-600 transition-colors">Tag Rules</Link>
            </nav>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Node Operational</span>
            </div>
          </div>
        </header>

        {/* Dynamic Workspace Container Wrapped In Client State Boundaries */}
        <Providers>
          <CustomCursor />
          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-grow relative z-10">
            {children}
          </main>
        </Providers>

        <footer className="bg-white/50 border-t border-slate-200/60 py-3 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider z-10 relative">
          &copy; {new Date().getFullYear()} Contact Management Dashboard. All node parameters finalized.
        </footer>
      </body>
    </html>
  );
}