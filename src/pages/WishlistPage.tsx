import React, { useState, useEffect, useCallback } from 'react';
import { TopAppBar } from '../components/ui/Common';
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
    const handleDataUpdated = () => {
      fetchData();
    };
    window.addEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
    return () => {
      window.removeEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
    };
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface pb-32 pt-20 min-h-screen">
      <TopAppBar title="Vault" />

      <main className="max-w-4xl mx-auto px-6 md:px-8 space-y-10">
        <Animate type="fade" duration={0.8}>
          <section className="mt-4 space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">Wishlist</h2>
            <p className="text-on-surface-variant text-[13px] font-medium max-w-xl">Track progress towards your next acquisitions.</p>
          </section>
        </Animate>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {goals.map((goal, index) => (
            <Animate key={goal.id} type="slideUp" delay={0.1 * (index + 1)}>
              <GoalCard goal={goal} variant="grid" />
            </Animate>
          ))}

          {/* Create New Card */}
          <Animate type="slideUp" delay={0.1 * (goals.length + 1)}>
            <article
              onClick={() => openModal('goal')}
              className="bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/30 flex flex-col items-center justify-center h-[380px] hover:bg-surface-container-low transition-colors cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-2xl text-primary">add</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">New Goal</h3>
              <p className="text-on-surface-variant text-[12px] mt-1 font-medium">What's next on your list?</p>
            </article>
          </Animate>
        </div>
      </main>
    </div>
  );
};

export default WishlistPage;
