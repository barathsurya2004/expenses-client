import React, { useRef } from 'react';
import type { Transaction, Goal, CategorySpending, Insight } from '../../types';
import { ProgressBar } from './Common';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getBgClass, getTextClass, getBgAlphaClass } from '../../utils/colors';
import { useModal } from '../../hooks/useModal';

export const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const isIncome = transaction.type === 'income';
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center ${isIncome ? 'group-hover:bg-green-500/10 group-hover:text-green-400' : 'group-hover:bg-primary/10 group-hover:text-primary'} transition-colors`}>
          <span className="material-symbols-outlined text-[18px]">{transaction.icon}</span>
        </div>
        <div>
          <p className="font-semibold text-on-surface text-[13px]">{transaction.merchant}</p>
          <p className="text-[11px] text-on-surface-variant font-medium">{transaction.category} • {transaction.date}</p>
        </div>
      </div>
      <span className={`font-bold text-[13px] ${isIncome ? 'text-green-400' : 'text-on-surface'}`}>
        {isIncome ? '+' : '-'}₹{transaction.amount.toLocaleString()}
      </span>
    </div>
  );
};

export const GoalCard: React.FC<{ goal: Goal; variant?: 'carousel' | 'grid' }> = ({ goal, variant = 'carousel' }) => {
  const { openModal } = useModal();
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const cardRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;

    const onEnter = () => {
      gsap.to(cardRef.current, { scale: 1.02, duration: 0.3, ease: 'power2.out' });
      if (imageRef.current) {
        gsap.to(imageRef.current, { scale: 1.1, duration: 0.6, ease: 'power2.out' });
      }
    };

    const onLeave = () => {
      gsap.to(cardRef.current, { scale: 1, duration: 0.3, ease: 'power2.out' });
      if (imageRef.current) {
        gsap.to(imageRef.current, { scale: 1, duration: 0.6, ease: 'power2.out' });
      }
    };

    cardRef.current.addEventListener('mouseenter', onEnter);
    cardRef.current.addEventListener('mouseleave', onLeave);

    return () => {
      cardRef.current?.removeEventListener('mouseenter', onEnter);
      cardRef.current?.removeEventListener('mouseleave', onLeave);
    };
  }, { scope: cardRef });

  if (variant === 'carousel') {
    return (
      <Link
        ref={cardRef}
        to={`/wishlist/${goal.id}`}
        className="min-w-[240px] block cursor-pointer bg-surface-container-low rounded-xl p-5 snap-start border border-outline-variant/15 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-3">
          <div className="flex justify-between items-start">
            <div className={`${getBgAlphaClass(goal.color)} p-1.5 rounded-full inline-flex`}>
              <span className={`material-symbols-outlined text-[16px] ${getTextClass(goal.color)}`} style={{ fontVariationSettings: "'FILL' 1" }}>{goal.icon || 'flag'}</span>
            </div>
            <span className="text-[10px] font-bold bg-surface-container-highest px-2 py-0.5 rounded-full text-on-surface-variant">
              {Math.round(progress)}%
            </span>
          </div>
          <div>
            <h4 className="font-bold text-[14px] text-on-surface line-clamp-1">{goal.name}</h4>
            <p className="text-[11px] text-on-surface-variant font-medium">₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</p>
          </div>
          <ProgressBar progress={progress} color={getBgClass(goal.color)} height="h-1" />
        </div>
      </Link>
    );
  }

  return (
    <Link ref={cardRef} to={`/wishlist/${goal.id}`} className="block cursor-pointer h-full">
      <article className="bg-surface-container-low rounded-xl overflow-hidden ghost-border relative group flex flex-col h-[380px] ambient-shadow">
        <div className="h-32 w-full bg-surface-container relative overflow-hidden">
          {goal.image ? (
            <img
              ref={imageRef}
              alt={goal.name}
              className="w-full h-full object-cover object-center opacity-80 mix-blend-screen"
              src={goal.image}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-surface-container-lowest">
              <span className="material-symbols-outlined text-6xl text-surface-container-highest opacity-50 absolute">{goal.icon}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent"></div>
        </div>
        <div className="p-6 flex flex-col flex-grow justify-between relative z-10 -mt-8">
          <div className="space-y-1.5">
            <span className={`text-[10px] font-black uppercase tracking-widest ${getTextClass(goal.color)}`}>{goal.category}</span>
            <h3 className="text-xl font-bold tracking-tight text-on-surface line-clamp-1">{goal.name}</h3>
            <p className="text-on-surface-variant text-[12px] line-clamp-2 leading-relaxed font-medium">{goal.description}</p>
          </div>
          <div className="space-y-5 mt-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">Saved</p>
                <p className="text-lg font-bold text-on-surface">₹{goal.currentAmount.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">Target</p>
                <p className="text-base font-semibold text-on-surface-variant">₹{goal.targetAmount.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <ProgressBar progress={progress} color={getBgClass(goal.color)} height="h-1.5" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{Math.round(progress)}% Funded</span>
                {goal.eta && <span className={`px-2 py-0.5 bg-surface-container-high rounded-full text-[10px] font-bold uppercase tracking-wider ${getTextClass(goal.color)}`}>{goal.eta} Left</span>}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                sessionStorage.setItem('quickAddGoalId', goal.id);
                openModal('quick-add-goal');
              }}
              className="w-full py-3 rounded-full bg-surface-container-high text-on-surface text-[12px] font-bold hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2"
            >
              Quick Add
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
};

export const BudgetCard: React.FC<{ category: CategorySpending }> = ({ category }) => {
  const progress = (category.spent / category.budget) * 100;
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;
    const onEnter = () => gsap.to(cardRef.current, { y: -5, duration: 0.3, ease: 'power2.out' });
    const onLeave = () => gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: 'power2.out' });
    cardRef.current.addEventListener('mouseenter', onEnter);
    cardRef.current.addEventListener('mouseleave', onLeave);
    return () => {
      cardRef.current?.removeEventListener('mouseenter', onEnter);
      cardRef.current?.removeEventListener('mouseleave', onLeave);
    };
  }, { scope: cardRef });

  return (
    <div ref={cardRef} className="bg-surface-container-low rounded-xl p-4 ghost-border flex flex-col justify-between h-40">
      <div className="flex justify-between items-start">
        <div className="flex flex-col items-start">
          <div className={`w-10 h-10 rounded-full ${getBgAlphaClass(category.color)} flex items-center justify-center mb-2`}>
            <span
              className={`material-symbols-outlined ${getTextClass(category.color)}`}
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}
            >
              {category.icon}
            </span>
          </div>
          <h3 className="text-[13px] font-bold text-on-surface">{category.name}</h3>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${getTextClass(category.color)}`}>₹{category.spent.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">/ ₹{category.budget.toLocaleString()}</p>
        </div>
      </div>
      <div>
        <ProgressBar progress={progress} color={getBgClass(category.color)} height="h-1.5" />
        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-right mt-1.5">
          {Math.round(100 - progress)}% Left
        </p>
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
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;
    const onEnter = () => gsap.to(cardRef.current, { y: -5, duration: 0.3, ease: 'power2.out' });
    const onLeave = () => gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: 'power2.out' });
    cardRef.current.addEventListener('mouseenter', onEnter);
    cardRef.current.addEventListener('mouseleave', onLeave);
    return () => {
      cardRef.current?.removeEventListener('mouseenter', onEnter);
      cardRef.current?.removeEventListener('mouseleave', onLeave);
    };
  }, { scope: cardRef });

  return (
    <div ref={cardRef} className="bg-surface-container-low rounded-xl p-4 ghost-border flex flex-col justify-between h-40">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-full ${getBgAlphaClass(item.color)} flex items-center justify-center`}>
            <span className={`material-symbols-outlined ${getTextClass(item.color)}`} style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>
              {item.icon}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-[13px] font-bold text-on-surface truncate">{item.name}</h3>
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Next Cycle: {item.nextPayCycle}</p>
          </div>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${item.isPaid ? 'bg-green-500/15 text-green-400' : 'bg-error/15 text-error'}`}>
          {item.isPaid ? 'Paid' : 'Pending'}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Amount</p>
          <p className={`text-lg font-bold ${getTextClass(item.color)}`}>₹{item.amount.toLocaleString()}</p>
        </div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          {item.isPaid && item.paidOn ? `Paid: ${item.paidOn}` : 'Awaiting Auto-Pay'}
        </p>
      </div>
    </div>
  );
};

export const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;
    const onEnter = () => {
      gsap.to(glowRef.current, { opacity: 1, duration: 0.5 });
    };
    const onLeave = () => {
      gsap.to(glowRef.current, { opacity: 0.5, duration: 0.5 });
    };
    cardRef.current.addEventListener('mouseenter', onEnter);
    cardRef.current.addEventListener('mouseleave', onLeave);
    return () => {
      cardRef.current?.removeEventListener('mouseenter', onEnter);
      cardRef.current?.removeEventListener('mouseleave', onLeave);
    };
  }, { scope: cardRef });

  return (
    <section ref={cardRef} className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/15 relative overflow-hidden group">
      <div ref={glowRef} className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="space-y-3 max-w-md">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-surface-container-highest border border-outline-variant/15">
            <span className="material-symbols-outlined text-primary text-[14px]">{insight.trend.startsWith('-') ? 'trending_down' : 'trending_up'}</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">Spending Trend</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-on-surface">{insight.title}</h3>
          <p className="text-on-surface-variant text-[12px] leading-relaxed font-medium">{insight.description}</p>
        </div>

      </div>
    </section>
  );
};
