import React, { useState, useEffect, useCallback } from 'react';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../../services/apiService';
import { Animate } from '../ui/Animate';
import { Skeleton } from '../ui/Skeleton';

export const InsightsPulseStatsWidget: React.FC = () => {
  const [data, setData] = useState<{ 
    savingsRate: number; 
    biggestExpenseCategory: string; 
    biggestExpenseAmount: number; 
    overBudgetCount: number 
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [summary, biggest, health] = await Promise.all([
        apiService.getMonthlySummary(),
        apiService.getBiggestExpense(),
        apiService.getBudgetHealth()
      ]);
      
      setData({
        savingsRate: summary.savingsRate,
        biggestExpenseCategory: biggest?.category || 'Food',
        biggestExpenseAmount: biggest?.amount || 0,
        overBudgetCount: health.overBudgetCount
      });
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <Animate type="fade">
          <header>
              <h1 className="font-headline text-4xl font-bold text-ledger-text tracking-tight">Insights</h1>
              <p className="text-[13px] text-ledger-muted mt-2">AI-powered analysis · April 2026</p>
          </header>
      </Animate>

      <Animate type="slideUp" delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                  { label: 'Savings Rate', val: `${data.savingsRate}%`, color: 'text-ledger-income', sub: 'above 20% target' },
                  { label: 'Biggest Category', val: data.biggestExpenseCategory, color: 'text-ledger-accent', sub: `₹${data.biggestExpenseAmount.toLocaleString()} spent` },
                  { label: 'Over Budget', val: `${data.overBudgetCount} categories`, color: 'text-ledger-expense', sub: 'need attention' },
              ].map(k => (
                  <div key={k.label} className="bg-ledger-s2 border border-ledger-border rounded-xl p-6">
                      <div className="text-[10px] text-ledger-muted uppercase tracking-[0.12em] mb-2 font-bold">{k.label}</div>
                      <div className={`text-[17px] font-bold ${k.color} mb-1`}>{k.val}</div>
                      <div className="text-[11px] text-ledger-dim font-medium">{k.sub}</div>
                  </div>
              ))}
          </div>
      </Animate>
    </div>
  );
};
