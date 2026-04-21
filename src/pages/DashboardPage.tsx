import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar, ProgressBar } from '../components/ui/Common';
import { GoalCard, TransactionItem } from '../components/ui/Cards';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../services/apiService';
import type { DashboardSummary } from '../services/apiService';
import { Animate } from '../components/ui/Animate';
import { getBgClass } from '../utils/colors';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const summary = await apiService.getDashboardSummary();
      setData(summary);
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

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="text-on-background font-body min-h-screen pb-32 pt-20 antialiased">
      <TopAppBar title="Vault" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section */}
        <Animate type="fade" duration={0.8}>
          <section className="bg-surface-container-low rounded-xl p-6 sm:p-10 relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="space-y-2">
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Remaining Balance</p>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-on-surface">₹{data.balance.toLocaleString()}</h2>
                <p className="text-primary text-xs font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  +12% this month
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                <div className="bg-surface-container rounded-2xl p-4 md:w-44 border border-outline-variant/10 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-red-400 text-[14px]">arrow_upward</span>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Spent</p>
                  </div>
                  <p className="text-xl font-bold text-red-400">₹{data.totalExpense.toLocaleString()}</p>
                </div>
                <div className="bg-surface-container rounded-2xl p-4 md:w-44 border border-outline-variant/10 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-green-400 text-[14px]">arrow_downward</span>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Total Income</p>
                  </div>
                  <p className="text-xl font-bold text-green-400">₹{data.totalIncome.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </section>
        </Animate>



        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Animate type="slideUp" delay={0.3} className="lg:col-span-2">
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-headline font-bold mb-4 text-on-surface px-1">Financial Goals</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                  {data.goals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} variant="carousel" />
                  ))}
                </div>
              </section>
            </div>
          </Animate>

          <Animate type="slideUp" delay={0.4}>
            <div className="space-y-6">

              <section className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/15">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-headline font-bold text-on-surface">Recent Transactions</h3>
                  <button
                    onClick={() => navigate('/transactions')}
                    className="text-primary text-[11px] font-bold uppercase tracking-wider hover:opacity-80"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-6">
                  {data.recentTransactions.map((group) => (
                    <div key={group.date} className="space-y-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 ml-1">
                        {group.label}
                      </p>
                      <div className="space-y-4">
                        {group.items.map(transaction => (
                          <TransactionItem key={transaction.id} transaction={transaction} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              {data.insights.length > 0 && (
                <section className="bg-gradient-to-br from-surface-container-high to-surface-container rounded-xl p-6 border border-outline-variant/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-primary text-[18px]">lightbulb</span>
                    </div>
                    <h3 className="text-base font-headline font-bold mb-1.5 text-on-surface">{data.insights[0].title}</h3>
                    <p className="text-[12px] leading-relaxed text-on-surface-variant mb-5">{data.insights[0].description}</p>
                    <button
                      onClick={() => navigate('/budget')}
                      className="w-full bg-surface-container-highest hover:bg-surface-bright text-primary font-bold py-2.5 rounded-full transition-colors text-[11px] uppercase tracking-wider"
                    >
                      Review Budget
                    </button>
                  </div>
                </section>
              )}

              <section className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/15">
                <h3 className="text-base font-headline font-bold mb-5 text-on-surface">Spending by Category</h3>
                <div className="space-y-4">
                  {data.categories.slice(0, 3).map(category => (
                    <div key={category.name}>
                      <div className="flex justify-between text-[12px] mb-1.5 font-medium">
                        <span className="text-on-surface-variant flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">{category.icon}</span> {category.name}
                        </span>
                        <span className="text-on-surface">{category.percentage}%</span>
                      </div>
                      <ProgressBar progress={category.percentage} color={getBgClass(category.color)} height="h-1" />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </Animate>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
