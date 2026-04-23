import React, { useState, useEffect, useCallback } from 'react';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../../services/apiService';
import type { Insight } from '../../types';
import { Skeleton } from '../ui/Skeleton';

export const DashboardInsightsWidget: React.FC = () => {
  const [data, setData] = useState<Insight[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const insights = await apiService.getTopInsights();
      setData(insights);
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
      <div className="bg-ledger-s2 border border-ledger-border rounded-xl p-6">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (data.length === 0) return null;

  return (
    <div className="bg-ledger-s2 border border-ledger-border border-l-[3px] border-l-ledger-accent rounded-xl p-6 shadow-xl">
      <div className="text-[10px] text-ledger-accent uppercase tracking-[0.12em] mb-2 font-bold">💡 Insight</div>
      <div className="text-[14px] font-bold text-ledger-text leading-tight mb-2">{data[0].title}</div>
      <div className="text-[12.5px] text-ledger-muted leading-relaxed font-body">
        {data[0].description}
      </div>
    </div>
  );
};
