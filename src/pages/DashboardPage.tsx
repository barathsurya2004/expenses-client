import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../components/ui/Common';
import { GoalCard, TransactionItem } from '../components/ui/Cards';
import { apiService, FINANCE_DATA_UPDATED_EVENT } from '../services/apiService';
import type { DashboardSummary } from '../services/apiService';
import { Animate } from '../components/ui/Animate';

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
      <div className="min-h-screen flex items-center justify-center bg-ledger-bg">
        <div className="w-10 h-10 border-2 border-ledger-accent/20 border-t-ledger-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  const netBalance = data.totalIncome - data.totalExpense;
  const savingsPct = ((netBalance / data.totalIncome) * 100).toFixed(1);

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-12 pb-24 md:pb-12">
      {/* Header */}
      <Animate type="fade">
        <div>
          <div className="text-[11px] text-ledger-muted uppercase tracking-[0.15em] mb-4 font-body font-bold">Good morning · April 2026</div>
          <div className="font-headline text-5xl md:text-7xl font-bold text-ledger-text tracking-tighter leading-[0.9]">
            ₹{netBalance.toLocaleString()}
          </div>
          <div className="flex items-center gap-4 mt-4 font-body">
            <div className="text-[13px] text-ledger-muted">Net balance this month</div>
            <div className="w-px h-3 bg-ledger-border" />
            <div className="text-[13px] text-ledger-income font-medium">↑ {savingsPct}% savings rate</div>
          </div>
        </div>
      </Animate>

      {/* Income / Expense cards */}
      <Animate type="slideUp" delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-ledger-s2 border border-ledger-border rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-ledger-income/40 to-transparent" />
            <div className="text-[10px] text-ledger-muted uppercase tracking-[0.12em] mb-3 font-bold">Total Income</div>
            <div className="font-mono text-3xl font-medium text-ledger-income tracking-tight">₹{data.totalIncome.toLocaleString()}</div>
            <div className="text-[11px] text-ledger-dim mt-2 font-medium">{data.recentTransactions.filter(g => g.label === 'Income').length || 2} sources logged</div>
          </div>
          <div className="bg-ledger-s2 border border-ledger-border rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-ledger-expense/40 to-transparent" />
            <div className="text-[10px] text-ledger-muted uppercase tracking-[0.12em] mb-3 font-bold">Total Expenses</div>
            <div className="font-mono text-3xl font-medium text-ledger-expense tracking-tight">₹{data.totalExpense.toLocaleString()}</div>
            <div className="text-[11px] text-ledger-dim mt-2 font-medium">{data.recentTransactions.reduce((acc, g) => acc + g.items.length, 0)} transactions</div>
          </div>
        </div>
      </Animate>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Recent Activity */}
        <Animate type="slideUp" delay={0.3} className="lg:col-span-7">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-[10px] text-ledger-muted uppercase tracking-[0.15em] font-bold">Recent Activity</div>
              <button onClick={() => navigate('/transactions')} className="text-[12px] text-ledger-accent hover:underline font-body font-medium">All transactions →</button>
            </div>
            <div className="divide-y divide-ledger-border">
              {data.recentTransactions.slice(0, 1).map(group => (
                <div key={group.date} className="space-y-1">
                   {group.items.slice(0, 7).map(t => (
                     <TransactionItem key={t.id} transaction={t} />
                   ))}
                </div>
              ))}
            </div>
          </div>
        </Animate>

        {/* Breakdown + Insights */}
        <Animate type="slideUp" delay={0.4} className="lg:col-span-5 space-y-10">
          {/* Spending Breakdown */}
          <section>
            <div className="text-[10px] text-ledger-muted uppercase tracking-[0.15em] font-bold mb-6">Spending Breakdown</div>
            <div className="space-y-5">
              {data.categories.slice(0, 5).map(cat => (
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

          {/* Insight Callout */}
          {data.insights.length > 0 && (
            <div className="bg-ledger-s2 border border-ledger-border border-l-[3px] border-l-ledger-accent rounded-xl p-6 shadow-xl">
              <div className="text-[10px] text-ledger-accent uppercase tracking-[0.12em] mb-2 font-bold">💡 Insight</div>
              <div className="text-[14px] font-bold text-ledger-text leading-tight mb-2">{data.insights[0].title}</div>
              <div className="text-[12.5px] text-ledger-muted leading-relaxed font-body">
                {data.insights[0].description}
              </div>
            </div>
          )}
        </Animate>
      </div>

      {/* Goals Carousel */}
      <Animate type="slideUp" delay={0.5}>
        <section>
            <div className="flex justify-between items-center mb-6">
                <div className="text-[10px] text-ledger-muted uppercase tracking-[0.15em] font-bold">Financial Goals</div>
                <button onClick={() => navigate('/wishlist')} className="text-[12px] text-ledger-accent hover:underline font-body font-medium">View all goals</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
                {data.goals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} variant="carousel" />
                ))}
            </div>
        </section>
      </Animate>
    </div>
  );
};

export default DashboardPage;
