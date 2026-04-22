import React, { useState, useEffect, useCallback } from 'react';
import { GoalCard } from '../components/ui/Cards';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../services/apiService';
import type { Goal } from '../types';
import { Animate } from '../components/ui/Animate';
import { useModal } from '../hooks/useModal';

const WishlistPage: React.FC = () => {
  const { openModal } = useModal();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const goalsData = await apiService.getGoals();
      setGoals(goalsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleDataUpdated = () => fetchData();
    window.addEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
    return () => window.removeEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ledger-bg">
        <div className="w-10 h-10 border-2 border-ledger-accent/20 border-t-ledger-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalSaved = goals.reduce((a, g) => a + g.currentAmount, 0);
  const totalTarget = goals.reduce((a, g) => a + g.targetAmount, 0);

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-12 pb-24 md:pb-12">
      <Animate type="fade">
        <header>
          <h1 className="font-headline text-4xl font-bold text-ledger-text tracking-tight">Goals</h1>
          <div className="flex items-center gap-4 mt-2 font-body">
            <div className="text-[13px] text-ledger-muted">{goals.length} active goals</div>
            <div className="w-px h-3 bg-ledger-border" />
            <div className="text-[13px] text-ledger-income">₹{totalSaved.toLocaleString()} saved of ₹{totalTarget.toLocaleString()}</div>
          </div>
        </header>
      </Animate>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal, index) => (
          <Animate key={goal.id} type="slideUp" delay={0.1 * (index + 1)}>
            <GoalCard goal={goal} variant="grid" />
          </Animate>
        ))}

        {/* Add Goal Placeholder */}
        <Animate type="slideUp" delay={0.1 * (goals.length + 1)}>
            <div
                onClick={() => openModal('goal')}
                className="bg-transparent border border-dashed border-ledger-faint rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[260px] hover:border-ledger-accent/40 transition-colors group"
            >
                <div className="w-12 h-12 rounded-xl border border-dashed border-ledger-faint flex items-center justify-center text-2xl text-ledger-dim group-hover:text-ledger-accent group-hover:border-ledger-accent/40 transition-all">
                    <span className="material-symbols-outlined">add</span>
                </div>
                <div className="text-[13px] text-ledger-dim font-medium group-hover:text-ledger-accent transition-colors">Add new goal</div>
            </div>
        </Animate>
      </div>
    </div>
  );
};

export default WishlistPage;
