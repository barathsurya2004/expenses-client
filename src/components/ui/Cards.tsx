import React, { useRef } from 'react';
import type { Transaction, Goal, CategorySpending, Insight } from '../../types';
import { ProgressBar } from './Common';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { resolveColor } from '../../utils/colors';

export const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const isIncome = transaction.type === 'income';
  const colorClass = isIncome ? 'text-ledger-income' : 'text-ledger-expense';
  const initials = transaction.merchant.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3 py-3 border-bottom border-ledger-border group">
      <div className="w-8 h-8 rounded-full bg-ledger-faint flex items-center justify-center text-[11px] font-semibold text-ledger-text flex-shrink-0 font-body tracking-wider">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-ledger-text text-[13.5px] truncate">{transaction.merchant}</p>
        <p className="text-[11px] text-ledger-muted mt-0.5">{transaction.category}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-medium text-[13.5px] font-mono tracking-tight ${colorClass}`}>
          {isIncome ? '+' : '−'}₹{transaction.amount.toLocaleString()}
        </p>
        <p className="text-[11px] text-ledger-muted mt-0.5">{transaction.date}</p>
      </div>
    </div>
  );
};

export const GoalCard: React.FC<{ goal: Goal; variant?: 'carousel' | 'grid' }> = ({ goal, variant = 'carousel' }) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const cardRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;
    const onEnter = () => gsap.to(cardRef.current, { borderColor: '#C4903D', duration: 0.2 });
    const onLeave = () => gsap.to(cardRef.current, { borderColor: '#282420', duration: 0.2 });
    cardRef.current.addEventListener('mouseenter', onEnter);
    cardRef.current.addEventListener('mouseleave', onLeave);
    return () => {
      cardRef.current?.removeEventListener('mouseenter', onEnter);
      cardRef.current?.removeEventListener('mouseleave', onLeave);
    };
  }, { scope: cardRef });

  const goalColor = resolveColor(goal.color);

  if (variant === 'carousel') {
    return (
      <Link
        ref={cardRef}
        to={`/wishlist/${goal.id}`}
        className="min-w-[240px] block cursor-pointer bg-ledger-s2 rounded-xl p-5 border border-ledger-border relative overflow-hidden transition-colors"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${goalColor}00, ${goalColor}80, ${goalColor}00)` }} />
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-[14px] text-ledger-text line-clamp-1">{goal.name}</h4>
          <span className="text-[10px] font-mono text-ledger-muted">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="mb-4">
          <p className="text-[11px] text-ledger-muted font-medium">₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</p>
        </div>
        <ProgressBar progress={progress} color={goalColor} height="h-[2px]" />
      </Link>
    );
  }

  return (
    <Link ref={cardRef} to={`/wishlist/${goal.id}`} className="block cursor-pointer group">
      <article className="bg-ledger-s2 rounded-xl p-6 border border-ledger-border relative overflow-hidden transition-all h-full">
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${goalColor}00, ${goalColor}80, ${goalColor}00)` }} />

        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-4">
            <div className="relative w-[60px] h-[60px] flex items-center justify-center">
              {/* Simplified Ring for now */}
              <div className="absolute inset-0 rounded-full border-2 border-ledger-faint" />
              <div className="absolute inset-0 rounded-full border-2 border-current transition-all duration-1000" style={{ color: goalColor, clipPath: `inset(0 ${100 - progress}% 0 0)` }} />
              <span className="font-mono text-[12px] text-ledger-text">{Math.round(progress)}%</span>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-ledger-text leading-tight">{goal.name}</h3>
              <p className="text-[11px] text-ledger-muted mt-1">{goal.category}</p>
            </div>
          </div>
          {goal.priority && (
            <span className={`text-[9px] px-2 py-0.5 rounded border border-current uppercase tracking-wider font-bold ${goal.priority === 'High' ? 'text-ledger-expense bg-ledger-expense/10' : goal.priority === 'Medium' ? 'text-ledger-accent bg-ledger-accent/10' : 'text-ledger-dim bg-ledger-dim/10'}`}>
              {goal.priority}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ledger-border">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ledger-dim mb-1">Saved</p>
            <p className="font-mono text-[14px]" style={{ color: goalColor }}>₹{goal.currentAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ledger-dim mb-1">Remaining</p>
            <p className="font-mono text-[14px] text-ledger-text">₹{(goal.targetAmount - goal.currentAmount).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ledger-dim mb-1">Target</p>
            <p className="font-mono text-[14px] text-ledger-muted">₹{goal.targetAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ledger-dim mb-1">ETA</p>
            <p className="font-body text-[14px] text-ledger-text">{goal.eta || 'N/A'}</p>
          </div>
        </div>


      </article>
    </Link>
  );
};

export const BudgetCard: React.FC<{ category: CategorySpending }> = ({ category }) => {
  const progress = (category.spent / category.budget) * 100;
  const isOver = category.spent > category.budget;
  const catColor = resolveColor(category.color);

  return (
    <div className="bg-ledger-s2 rounded-xl p-5 border border-ledger-border flex flex-col justify-between h-44 transition-colors hover:border-ledger-accent/50">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${catColor}15`, border: `1px solid ${catColor}33` }}>
            <span className="material-symbols-outlined text-[18px]" style={{ color: catColor }}>{category.icon}</span>
          </div>
          <h3 className="text-[14px] font-medium text-ledger-text">{category.name}</h3>
          {isOver && <span className="text-[9px] text-ledger-expense bg-ledger-expense/10 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold mt-1 w-fit">Over</span>}
        </div>
        <div className="text-right">
          <p className={`font-mono text-[16px] font-medium ${isOver ? 'text-ledger-expense' : 'text-ledger-text'}`}>₹{category.spent.toLocaleString()}</p>
          <p className="text-[11px] font-mono text-ledger-dim mt-0.5">/ ₹{category.budget.toLocaleString()}</p>
        </div>
      </div>
      <div>
        <ProgressBar progress={progress} color={isOver ? 'ledger-expense' : catColor} height="h-[3px]" />
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-ledger-dim">{Math.round(progress)}% utilised</span>
          <span className={`text-[10px] ${isOver ? 'text-ledger-expense' : 'text-ledger-muted'}`}>
            {isOver ? `₹${(category.spent - category.budget).toLocaleString()} over` : `₹${(category.budget - category.spent).toLocaleString()} left`}
          </span>
        </div>
      </div>
    </div>
  );
};

export const RecurringCostCard: React.FC<{
  item: {
    name: string;
    icon: string;
    color?: string;
    amount: number;
    isPaid: boolean;
    nextPayCycle: string;
    paidOn: string | null;
  };
}> = ({ item }) => {
  return (
    <div className="bg-ledger-s2 rounded-xl p-5 border border-ledger-border flex flex-col justify-between h-44 transition-colors hover:border-ledger-accent/50">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${item.color || '#C46555'}15`, border: `1px solid ${item.color || '#C46555'}33` }}>
            <span className="material-symbols-outlined text-[18px]" style={{ color: item.color || '#C46555' }}>{item.icon}</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-medium text-ledger-text truncate">{item.name}</h3>
            <p className="text-[10px] text-ledger-muted uppercase tracking-wider mt-0.5">Cycle: {item.nextPayCycle}</p>
          </div>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-current ${item.isPaid ? 'text-ledger-income bg-ledger-income/10' : 'text-ledger-expense bg-ledger-expense/10'}`}>
          {item.isPaid ? 'Paid' : 'Due'}
        </span>
      </div>

      <div className="flex items-end justify-between border-t  border-ledger-border pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ledger-dim mb-1">Amount</p>
          <p className="font-mono text-[16px] font-medium text-ledger-text">₹{item.amount.toLocaleString()}</p>
        </div>
        <p className="text-[10px] text-ledger-muted uppercase tracking-wider">
          {item.isPaid && item.paidOn ? item.paidOn : 'Pending'}
        </p>
      </div>
    </div>
  );
};

export const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
  const trendColor = insight.trend === 'up' ? 'text-ledger-expense' : insight.trend === 'down' ? 'text-ledger-income' : 'text-ledger-accent';
  const trendIcon = insight.trend === 'up' ? '↑' : insight.trend === 'down' ? '↓' : '→';

  return (
    <section className="bg-ledger-s2 rounded-xl p-6 border border-ledger-border flex gap-5 items-start transition-colors hover:border-ledger-accent/30">
      <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-mono text-[17px] font-bold border border-current bg-opacity-10 ${trendColor}`} style={{ backgroundColor: 'currentColor' }}>
        <span className="text-white mix-blend-difference">{trendIcon}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-[14.5px] font-bold text-ledger-text leading-tight">{insight.title}</h3>
          <span className={`text-[9px] px-2 py-0.5 rounded border border-current uppercase tracking-widest font-bold ${trendColor} bg-opacity-10`} style={{ backgroundColor: 'currentColor' }}>
            <span className="text-white mix-blend-difference">{insight.trend === 'up' ? 'Attention' : 'Healthy'}</span>
          </span>
        </div>
        <p className="text-ledger-muted text-[13px] leading-relaxed font-body">{insight.description}</p>
      </div>
    </section>
  );
};
