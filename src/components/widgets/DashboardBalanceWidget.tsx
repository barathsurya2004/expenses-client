import React, { useState, useEffect, useCallback } from 'react';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../../services/apiService';
import type { MonthlySummary } from '../../services/apiService';
import { Animate } from '../ui/Animate';
import { Skeleton } from '../ui/Skeleton';

export const DashboardBalanceWidget: React.FC = () => {
  const [data, setData] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const summary = await apiService.getMonthlySummary();
      setData(summary);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const handleDataUpdated = () => fetchData();
    window.addEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
    return () => window.removeEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
  }, [fetchData]);

  if (loading || !data) {
    return (
      <div className="space-y-12">
        <div>
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-16 w-64 mb-4" />
            <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  const netBalance = data.totalIncome - data.totalExpense;
  const savingsPct = data.savingsRate;

  return (
    <div className="space-y-12">
      {/* Header */}
      <Animate type="fade">
        <div>
          <div className="text-[11px] text-ledger-muted uppercase tracking-[0.15em] mb-4 font-body font-bold">Good morning · April 2026</div>
          <div className="font-headline text-5xl md:text-7xl font-bold text-ledger-text tracking-tighter leading-[0.9]">
            ₹{netBalance.toLocaleString()}
          </div>
          <div className="flex items-center gap-4 mt-4 font-body">
            <div className="text-[13px] text-ledger-muted">Net balance this month</div>
            <div className="w-px h-3 bg-ledger-border" />
            <div className="text-[13px] text-ledger-income font-medium">↑ {savingsPct}% savings rate</div>
          </div>
        </div>
      </Animate>

      {/* Income / Expense cards */}
      <Animate type="slideUp" delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-ledger-s2 border border-ledger-border rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-ledger-income/40 to-transparent" />
            <div className="text-[10px] text-ledger-muted uppercase tracking-[0.12em] mb-3 font-bold">Total Income</div>
            <div className="font-mono text-3xl font-medium text-ledger-income tracking-tight">₹{data.totalIncome.toLocaleString()}</div>
            <div className="text-[11px] text-ledger-dim mt-2 font-medium">{data.incomeSources || 2} sources logged</div>
          </div>
          <div className="bg-ledger-s2 border border-ledger-border rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-ledger-expense/40 to-transparent" />
            <div className="text-[10px] text-ledger-muted uppercase tracking-[0.12em] mb-3 font-bold">Total Expenses</div>
            <div className="font-mono text-3xl font-medium text-ledger-expense tracking-tight">₹{data.totalExpense.toLocaleString()}</div>
            <div className="text-[11px] text-ledger-dim mt-2 font-medium">{data.transactionCount || 0} transactions</div>
          </div>
        </div>
      </Animate>
    </div>
  );
};
