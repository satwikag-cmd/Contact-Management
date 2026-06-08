'use client';

import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Set mounted state once we enter the client browser environment
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(false);
    };

    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

    // Watch interactive elements to safely scale up target tracking ring
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mounted]);

  // Prevent server-side rendering execution paths completely
  if (!mounted || isHidden) return null;

  return (
    <>
      {/* Dynamic tracking dot core ring */}
      <div
        className="hidden md:block fixed top-0 left-0 w-2 h-2 bg-emerald-600 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{ 
          transform: `translate3d(${position.x}px, ${position.y}px, 0)` 
        }}
      />
      {/* Outer fluid lag tracking canvas circle wrapper */}
      <div
        className={`hidden md:block fixed top-0 left-0 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 will-change-transform transition-all duration-300 ease-out ${
          isHovered 
            ? 'w-10 h-10 bg-emerald-500/15 border border-emerald-500 scale-110' 
            : 'w-6 h-6 border border-slate-400 bg-transparent'
        }`}
        style={{ 
          transform: `translate3d(${position.x}px, ${position.y}px, 0)` 
        }}
      />
    </>
  );
};