import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../../services/apiService';
import type { Goal } from '../../types';
import { GoalCard } from '../ui/Cards';
import { Animate } from '../ui/Animate';
import { Skeleton } from '../ui/Skeleton';

export const DashboardGoalsWidget: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Goal[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const goals = await apiService.getGoals();
      setData(goals);
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
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="min-w-[240px] h-32 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <Animate type="slideUp" delay={0.5}>
      <section>
          <div className="flex justify-between items-center mb-6">
              <div className="text-[10px] text-ledger-muted uppercase tracking-[0.15em] font-bold">Financial Goals</div>
              <button onClick={() => navigate('/wishlist')} className="text-[12px] text-ledger-accent hover:underline font-body font-medium">View all goals</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
              {data.map(goal => (
                  <GoalCard key={goal.id} goal={goal} variant="carousel" />
              ))}
          </div>
      </section>
    </Animate>
  );
};
