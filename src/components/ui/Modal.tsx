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
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync mounted state with isOpen
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useGSAP(() => {
    if (isOpen && mounted) {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 0.5 } });
      
      tl.fromTo(backdropRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.4 }
      );
      
      tl.fromTo(panelRef.current, 
        { y: 20, opacity: 0, scale: 0.98 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.5, clearProps: 'transform' },
        '-=0.3'
      );
    } else if (!isOpen && mounted) {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut', duration: 0.3 },
        onComplete: () => setMounted(false)
      });

      tl.to(panelRef.current, { 
        y: 20, 
        opacity: 0, 
        scale: 0.98,
      });

      tl.to(backdropRef.current, { 
        opacity: 0, 
        duration: 0.2 
      }, '-=0.1');
    }
  }, { dependencies: [isOpen, mounted], scope: containerRef });

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-[#050403]/75 backdrop-blur-[6px]"
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div 
        ref={panelRef}
        className="relative w-full max-w-[440px] max-h-[92vh] flex flex-col bg-ledger-s1 rounded-[20px] border border-ledger-border shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden will-change-transform"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-ledger-s1 border-b border-ledger-border">
          <h2 className="text-[18px] font-bold text-ledger-text font-headline tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-ledger-s3 border-none text-ledger-muted flex items-center justify-center hover:text-ledger-text transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 pt-5 pb-7 overflow-y-auto scrollbar-thin scrollbar-thumb-ledger-faint scrollbar-track-transparent">
          <div className="flex flex-col gap-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
