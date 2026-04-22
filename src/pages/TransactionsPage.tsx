import React, { useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { TransactionItem } from '../components/ui/Cards';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../services/apiService';
import type { GroupedTransactions } from '../services/apiService';
import { Animate } from '../components/ui/Animate';
import { useModal } from '../hooks/useModal';
import type { Transaction } from '../types';

const SWIPE_ACTION_WIDTH = 88;
const SWIPE_HARD_THRESHOLD = 150;
const SWIPE_MAX_OFFSET = 180;

const SwipeTransactionRow: React.FC<{
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

const TransactionsPage: React.FC = () => {
  const { openModal } = useModal();
  const [groupedTransactions, setGroupedTransactions] = useState<GroupedTransactions[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const fetchData = useCallback(async () => {
    try {
      const data = await apiService.getTransactionsGrouped();
      setGroupedTransactions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const handleDataUpdated = () => fetchData();
    window.addEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
    return () => window.removeEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
  }, [fetchData]);

  const handleQuickEditCategory = useCallback((transactionId: string) => {
    sessionStorage.setItem('editTransactionId', transactionId);
    openModal('edit-transaction');
  }, [openModal]);

  const handleDeleteTransaction = useCallback(async (transactionId: string) => {
    if (deletingId === transactionId) return;
    try {
      setDeletingId(transactionId);
      await apiService.deleteTransaction(transactionId);
    } finally { setDeletingId(null); }
  }, [deletingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ledger-bg">
        <div className="w-10 h-10 border-2 border-ledger-accent/20 border-t-ledger-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  const allTransactions = groupedTransactions.flatMap(g => g.items);
  const totalIncome = allTransactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = allTransactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

  const filteredGroups = groupedTransactions.map(group => ({
    ...group,
    items: group.items.filter(t => filter === 'all' || t.type === filter)
  })).filter(group => group.items.length > 0);

  return (
    <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-10 pb-24 md:pb-12">
      <Animate type="fade">
        <header>
          <h1 className="font-headline text-4xl font-bold text-ledger-text tracking-tight">Transactions</h1>
          <p className="text-[13px] text-ledger-muted mt-2 font-body">April 2026 · {allTransactions.length} entries logged</p>
        </header>
      </Animate>

      {/* Summary strip */}
      <Animate type="slideUp" delay={0.2}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'All', val: allTransactions.length, unit: 'entries', id: 'all' },
            { label: 'Income', val: `₹${totalIncome.toLocaleString()}`, id: 'income', color: 'text-ledger-income' },
            { label: 'Expense', val: `₹${totalExpense.toLocaleString()}`, id: 'expense', color: 'text-ledger-expense' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id as any)}
              className={`p-4 rounded-xl border transition-all text-left ${filter === s.id ? 'bg-ledger-s3 border-ledger-accent' : 'bg-ledger-s2 border-ledger-border hover:border-ledger-dim'}`}
            >
              <div className={`text-[10px] uppercase tracking-widest mb-2 font-bold ${filter === s.id ? 'text-ledger-accent' : 'text-ledger-muted'}`}>{s.label}</div>
              <div className={`font-mono text-[16px] font-medium ${s.color || 'text-ledger-text'}`}>{s.val}</div>
            </button>
          ))}
        </div>
      </Animate>

      {/* Grouped List */}
      <div className="space-y-10">
        {filteredGroups.map((group, gIdx) => (
          <Animate key={group.date} type="slideUp" delay={0.3 + (gIdx * 0.1)}>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-ledger-border">
                <h3 className="text-[10px] text-ledger-muted uppercase tracking-[0.15em] font-bold">{group.label}</h3>
                <span className="font-mono text-[10px] text-ledger-dim">{group.items.length} entries</span>
              </div>
              <div className="divide-y divide-ledger-border">
                {group.items.map((t) => (
                  <SwipeTransactionRow
                    key={t.id}
                    transaction={t}
                    disabled={deletingId === t.id}
                    onQuickEditCategory={handleQuickEditCategory}
                    onDeleteTransaction={handleDeleteTransaction}
                  />
                ))}
              </div>
            </div>
          </Animate>
        ))}
      </div>
    </div>
  );
};

export default TransactionsPage;
