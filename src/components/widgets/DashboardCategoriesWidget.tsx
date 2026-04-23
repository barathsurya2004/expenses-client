import React, { useState, useEffect, useCallback } from 'react';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../../services/apiService';
import type { CategorySpending } from '../../types';
import { ProgressBar } from '../ui/Common';
import { Skeleton } from '../ui/Skeleton';

export const DashboardCategoriesWidget: React.FC = () => {
  const [data, setData] = useState<CategorySpending[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const categories = await apiService.getCategorySpending();
      setData(categories);
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
      <section>
        <Skeleton className="h-3 w-32 mb-6" />
        <div className="space-y-8">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-[2px] w-full" />
              <div className="flex justify-end mt-1.5">
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="text-[10px] text-ledger-muted uppercase tracking-[0.15em] font-bold mb-6">Spending Breakdown</div>
      <div className="space-y-5">
        {data.slice(0, 5).map(cat => (
          <div key={cat.name}>
            <div className="flex justify-between items-baseline mb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-[13px] text-ledger-text font-medium">{cat.name}</span>
              </div>
              <span className="font-mono text-[11px] text-ledger-muted">
                ₹{cat.spent.toLocaleString()} <span className="text-ledger-dim">/ ₹{cat.budget.toLocaleString()}</span>
              </span>
            </div>
            <ProgressBar progress={cat.percentage} color={cat.color} height="h-[2px]" />
            <div className="text-[10px] text-ledger-dim mt-1.5 text-right font-medium">{Math.round(cat.percentage)}% utilised</div>
          </div>
        ))}
      </div>
    </section>
  );
};
