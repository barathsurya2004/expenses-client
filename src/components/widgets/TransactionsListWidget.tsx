import React, { useState, useEffect, useCallback } from 'react';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../../services/apiService';
import type { Transaction } from '../../types';
import { Animate } from '../ui/Animate';
import { useModal } from '../../hooks/useModal';
import { SwipeTransactionRow } from '../ui/SwipeTransactionRow';
import { Skeleton } from '../ui/Skeleton';

type TransactionGroup = {
  date: string;
  label: string;
  items: Transaction[];
};

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getDateLabel = (dateString: string): string => {
  const date = startOfDay(new Date(dateString));
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.getTime() === today.getTime()) {
    return 'Today';
  }

  if (date.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const groupTransactionsByDate = (transactions: Transaction[]): TransactionGroup[] => {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const map = new Map<string, Transaction[]>();
  for (const transaction of sorted) {
    const dateKey = transaction.date.slice(0, 10);
    const existing = map.get(dateKey);
    if (existing) {
      existing.push(transaction);
    } else {
      map.set(dateKey, [transaction]);
    }
  }

  return Array.from(map.entries()).map(([date, items]) => ({
    date,
    label: getDateLabel(date),
    items,
  }));
};

export const TransactionsListWidget: React.FC = () => {
  const { openModal } = useModal();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const fetchData = useCallback(async () => {
    try {
      const data = await apiService.getRecentTransactions();
      setTransactions(data);
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
      <div className="space-y-10">
        <header>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </header>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const allTransactions = transactions;
  const totalIncome = allTransactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = allTransactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

  const filteredTransactions = allTransactions.filter((t) => filter === 'all' || t.type === filter);
  const filteredGroups = groupTransactionsByDate(filteredTransactions);

  return (
    <div className="space-y-10">
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
