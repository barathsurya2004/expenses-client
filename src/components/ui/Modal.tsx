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
        { y: 100, opacity: 0, scale: 0.95 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' },
        '-=0.2'
      );
    } else if (mounted) {
      const tl = gsap.timeline({
        onComplete: () => setMounted(false)
      });
      tl.to(panelRef.current, { 
        y: 50, 
        opacity: 0, 
        scale: 0.95, 
        duration: 0.3, 
        ease: 'power2.in' 
      });
      tl.to(backdropRef.current, { 
        opacity: 0, 
        duration: 0.2, 
        ease: 'power2.in' 
      }, '-=0.2');
    }
  }, { dependencies: [isOpen], scope: containerRef });

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div 
        ref={panelRef}
        className="relative w-full max-w-lg bg-surface-container-high rounded-t-[2rem] sm:rounded-2xl border border-outline-variant/20 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <h2 className="text-lg font-bold text-on-surface">{title}</h2>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-surface-bright transition-colors active:scale-90"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">close</span>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};
