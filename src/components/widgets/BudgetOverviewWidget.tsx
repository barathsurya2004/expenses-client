import React, { useState, useEffect, useCallback } from 'react';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../../services/apiService';
import type { BudgetOverviewData } from '../../services/apiService';
import { ProgressBar } from '../ui/Common';
import { Animate } from '../ui/Animate';
import { Skeleton } from '../ui/Skeleton';

export const BudgetOverviewWidget: React.FC = () => {
  const [data, setData] = useState<BudgetOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const summary = await apiService.getBudgetOverview();
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
        <header>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </header>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <Animate type="fade">
        <header>
            <h1 className="font-headline text-4xl font-bold text-ledger-text tracking-tight">Budget</h1>
            <p className="text-[13px] text-ledger-muted mt-2 font-body">April 2026 · {data.categoryCount} categories tracked</p>
        </header>
      </Animate>

      <Animate type="slideUp" delay={0.2}>
        <div className="bg-ledger-s2 border border-ledger-border rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-ledger-accent to-ledger-income via-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                <div>
                    <p className="text-[10px] text-ledger-muted uppercase tracking-[0.12em] mb-2 font-bold">Total Spent</p>
                    <p className="font-mono text-2xl font-medium text-ledger-text">₹{data.totalSpent.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-[10px] text-ledger-muted uppercase tracking-[0.12em] mb-2 font-bold">Total Budget</p>
                    <p className="font-mono text-2xl font-medium text-ledger-muted">₹{data.totalBudget.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-[10px] text-ledger-muted uppercase tracking-[0.12em] mb-2 font-bold">Remaining</p>
                    <p className={`font-mono text-2xl font-medium ${data.totalBudget - data.totalSpent < 0 ? 'text-ledger-expense' : 'text-ledger-income'}`}>₹{(data.totalBudget - data.totalSpent).toLocaleString()}</p>
                </div>
            </div>
            <ProgressBar progress={data.totalProgress} color="bg-gradient-to-r from-ledger-income to-ledger-accent" height="h-1.5" />
            <p className="text-[11px] text-ledger-muted mt-3 font-medium">{Math.round(data.totalProgress)}% of total allocated budget consumed</p>
        </div>
      </Animate>
    </div>
  );
};
