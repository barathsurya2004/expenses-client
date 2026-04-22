import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopAppBar, ProgressBar } from '../components/ui/Common';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../services/apiService';
import type { Goal } from '../types';
import { Animate } from '../components/ui/Animate';
import { useModal } from '../hooks/useModal';
import { resolveColor } from '../utils/colors';

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
      <div className="min-h-screen flex items-center justify-center bg-ledger-bg">
        <div className="w-10 h-10 border-2 border-ledger-accent/20 border-t-ledger-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ledger-bg p-6">
        <h2 className="font-headline text-xl font-bold mb-4 text-ledger-text">Goal not found</h2>
        <button onClick={() => navigate('/wishlist')} className="px-6 py-2 bg-ledger-accent text-ledger-bg rounded-xl text-sm font-bold uppercase tracking-widest">Go Back</button>
      </div>
    );
  }

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const goalColor = resolveColor(goal.color);

  return (
    <div className="bg-ledger-bg text-ledger-text min-h-screen flex flex-col pb-24 md:pb-12">
      <TopAppBar
        title={goal.name}
        showBack
        onBack={() => navigate(-1)}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => openModal('edit-goal')}
              className="text-ledger-accent hover:bg-ledger-s2 transition-colors p-2 rounded-lg active:scale-95 duration-200 flex items-center justify-center border border-white/10"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="text-ledger-expense hover:bg-ledger-expense/10 transition-colors p-2 rounded-lg active:scale-95 duration-200 flex items-center justify-center border border-white/10"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        }
      />

      <main className="flex-grow pt-24 px-6 md:px-12 max-w-5xl mx-auto w-full flex flex-col gap-8">
        <Animate type="fade">
          <section className="flex flex-col md:flex-row gap-8 items-start bg-ledger-s2 rounded-2xl p-6 md:p-8 relative overflow-hidden border border-white/10">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${goalColor}00, ${goalColor}80, ${goalColor}00)` }} />
            <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-xl overflow-hidden bg-ledger-s1 flex items-center justify-center border border-white/10 shadow-inner">
              {goal.image ? (
                <img alt={goal.name} className="object-cover w-full h-full opacity-80" src={goal.image} />
              ) : (
                <span className="material-symbols-outlined text-7xl text-ledger-dim opacity-30">{goal.icon || 'flag'}</span>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex flex-wrap gap-3">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] rounded border font-body ${goal.priority === 'High' ? 'text-ledger-expense bg-ledger-expense/10 border-ledger-expense/20' : 'text-ledger-accent bg-ledger-accent/10 border-ledger-accent/20'}`}>
                   {goal.priority || 'Medium'} Priority
                </span>
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] bg-ledger-s3 text-ledger-muted rounded border border-white/10 font-body">
                   {goal.category}
                </span>
              </div>
              <div>
                <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight text-ledger-text mb-3 leading-tight">{goal.name}</h2>
                <p className="text-ledger-muted text-[14.5px] leading-relaxed max-w-2xl font-body">{goal.description}</p>
              </div>
            </div>
          </section>
        </Animate>

        <Animate type="slideUp" delay={0.2}>
          <section className="bg-ledger-s2 rounded-2xl p-6 md:p-10 border border-white/10 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div className="flex-grow space-y-8">
                <div>
                  <div className="flex justify-between items-baseline mb-4">
                    <h3 className="text-[10px] text-ledger-muted uppercase tracking-[0.15em] font-bold font-body">Savings Progress</h3>
                    <div className="font-mono text-3xl font-medium tracking-tighter" style={{ color: goalColor }}>{Math.round(progress)}%</div>
                  </div>
                  <ProgressBar progress={progress} color={goalColor} height="h-2" />
                  <div className="flex justify-between text-[11px] text-ledger-dim font-medium mt-4 font-mono">
                    <span>₹0</span>
                    <span className="text-ledger-muted">₹{(goal.targetAmount - goal.currentAmount).toLocaleString()} Remaining</span>
                    <span>₹{goal.targetAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-6 border-t border-white/5">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-ledger-dim mb-2 font-bold font-body">Current Savings</p>
                        <p className="font-mono text-2xl font-medium text-ledger-text">₹{goal.currentAmount.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-ledger-dim mb-2 font-bold font-body">Target Amount</p>
                        <p className="font-mono text-2xl font-medium text-ledger-muted">₹{goal.targetAmount.toLocaleString()}</p>
                    </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0 min-w-[200px]">
                <button
                  onClick={handleQuickAdd}
                  className="w-full px-6 py-4 rounded-xl bg-ledger-accent text-ledger-bg hover:brightness-110 active:scale-[0.98] transition-all font-bold shadow-lg shadow-ledger-accent/20 text-[12px] flex items-center justify-center gap-2 uppercase tracking-[0.15em] font-body"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span> Quick Add
                </button>
                <button
                  onClick={() => openModal('edit-goal')}
                  className="w-full px-6 py-4 rounded-xl bg-ledger-s3 text-ledger-text hover:bg-ledger-faint transition-all border border-white/10 font-bold text-[12px] uppercase tracking-[0.15em] font-body"
                >
                  Edit Goal Details
                </button>
              </div>
            </div>
          </section>
        </Animate>

        <Animate type="slideUp" delay={0.3}>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { label: 'Category', val: goal.category, icon: 'category', color: goalColor },
              { label: 'ETA', val: goal.eta || 'N/A', icon: 'schedule', color: '#6DAD85' },
              { label: 'Priority', val: goal.priority || 'Medium', icon: 'priority_high', color: goal.priority === 'High' ? '#C46555' : '#C4903D' },
            ].map(stat => (
              <div key={stat.label} className="bg-ledger-s2 border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-ledger-dim font-body">{stat.label}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 bg-ledger-s1">
                    <span className="material-symbols-outlined text-[18px] text-ledger-muted" style={{ color: stat.color }}>{stat.icon}</span>
                  </div>
                </div>
                <div className="font-body text-xl font-bold text-ledger-text">{stat.val}</div>
              </div>
            ))}
          </section>
        </Animate>

        {goal.description && (
          <Animate type="slideUp" delay={0.4}>
            <section className="bg-ledger-s2 rounded-2xl p-6 border border-white/5 flex gap-5 items-start">
              <div className="bg-ledger-s1 p-3 rounded-xl border border-white/5 text-ledger-muted shrink-0">
                <span className="material-symbols-outlined text-[20px]">notes</span>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-ledger-dim mb-2 font-body">About this goal</h4>
                <p className="text-[14px] leading-relaxed text-ledger-muted font-body">{goal.description}</p>
              </div>
            </section>
          </Animate>
        )}
      </main>
    </div>
  );
};

export default WishlistItemPage;
