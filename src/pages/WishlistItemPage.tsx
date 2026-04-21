import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopAppBar, ProgressBar } from '../components/ui/Common';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../services/apiService';
import type { Goal } from '../types';
import { Animate } from '../components/ui/Animate';
import { useModal } from '../hooks/useModal';

const WishlistItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { id } = useParams<{ id: string }>();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGoal = useCallback(async () => {
    if (!id) return;
    try {
      const data = await apiService.getGoalById(id);
      if (data) {
        setGoal(data);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  useEffect(() => {
    const handleDataUpdated = () => {
      fetchGoal();
    };
    window.addEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
    return () => {
      window.removeEventListener(FINANCE_DATA_UPDATED_EVENT, handleDataUpdated);
    };
  }, [fetchGoal]);

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await apiService.deleteGoal(id);
      navigate('/wishlist');
    }
  };

  const handleQuickAdd = () => {
    if (!id || !goal) return;
    sessionStorage.setItem('quickAddGoalId', id);
    openModal('quick-add-goal');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <h2 className="text-xl font-bold mb-4">Goal not found</h2>
        <button onClick={() => navigate('/wishlist')} className="px-5 py-2 bg-primary text-on-primary rounded-full text-sm font-bold">Go Back</button>
      </div>
    );
  }

  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col pb-40">
      <TopAppBar
        title={goal.name}
        showBack
        onBack={() => navigate(-1)}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => openModal('adjust-target')}
              className="text-[#aac7ff] hover:bg-[#353438] transition-colors p-1.5 rounded-full active:scale-95 duration-200 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="text-error hover:bg-error-container/20 transition-colors p-1.5 rounded-full active:scale-95 duration-200 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        }
      />

      <main className="flex-grow pt-20 px-4 md:px-6 max-w-5xl mx-auto w-full flex flex-col gap-5">
        <Animate type="fade" duration={0.8}>
          <section className="flex flex-col md:flex-row gap-5 items-center bg-surface-container-low rounded-xl p-5 md:p-6 shadow-lg relative overflow-hidden border border-outline-variant/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <div className="w-full md:w-1/4 aspect-video md:aspect-square rounded-lg overflow-hidden bg-surface-container-lowest flex items-center justify-center border border-outline-variant/10">
              {goal.image ? (
                <img alt={goal.name} className="object-cover w-full h-full" src={goal.image} />
              ) : (
                <span className="material-symbols-outlined text-6xl text-surface-container-highest opacity-50">{goal.icon}</span>
              )}
            </div>
            <div className="w-full md:w-3/4 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-error-container/20 text-error rounded-full border border-error/20 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">priority_high</span> {goal.priority || 'Medium'}
                </span>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary rounded-full border border-primary/20 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">category</span> {goal.category}
                </span>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-1">{goal.name}</h2>
                <p className="text-on-surface-variant text-[13px] leading-relaxed max-w-2xl font-medium">{goal.description}</p>
              </div>
            </div>
          </section>
        </Animate>

        <Animate type="slideUp" delay={0.2}>
          <section className="bg-surface-container rounded-xl p-5 md:p-8 shadow-md border border-outline-variant/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div className="flex-grow">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <h3 className="text-base font-bold text-on-surface mb-0.5">Saving Progress</h3>
                    <p className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">Target: ₹{(goal.targetAmount / 10).toLocaleString()} / month</p>
                  </div>
                  <div className="text-3xl font-black tracking-tighter text-primary">{Math.round(progress)}%</div>
                </div>
                <ProgressBar progress={progress} height="h-3" />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-3">
                  <span>₹0</span>
                  <span className="text-primary-container">₹{(goal.targetAmount - goal.currentAmount).toLocaleString()} Remaining</span>
                  <span>₹{goal.targetAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 shrink-0">
                <button
                  onClick={() => openModal('adjust-target')}
                  className="px-5 py-2.5 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-all border border-outline-variant/20 font-bold text-[12px] shadow-sm uppercase tracking-wider"
                >
                  Adjust Target
                </button>
                <button
                  onClick={handleQuickAdd}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary hover:brightness-110 active:scale-95 transition-all font-black shadow-lg shadow-primary/20 text-[12px] flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span> Quick Add
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 py-3 border-t border-outline-variant/10">
              <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-[16px]">payments</span>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-widest text-on-surface-variant font-black">Available</div>
                <div className="text-[12px] font-bold text-on-surface">₹5,000 this month</div>
              </div>
            </div>
          </section>
        </Animate>

        <Animate type="slideUp" delay={0.3}>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group min-h-[100px]">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
              <div className="flex items-start justify-between z-10">
                <span className="text-[9px] uppercase tracking-widest font-black text-on-surface-variant">Target</span>
                <span className="material-symbols-outlined text-on-surface-variant opacity-40 text-[14px]">shopping_bag</span>
              </div>
              <div className="z-10 mt-1">
                <div className="text-xl font-bold tracking-tight text-on-surface">₹{goal.targetAmount.toLocaleString()}</div>
              </div>
            </div>
            <div className="glass-panel rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group min-h-[100px]">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-tertiary/10 rounded-full blur-2xl group-hover:bg-tertiary/20 transition-all duration-500"></div>
              <div className="flex items-start justify-between z-10">
                <span className="text-[9px] uppercase tracking-widest font-black text-on-surface-variant">Saved</span>
                <span className="material-symbols-outlined text-tertiary opacity-70 text-[14px]">account_balance_wallet</span>
              </div>
              <div className="z-10 mt-1">
                <div className="text-xl font-bold tracking-tight text-tertiary">₹{goal.currentAmount.toLocaleString()}</div>
              </div>
            </div>
            <div className="glass-panel rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group min-h-[100px]">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary-container/10 rounded-full blur-2xl group-hover:bg-primary-container/20 transition-all duration-500"></div>
              <div className="flex items-start justify-between z-10">
                <span className="text-[9px] uppercase tracking-widest font-black text-on-surface-variant">Time</span>
                <span className="material-symbols-outlined text-primary-container opacity-70 text-[14px]">schedule</span>
              </div>
              <div className="z-10 mt-1">
                <div className="text-xl font-bold tracking-tight text-primary-container">{goal.eta || 'N/A'}</div>
                <div className="text-[9px] text-on-surface-variant font-bold uppercase tracking-tighter">Current trajectory</div>
              </div>
            </div>
          </section>
        </Animate>

        <section className="bg-surface-container-low rounded-xl p-4 flex gap-4 items-start border border-outline-variant/10">
          <div className="bg-surface-container p-2 rounded-full shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">notes</span>
          </div>
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Notes</h4>
            <p className="text-[12px] leading-relaxed text-on-surface font-medium">{goal.description}</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WishlistItemPage;
