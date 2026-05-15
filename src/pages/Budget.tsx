import React from 'react';
import type { Budget as BudgetType, BudgetCategory } from '../types';
import { LucideIcon } from '../components/LucideIcon';
import { Card, SectionLabel, ProgressBar, CategoryTile, PageHeader, AnimatedRupees, AnimatedInt } from '../components/Common';
import { fmtINR } from '../data';

interface BudgetProps {
  state: {
    budget: BudgetType;
  };
  onEditCategory: (cat: BudgetCategory, tier: string) => void;
  onAddCategory: (tier: string) => void;
  onTogglePaid: (catId: string) => void;
}

export const Budget: React.FC<BudgetProps> = ({ state, onEditCategory, onAddCategory, onTogglePaid }) => {
  const { budget } = state;

  const tierStats = (['needs', 'savings', 'wants'] as const).map(k => {
    const t = budget.tiers[k];
    const limit = t.categories.reduce((a, c) => a + c.limit, 0);
    const isFixed = k === 'needs';
    const spent = isFixed
      ? t.categories.filter(c => c.paid).reduce((a, c) => a + c.limit, 0)
      : t.categories.reduce((a, c) => a + c.spent, 0);
    return { key: k, label: t.label, target: t.target, limit, spent, categories: t.categories };
  });

  const totalLimit = tierStats.reduce((a, t) => a + t.limit, 0);
  const totalSpent = tierStats.reduce((a, t) => a + t.spent, 0);

  // 50/30/20 actuals
  const splitPct = {
    needs: totalLimit > 0 ? tierStats[0].limit / totalLimit : 0,
    savings: totalLimit > 0 ? tierStats[1].limit / totalLimit : 0,
    wants: totalLimit > 0 ? tierStats[2].limit / totalLimit : 0,
  };

  const fixedCostRatio = budget.income > 0 ? tierStats[0].limit / budget.income : 0;
  const adherence = totalLimit > 0 ? (totalSpent <= totalLimit ? 100 - Math.round((totalSpent / totalLimit) * 100 - 50) * 2 : Math.round(100 - (totalSpent - totalLimit) / totalLimit * 100)) : 100;
  const adherenceClamped = Math.max(0, Math.min(100, adherence));

  return (
    <div className="phone-scroll fade-up" style={{ height: '100%', overflowY: 'auto', paddingBottom: 110 }}>
      <div style={{ height: 16 }} />

      <PageHeader
        title="Budget"
        subtitle="The allocation matrix"
        trailing={
          <div style={{ textAlign: 'right' }}>
            <AnimatedRupees value={budget.income} style={{ fontSize: 17, fontWeight: 700, color: 'var(--green)', letterSpacing: -0.3, display: 'block' }} />
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.2, textTransform: 'uppercase' }}>Monthly Income</div>
          </div>
        }
      />

      {/* 50/30/20 split visualization */}
      <div style={{ padding: '0 16px 12px' }}>
        <Card padding={18}>
          <SectionLabel style={{ marginBottom: 12 }}>50 / 30 / 20 Split</SectionLabel>
          {/* Bar */}
          <div style={{
            display: 'flex', height: 24, borderRadius: 8, overflow: 'hidden',
            background: 'var(--surface-3)', position: 'relative',
          }}>
            <Slice pct={splitPct.needs} color="var(--blue)" label="Needs" />
            <Slice pct={splitPct.wants} color="var(--copper)" label="Wants" />
            <Slice pct={splitPct.savings} color="var(--green)" label="Savings" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, fontWeight: 600, letterSpacing: 0.2 }}>
            <Legend color="var(--blue)"   label="Needs"   actual={Math.round(splitPct.needs * 100)}   target={50} />
            <Legend color="var(--copper)" label="Wants"   actual={Math.round(splitPct.wants * 100)}   target={30} />
            <Legend color="var(--green)"  label="Savings" actual={Math.round(splitPct.savings * 100)} target={20} />
          </div>
        </Card>
      </div>

      {/* Health metrics */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Card padding={14}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.3 }}>Adherence</div>
            <div className="num" style={{ fontSize: 26, fontWeight: 700, color: adherenceClamped > 70 ? 'var(--green)' : 'var(--copper)', letterSpacing: -0.6, marginTop: 4 }}>
              <AnimatedInt value={adherenceClamped} suffix="%" />
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>this month</div>
          </Card>
          <Card padding={14}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.3 }}>Fixed Ratio</div>
            <div className="num" style={{ fontSize: 26, fontWeight: 700, color: fixedCostRatio < 0.55 ? 'var(--green)' : 'var(--clay)', letterSpacing: -0.6, marginTop: 4 }}>
              <AnimatedInt value={Math.round(fixedCostRatio * 100)} suffix="%" />
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>of income</div>
          </Card>
        </div>
      </div>

      {/* Tiers */}
      {tierStats.map((tier, idx) => (
        <TierBlock key={tier.key} tier={tier} idx={idx + 1}
          onEditCategory={(c) => onEditCategory(c, tier.key)}
          onAddCategory={() => onAddCategory(tier.key)}
          onTogglePaid={onTogglePaid}
        />
      ))}
    </div>
  );
}

function Slice({ pct, color, label }: { pct: number, color: string, label: string }) {
  if (pct <= 0) return null;
  return (
    <div title={label} style={{
      width: (pct * 100) + '%', background: color, height: '100%',
      position: 'relative', minWidth: 2,
      transition: 'width 400ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    }} />
  );
}

function Legend({ color, label, actual, target }: { color: string, label: string, actual: number, target: number }) {
  const ok = Math.abs(actual - target) <= 5;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 7, height: 7, borderRadius: 2, background: color }} />
      <span style={{ color: 'var(--ink-2)' }}>{label}</span>
      <span className="num" style={{ color: ok ? 'var(--green)' : 'var(--copper)', fontWeight: 700 }}>{actual}%</span>
    </div>
  );
}

interface TierBlockProps {
  tier: {
    key: string;
    label: string;
    limit: number;
    spent: number;
    categories: BudgetCategory[];
  };
  idx: number;
  onEditCategory: (c: BudgetCategory) => void;
  onAddCategory: () => void;
  onTogglePaid: (id: string) => void;
}

function TierBlock({ tier, idx, onEditCategory, onAddCategory, onTogglePaid }: TierBlockProps) {
  const tierLabel = ({ 1: 'Tier I', 2: 'Tier II', 3: 'Tier III' } as Record<number, string>)[idx];
  const isFixed = tier.key === 'needs';

  // For fixed tier, "spent" is the sum of paid bill amounts
  const fixedPaidSum = isFixed
    ? tier.categories.filter(c => c.paid).reduce((a, c) => a + c.limit, 0)
    : tier.spent;
  const totalAmt = tier.limit;
  const displaySpent = isFixed ? fixedPaidSum : tier.spent;

  return (
    <div style={{ padding: '8px 16px 0' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '12px 4px 8px',
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: 0.6, textTransform: 'uppercase' }}>{tierLabel}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3, marginTop: 1 }}>{tier.label}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="num" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)' }}>
            <AnimatedRupees value={displaySpent} /> <span style={{ color: 'var(--ink-4)' }}>/ {fmtINR(totalAmt)}</span>
          </div>
          <span className="press" onClick={onAddCategory} style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '5px 9px 5px 7px', borderRadius: 8,
            background: 'var(--copper-tint)', color: 'var(--copper)',
            fontSize: 12, fontWeight: 700, letterSpacing: -0.1,
          }}>
            <LucideIcon name="plus" size={13} stroke={2.4} />
            New
          </span>
        </div>
      </div>

      <Card padding={0}>
        {tier.categories.map((c, i) => (
          isFixed
            ? <BillRow key={c.id} cat={c} onEdit={() => onEditCategory(c)} onTogglePaid={() => onTogglePaid(c.id)} isLast={i === tier.categories.length - 1} />
            : <CategoryRow key={c.id} cat={c} onEdit={() => onEditCategory(c)} isLast={i === tier.categories.length - 1} />
        ))}
        {tier.categories.length === 0 && (
          <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
            No categories yet. Tap <strong style={{ color: 'var(--copper)' }}>+ New</strong> to add one.
          </div>
        )}
      </Card>
    </div>
  );
}

function CategoryRow({ cat, onEdit, isLast }: { cat: BudgetCategory, onEdit: () => void, isLast: boolean }) {
  const pct = cat.limit > 0 ? cat.spent / cat.limit : 0;
  const over = pct > 1;
  return (
    <div onClick={onEdit} className="press" style={{
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : '0.5px solid var(--divider)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <CategoryTile name={cat.name} icon={cat.icon} color={cat.color} size={32} />
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{cat.name}</div>
        <div className="num" style={{ fontSize: 14, fontWeight: 600, color: over ? 'var(--clay)' : 'var(--ink)' }}>
          {fmtINR(cat.spent)}
          <span style={{ color: 'var(--ink-4)', fontWeight: 500 }}> / {fmtINR(cat.limit)}</span>
        </div>
      </div>
      <ProgressBar value={cat.spent} max={cat.limit} color="green" height={5} />
      {over && (
        <div style={{
          fontSize: 11, fontWeight: 600, color: 'var(--clay)',
          marginTop: 6, display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <LucideIcon name="alert" size={11} /> {fmtINR(cat.spent - cat.limit)} over
        </div>
      )}
    </div>
  );
}

function formatFrequency(cat: BudgetCategory) {
  if (!cat.frequency) return '';
  if (cat.frequency === 'monthly') return 'Every month';
  return '';
}

function BillRow({ cat, onEdit, onTogglePaid, isLast }: { cat: BudgetCategory, onEdit: () => void, onTogglePaid: () => void, isLast: boolean }) {
  const paid = !!cat.paid;
  const freqLabel = formatFrequency(cat);

  return (
    <div className="press" onClick={onEdit} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : '0.5px solid var(--divider)',
    }}>
      <CategoryTile name={cat.name} icon={cat.icon} color={cat.color} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 600, color: 'var(--ink)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{cat.name}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>{freqLabel}</span>
          {cat.due && (
            <>
              <span style={{ opacity: 0.5 }}>·</span>
              <span style={{ color: paid ? 'var(--ink-3)' : 'var(--amber)', fontWeight: paid ? 500 : 600 }}>
                {paid ? 'Paid ' + cat.due : 'Due ' + cat.due}
              </span>
            </>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="num" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
          {fmtINR(cat.limit)}
        </div>
        <div
          className="press"
          onClick={(e) => { e.stopPropagation(); onTogglePaid(); }}
          style={{
            marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 8px 3px 6px', borderRadius: 6,
            background: paid ? 'var(--green-tint)' : 'var(--surface-3)',
            color: paid ? 'var(--green)' : 'var(--ink-3)',
            fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
          <LucideIcon name={paid ? 'check' : 'clock'} size={10} stroke={2.6} />
          {paid ? 'Paid' : 'Unpaid'}
        </div>
      </div>
    </div>
  );
}
