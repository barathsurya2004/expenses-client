import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [mounted, setMounted] = useState(isOpen);
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  if (isOpen && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useGSAP(() => {
    if (isOpen) {
      const tl = gsap.timeline();
      tl.fromTo(backdropRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      tl.fromTo(panelRef.current, 
        { y: 40, opacity: 0, scale: 0.98 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' },
        '-=0.15'
      );
    } else if (mounted) {
      const tl = gsap.timeline({
        onComplete: () => setMounted(false)
      });
      tl.to(panelRef.current, { 
        y: 20, 
        opacity: 0, 
        scale: 0.98, 
        duration: 0.3, 
        ease: 'power2.in' 
      });
      tl.to(backdropRef.current, { 
        opacity: 0, 
        duration: 0.2, 
        ease: 'power2.in' 
      }, '-=0.15');
    }
  }, { dependencies: [isOpen], scope: containerRef });

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-ledger-bg/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div 
        ref={panelRef}
        className="relative w-full max-w-lg bg-ledger-s1 rounded-t-3xl sm:rounded-2xl border border-ledger-border shadow-[0_32px_80px_-20px_rgba(0,0,0,0.8)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ledger-border">
          <h2 className="text-base font-bold text-ledger-text uppercase tracking-widest">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-ledger-s2 border border-ledger-border flex items-center justify-center hover:bg-ledger-s3 transition-colors active:scale-90"
          >
            <span className="material-symbols-outlined text-ledger-muted text-[18px]">close</span>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-ledger-faint scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
};
