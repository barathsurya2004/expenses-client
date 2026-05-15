import React, { useMemo } from 'react';
import type { Transaction, WishlistItem, Budget } from '../types';
import { LucideIcon } from '../components/LucideIcon';
import { Card, SectionLabel, ProgressBar, CategoryTile, LiveBanner, AnimatedRupees, AnimatedInt } from '../components/Common';
import { fmtINR, relativeDay } from '../data';

interface DashboardProps {
  state: {
    transactions: Transaction[];
    wishlist: WishlistItem[];
    budget: Budget;
    user: { name: string, email: string, signedIn: boolean };
  };
  setActiveTab: (tab: string) => void;
  onFAB: () => void;
  onEditTxn: (txn: Transaction) => void;
  onOpenWish: (wish: WishlistItem) => void;
  onOpenSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, setActiveTab, onEditTxn, onOpenWish, onOpenSettings }) => {
  const { transactions, wishlist, budget, user } = state;

  // Computations
  const monthSpend = useMemo(() =>
    transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === 4) // May 2026
      .reduce((a, t) => a + t.amount, 0)
  , [transactions]);

  const monthIncome = budget.income;
  const totalBudget = Object.values(budget.tiers)
    .flatMap(t => t.categories)
    .reduce((a, c) => a + c.limit, 0);

  // Days left in month (Today = May 14, May has 31 days)
  const today = 14, daysInMonth = 31;
  const daysLeft = daysInMonth - today;

  const safeToSpend = totalBudget - monthSpend;
  const dailyBurn = daysLeft > 0 ? Math.max(0, safeToSpend / daysLeft) : 0;

  // Alerts
  const alerts: { tone: 'warn' | 'info' | 'pos', text: string }[] = [
    { tone: 'warn', text: 'Dining is 28% above your 6-month average. Pace yourself.' },
    { tone: 'info', text: 'Netflix raised its price ₹50/mo — renews May 22.' },
    { tone: 'pos', text: 'You’re ₹2,400 ahead of plan this week. Nice.' },
  ];

  // Top categories this week
  const weekCats = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type !== 'expense') return;
      const d = new Date(t.date);
      if (d >= new Date('2026-05-08')) {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [transactions]);

  const maxWeekCat = weekCats[0]?.[1] || 1;

  // Closest wishlist
  const nextWish = useMemo(() => {
    return [...wishlist]
      .filter(w => w.saved < w.price)
      .sort((a, b) => {
        const aMonths = (a.price - a.saved) / (a.allocation || 1);
        const bMonths = (b.price - b.saved) / (b.allocation || 1);
        return aMonths - bMonths;
      })[0];
  }, [wishlist]);

  const recent = useMemo(() =>
    [...transactions]
      .filter(t => t.type === 'expense')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  , [transactions]);

  return (
    <div className="phone-scroll fade-up" style={{
      height: '100%', overflowY: 'auto', overflowX: 'hidden',
      paddingBottom: 110,
    }}>
      {/* Status bar spacer */}
      <div style={{ height: 16 }} />

      {/* Live banner */}
      <LiveBanner alerts={alerts} />

      {/* Greeting */}
      <div style={{
        padding: '20px 22px 6px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--ink-3)',
            letterSpacing: 0.4, textTransform: 'uppercase',
          }}>Thursday · May 14</div>
          <div style={{
            fontSize: 28, fontWeight: 700, color: 'var(--ink)',
            letterSpacing: -0.6, marginTop: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>Good morning, {(user?.name || 'friend').split(' ')[0]}</div>
        </div>
        <div onClick={onOpenSettings} className="press" style={{
          width: 38, height: 38, borderRadius: 12,
          background: 'var(--surface)', boxShadow: 'var(--shadow-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-2)', flexShrink: 0,
        }} title="Settings">
          <LucideIcon name="settings" size={20} stroke={1.7} />
        </div>
      </div>

      {/* Macro hero card */}
      <div style={{ padding: '12px 16px 0' }}>
        <Card padding={22} style={{
          background: 'linear-gradient(168deg, var(--surface) 0%, var(--surface-2) 100%)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Safe to Spend</div>
              <AnimatedRupees value={safeToSpend} style={{
                fontSize: 52, fontWeight: 700, letterSpacing: -2.2,
                lineHeight: 1, color: 'var(--ink)', marginTop: 4, display: 'block',
              }} />
            </div>
          </div>

          {/* Daily burn rate */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', borderRadius: 12,
            background: 'var(--copper-tint)',
            color: 'var(--copper)',
          }}>
            <LucideIcon name="flame" size={16} stroke={2} />
            <div style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>
              <AnimatedRupees value={dailyBurn} style={{ fontWeight: 700 }} /> / day for {daysLeft} more days
            </div>
          </div>

          {/* Progress bar of month spend */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
              <span style={{ color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.2 }}>SPENT THIS MONTH</span>
              <span className="num" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>
                <AnimatedRupees value={monthSpend} /> / {fmtINR(totalBudget)}
              </span>
            </div>
            <ProgressBar value={monthSpend} max={totalBudget} color="copper" height={6} />
          </div>
        </Card>
      </div>

      {/* Bento grid */}
      <div style={{ padding: '12px 16px 0' }}>
        <SectionLabel>Today</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Next Wishlist */}
          {nextWish && (
            <Card padding={0} onClick={() => onOpenWish(nextWish)} style={{ aspectRatio: '1 / 1', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {/* Top: image */}
              <div style={{ position: 'relative', flex: 1, minHeight: 0, background: 'var(--surface-3)' }}>
                {nextWish.image && (
                  <img src={nextWish.image} alt={nextWish.name}
                       style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  padding: '3px 8px', borderRadius: 6,
                  background: 'rgba(0,0,0,0.55)',
                  backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                  color: 'white', fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
                }}>Next up</div>
                <div style={{ position: 'absolute', top: 8, right: 8, color: 'white' }}>
                  <LucideIcon name="arrow-up-right" size={16} stroke={2.4} />
                </div>
              </div>
              {/* Bottom: meta */}
              <div style={{ padding: '10px 12px 12px', background: 'var(--surface)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nextWish.name}</div>
                <ProgressBar value={nextWish.saved} max={nextWish.price} color="copper" height={4} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, fontWeight: 600 }}>
                  <span className="num" style={{ color: 'var(--copper)' }}>{Math.round(nextWish.saved / nextWish.price * 100)}%</span>
                  <span className="num" style={{ color: 'var(--ink-3)' }}>{(() => {
                    const remaining = nextWish.price - nextWish.saved;
                    const months = nextWish.allocation > 0 ? Math.ceil(remaining / nextWish.allocation) : 99;
                    return months <= 1 ? '< 1 mo' : months + ' mo';
                  })()}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Top Categories Heatmap */}
          <Card padding={14} onClick={() => setActiveTab('budget')} style={{ aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.3 }}>Top this week</div>
              <LucideIcon name="arrow-up-right" size={16} style={{ color: 'var(--ink-4)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
              {weekCats.map(([cat, amt]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{cat}</span>
                    <span className="num" style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)' }}>{fmtINR(amt)}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: (amt / maxWeekCat * 100) + '%',
                      background: 'var(--copper)', borderRadius: 2,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ padding: '20px 16px 0' }}>
        <SectionLabel action={
          <span className="press" onClick={() => setActiveTab('transactions')} style={{
            fontSize: 13, fontWeight: 600, color: 'var(--copper)',
          }}>See all</span>
        }>Recent Activity</SectionLabel>
        <Card padding={0}>
          {recent.map((t, i) => (
            <div key={t.id} onClick={() => onEditTxn(t)} className="press" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              borderBottom: i < recent.length - 1 ? '0.5px solid var(--divider)' : 'none',
            }}>
              <CategoryTile name={t.category} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.merchant}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>
                  {t.category} · {relativeDay(t.date)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="num" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                  −{fmtINR(t.amount)}
                </div>
                {t.status === 'pending' && (
                  <div style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600, marginTop: 1 }}>Pending</div>
                )}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Quick stats row */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Card padding={14} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)', letterSpacing: -0.5 }} className="num">
              <AnimatedInt value={Math.round(monthIncome / 1000)} suffix="K" />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 4 }}>Income</div>
          </Card>
          <Card padding={14} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--copper)', letterSpacing: -0.5 }} className="num">
              <AnimatedInt value={Math.round(monthSpend / 1000)} suffix="K" />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 4 }}>Spent</div>
          </Card>
          <Card padding={14} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--blue)', letterSpacing: -0.5 }} className="num">
              <AnimatedInt value={Math.round((monthIncome - monthSpend) / 1000)} suffix="K" />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 4 }}>Saved</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
