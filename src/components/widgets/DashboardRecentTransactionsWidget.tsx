import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../../services/apiService';
import type { GroupedTransactions } from '../../services/apiService';
import { TransactionItem } from '../ui/Cards';
import { Animate } from '../ui/Animate';
import { Skeleton } from '../ui/Skeleton';

export const DashboardRecentTransactionsWidget: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<GroupedTransactions[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const transactions = await apiService.getRecentTransactions();
      setData(transactions);
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Animate type="slideUp" delay={0.3}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-[10px] text-ledger-muted uppercase tracking-[0.15em] font-bold">Recent Activity</div>
          <button onClick={() => navigate('/transactions')} className="text-[12px] text-ledger-accent hover:underline font-body font-medium">All transactions →</button>
        </div>
        <div className="divide-y divide-ledger-border">
          {data.slice(0, 1).map(group => (
            <div key={group.date} className="space-y-1">
               {group.items.slice(0, 7).map(t => (
                 <TransactionItem key={t.id} transaction={t} />
               ))}
            </div>
          ))}
        </div>
      </div>
    </Animate>
  );
};
