import React, { useCallback, useEffect } from 'react';
import gsap from 'gsap';
import { TransactionItem } from './Cards';
import type { Transaction } from '../../types';

const SWIPE_ACTION_WIDTH = 88;
const SWIPE_HARD_THRESHOLD = 150;
const SWIPE_MAX_OFFSET = 180;

export const SwipeTransactionRow: React.FC<{
  transaction: Transaction;
  disabled?: boolean;
  onQuickEditCategory: (transactionId: string) => void;
  onDeleteTransaction: (transactionId: string) => Promise<void>;
}> = ({ transaction, disabled = false, onQuickEditCategory, onDeleteTransaction }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const rowRef = React.useRef<HTMLDivElement>(null);
  const editActionRef = React.useRef<HTMLButtonElement>(null);
  const deleteActionRef = React.useRef<HTMLButtonElement>(null);
  const startXRef = React.useRef(0);
  const startOffsetRef = React.useRef(0);
  const xRef = React.useRef(0);
  const isDraggingRef = React.useRef(false);
  const isRemovingRef = React.useRef(false);
  const didMoveRef = React.useRef(false);
  const actionCommittedRef = React.useRef(false);

  const syncActionVisuals = useCallback((offset: number, immediate = false) => {
    const rightProgress = Math.min(Math.max(offset / SWIPE_ACTION_WIDTH, 0), 1);
    const leftProgress = Math.min(Math.max(-offset / SWIPE_ACTION_WIDTH, 0), 1);
    const duration = immediate ? 0 : 0.14;

    if (editActionRef.current) {
      gsap.to(editActionRef.current, {
        opacity: rightProgress,
        scale: 0.94 + rightProgress * 0.06,
        duration,
        ease: 'power2.out',
        overwrite: true,
      });
      editActionRef.current.style.pointerEvents = rightProgress > 0.05 ? 'auto' : 'none';
    }

    if (deleteActionRef.current) {
      gsap.to(deleteActionRef.current, {
        opacity: leftProgress,
        scale: 0.94 + leftProgress * 0.06,
        duration,
        ease: 'power2.out',
        overwrite: true,
      });
      deleteActionRef.current.style.pointerEvents = leftProgress > 0.05 ? 'auto' : 'none';
    }
  }, []);

  const moveRow = useCallback((nextOffset: number, options?: { immediate?: boolean; ease?: string; duration?: number; onComplete?: () => void }) => {
    const immediate = options?.immediate ?? false;
    const ease = options?.ease ?? 'power3.out';
    const duration = options?.duration ?? 0.24;

    xRef.current = nextOffset;
    syncActionVisuals(nextOffset, immediate);

    if (!rowRef.current) {
      options?.onComplete?.();
      return;
    }

    if (immediate) {
      gsap.set(rowRef.current, { x: nextOffset });
      options?.onComplete?.();
      return;
    }

    gsap.to(rowRef.current, {
      x: nextOffset,
      duration,
      ease,
      overwrite: true,
      onComplete: options?.onComplete,
    });
  }, [syncActionVisuals]);

  const resetRow = useCallback(() => {
    actionCommittedRef.current = false;
    isDraggingRef.current = false;
    isRemovingRef.current = false;
    moveRow(0, { duration: 0.22, ease: 'power3.out' });
    if (containerRef.current) {
      gsap.to(containerRef.current, { opacity: 1, duration: 0.18, overwrite: true });
    }
  }, [moveRow]);

  const triggerQuickEdit = useCallback(() => {
    if (actionCommittedRef.current) return;
    actionCommittedRef.current = true;
    moveRow(SWIPE_MAX_OFFSET + 26, {
      duration: 0.2,
      ease: 'power2.inOut',
      onComplete: () => {
        onQuickEditCategory(transaction.id);
        window.setTimeout(() => resetRow(), 120);
      },
    });
  }, [moveRow, onQuickEditCategory, resetRow, transaction.id]);

  const triggerDelete = useCallback(() => {
    if (actionCommittedRef.current) return;
    actionCommittedRef.current = true;
    isRemovingRef.current = true;
    if (containerRef.current) gsap.to(containerRef.current, { opacity: 0.82, duration: 0.12, overwrite: true });

    const containerWidth = containerRef.current?.getBoundingClientRect().width ?? 360;
    const offscreenX = -(containerWidth + 80);

    moveRow(offscreenX, {
      duration: 0.24,
      ease: 'power2.in',
      onComplete: async () => {
        if (!containerRef.current) {
          await onDeleteTransaction(transaction.id);
          return;
        }
        const rowHeight = containerRef.current.getBoundingClientRect().height;
        gsap.set(containerRef.current, { height: rowHeight, overflow: 'hidden', transformOrigin: 'top center' });
        gsap.to(containerRef.current, {
          height: 0,
          opacity: 0,
          marginTop: 0,
          marginBottom: 0,
          duration: 0.38,
          ease: 'back.inOut(1.35)',
          overwrite: true,
          onComplete: async () => {
            try { await onDeleteTransaction(transaction.id); } catch { resetRow(); }
          },
        });
      },
    });
  }, [moveRow, onDeleteTransaction, resetRow, transaction.id]);

  useEffect(() => { moveRow(0, { immediate: true }); }, [moveRow]);
  useEffect(() => { if (disabled && !actionCommittedRef.current && !isRemovingRef.current) resetRow(); }, [disabled, resetRow]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || actionCommittedRef.current || isRemovingRef.current) return;
    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
    startXRef.current = event.clientX;
    startOffsetRef.current = xRef.current;
    didMoveRef.current = false;
    isDraggingRef.current = true;
  }, [disabled]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || disabled || actionCommittedRef.current || isRemovingRef.current) return;
    const deltaX = event.clientX - startXRef.current;
    if (Math.abs(deltaX) > 6) didMoveRef.current = true;
    const nextOffset = Math.min(Math.max(startOffsetRef.current + deltaX, -SWIPE_MAX_OFFSET), SWIPE_MAX_OFFSET);
    moveRow(nextOffset, { immediate: true });
  }, [disabled, moveRow]);

  const completeSwipe = useCallback(() => {
    isDraggingRef.current = false;
    if (disabled || actionCommittedRef.current || isRemovingRef.current) return;
    const currentOffset = xRef.current;
    if (currentOffset <= -SWIPE_HARD_THRESHOLD) { triggerDelete(); return; }
    if (currentOffset >= SWIPE_HARD_THRESHOLD) { triggerQuickEdit(); return; }
    if (currentOffset <= -28) { moveRow(-SWIPE_ACTION_WIDTH, { duration: 0.26, ease: 'back.out(1.2)' }); return; }
    if (currentOffset >= 28) { moveRow(SWIPE_ACTION_WIDTH, { duration: 0.26, ease: 'back.out(1.2)' }); return; }
    moveRow(0, { duration: 0.2, ease: 'power3.out' });
  }, [disabled, moveRow, triggerDelete, triggerQuickEdit]);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.currentTarget as HTMLDivElement).hasPointerCapture(event.pointerId)) {
      (event.currentTarget as HTMLDivElement).releasePointerCapture(event.pointerId);
    }
    completeSwipe();
  }, [completeSwipe]);

  const handleRowClick = useCallback(() => {
    if (disabled || actionCommittedRef.current || isRemovingRef.current) return;
    if (didMoveRef.current) { didMoveRef.current = false; return; }
    if (Math.abs(xRef.current) > 1) moveRow(0, { duration: 0.2, ease: 'power3.out' });
  }, [disabled, moveRow]);

  return (
    <div ref={containerRef} className="relative overflow-hidden touch-pan-y select-none">
      <div className="absolute inset-0 flex">
        <button ref={editActionRef} type="button" onClick={triggerQuickEdit} className="w-24 flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-ledger-accent text-ledger-bg opacity-0">
          <span className="material-symbols-outlined text-[16px]">edit</span>
          Edit
        </button>
        <div className="flex-1 bg-ledger-s2" />
        <button ref={deleteActionRef} type="button" onClick={triggerDelete} className="w-24 flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-ledger-expense text-ledger-text opacity-0">
          <span className="material-symbols-outlined text-[16px]">delete</span>
          Delete
        </button>
      </div>
      <div ref={rowRef} className="relative z-10 bg-ledger-bg px-2" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={completeSwipe} onClick={handleRowClick}>
        <TransactionItem transaction={transaction} />
      </div>
    </div>
  );
};
