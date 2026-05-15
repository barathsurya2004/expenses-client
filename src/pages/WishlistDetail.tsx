import React, { useMemo } from 'react';
import type { WishlistItem } from '../types';
import { LucideIcon } from '../components/LucideIcon';
import { Card, SectionLabel, ProgressBar, AnimatedRupees, AnimatedInt } from '../components/Common';
import { fmtINR, PRIORITY_COLORS } from '../data';

interface WishlistDetailProps {
  item: WishlistItem;
  state: {
    wishlist: WishlistItem[];
    unallocated: number;
  };
  onBack: () => void;
  onEdit: () => void;
  onAdjustAllocation: (id: string, value: number) => void;
  onAllocate: () => void;
}

export const WishlistDetail: React.FC<WishlistDetailProps> = ({ item, state, onBack, onEdit, onAdjustAllocation, onAllocate }) => {
  if (!item) return null;

  const pct = item.price > 0 ? Math.min(1, item.saved / item.price) : 0;
  const remaining = Math.max(0, item.price - item.saved);
  const funded = item.saved >= item.price;
  const months = funded ? 0 : (item.allocation > 0 ? Math.ceil(remaining / item.allocation) : 0);
  const weeks = funded ? 0 : Math.ceil(remaining / (item.allocation / 4.3));

  const eta = funded
    ? 'Fully funded'
    : months <= 1
      ? (weeks <= 1 ? 'days away' : weeks + ' weeks away')
      : months + ' months away';

  const etaDate = useMemo(() => {
    if (funded) return null;
    const d = new Date();
    d.setDate(d.getDate() + months * 30);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [funded, months]);

  const priorityColor = PRIORITY_COLORS[item.priority];

  const totalAllocation = state.wishlist.reduce((a, w) => a + (w.allocation || 0), 0);
  const allocPct = totalAllocation > 0 ? item.allocation / totalAllocation * 100 : 0;

  return (
    <div className="phone-scroll fade-up" style={{
      height: '100%', overflowY: 'auto', overflowX: 'hidden',
      paddingBottom: 130, background: 'var(--bg)',
    }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden' }}>
        <img src={item.image} alt={item.name}
             style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(180deg, transparent 0%, var(--bg) 100%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute', top: 16, left: 16, right: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5,
        }}>
          <GlassButton onClick={onBack} icon="chevron-left" />
          <div style={{ display: 'flex', gap: 8 }}>
            <GlassButton onClick={onEdit} label="Edit" icon="pencil" />
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: 24, left: 20,
          padding: '5px 11px', borderRadius: 8,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          color: 'white',
          fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
        }}>
          {item.priority} priority
        </div>
      </div>

      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>
          {item.brand} {item.category && '· ' + item.category}
        </div>
        <div style={{
          fontSize: 28, fontWeight: 700, color: 'var(--ink)',
          letterSpacing: -0.6, marginTop: 4, lineHeight: 1.1,
        }}>{item.name}</div>
        {item.notes && (
          <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.45 }}>
            {item.notes}
          </div>
        )}
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        <Card padding={22} style={{
          background: 'linear-gradient(165deg, var(--surface) 0%, var(--surface-2) 100%)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {funded ? 'Funded' : 'Saved so far'}
              </div>
              <AnimatedRupees value={item.saved} style={{
                fontSize: 44, fontWeight: 700, letterSpacing: -1.4, color: 'var(--ink)',
                lineHeight: 1, marginTop: 4, display: 'block',
              }} />
              <div className="num" style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6 }}>
                of {fmtINR(item.price)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <AnimatedInt value={Math.round(pct * 100)} suffix="%"
                style={{ fontSize: 34, fontWeight: 700, color: 'var(--copper)', letterSpacing: -0.8, lineHeight: 1, display: 'block' }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 4 }}>
                complete
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <ProgressBar value={item.saved} max={item.price} color="copper" height={10} showOver={false} />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 14,
            padding: '10px 12px', borderRadius: 12,
            background: funded ? 'var(--green-tint)' : 'var(--copper-tint)',
            color: funded ? 'var(--green)' : 'var(--copper)',
          }}>
            <LucideIcon name={funded ? 'check' : 'clock'} size={16} stroke={2} />
            <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
              {funded ? 'Ready to buy' : eta}
              {etaDate && !funded && (
                <span style={{ fontWeight: 500, opacity: 0.75 }}> · target {etaDate}</span>
              )}
            </div>
            {!funded && (
              <div className="num" style={{ fontSize: 13, fontWeight: 700 }}>
                {fmtINR(remaining)} left
              </div>
            )}
          </div>
        </Card>
      </div>

      {!funded && (
        <div style={{ padding: '12px 16px 0' }}>
          <div onClick={onAllocate} className="press" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', borderRadius: 16,
            background: state.unallocated > 0 ? 'var(--copper)' : 'var(--surface)',
            color: state.unallocated > 0 ? '#fff' : 'var(--ink-3)',
            boxShadow: state.unallocated > 0 ? 'var(--shadow-card)' : 'none',
            outline: state.unallocated > 0 ? 'none' : '0.5px solid var(--divider)',
            cursor: state.unallocated > 0 ? 'pointer' : 'not-allowed',
            opacity: state.unallocated > 0 ? 1 : 0.7,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: state.unallocated > 0 ? 'rgba(255,255,255,0.2)' : 'var(--surface-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LucideIcon name="plus" size={18} stroke={2.6} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>Allocate now</div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 1 }}>
                {state.unallocated > 0
                  ? <>Push from <span className="num" style={{ fontWeight: 600 }}>{fmtINR(state.unallocated)}</span> unallocated pool</>
                  : 'No unallocated funds available'}
              </div>
            </div>
            {state.unallocated > 0 && <LucideIcon name="arrow-up-right" size={18} stroke={2.2} />}
          </div>
        </div>
      )}

      <div style={{ padding: '12px 16px 0' }}>
        <SectionLabel>Savings Velocity</SectionLabel>
        <Card padding={20}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
            <AnimatedRupees value={item.allocation} style={{
              fontSize: 30, fontWeight: 700, letterSpacing: -0.8, color: 'var(--ink)',
            }} />
            <span style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 500 }}>/ month allocated</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
            {item.allocation > 0
              ? <>That's <span className="num" style={{ fontWeight: 700 }}>{fmtINR(Math.round(item.allocation / 4.3))}</span> per week, or <span className="num" style={{ fontWeight: 700 }}>{fmtINR(Math.round(item.allocation / 30))}</span> per day.</>
              : 'No active allocation. Funded items keep their saved balance.'}
          </div>

          {!funded && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  Monthly contribution
                </div>
                <div className="num" style={{ fontSize: 12, fontWeight: 600, color: 'var(--copper)' }}>
                  {fmtINR(item.allocation)}
                </div>
              </div>
              <input
                type="range" min={0} max={Math.max(15000, item.allocation * 2)} step={500}
                value={item.allocation}
                onChange={e => onAdjustAllocation(item.id, Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--copper)', height: 4 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--ink-4)', fontWeight: 500 }}>
                <span>{fmtINR(0)}</span>
                <span>{fmtINR(Math.max(15000, item.allocation * 2))}</span>
              </div>
            </div>
          )}

          {totalAllocation > 0 && (
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '0.5px solid var(--divider)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.2, textTransform: 'uppercase' }}>Share of savings</span>
                <span className="num" style={{ fontWeight: 700, color: 'var(--ink)' }}>{Math.round(allocPct)}%</span>
              </div>
              <ProgressBar value={item.allocation} max={totalAllocation} color="copper" height={4} showOver={false} />
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.4 }}>
                Drawn from your <span className="num" style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{fmtINR(totalAllocation)}/mo</span> wishlist pool
              </div>
            </div>
          )}
        </Card>
      </div>

      {!funded && (
        <div style={{ padding: '12px 16px 0' }}>
          <SectionLabel>The Math</SectionLabel>
          <Card padding={0}>
            <DetailRow label="Target price" value={fmtINR(item.price)} bold />
            <Divider2 />
            <DetailRow label="Currently saved" value={fmtINR(item.saved)} valueColor="var(--copper)" />
            <Divider2 />
            <DetailRow label="Still need" value={fmtINR(remaining)} />
            <Divider2 />
            <DetailRow label="Monthly contribution" value={fmtINR(item.allocation) + '/mo'} />
            <Divider2 />
            <DetailRow label="Months remaining" value={months + ' months'} valueColor="var(--copper)" bold />
            <Divider2 />
            <DetailRow label="Estimated ready" value={etaDate || ''} bold />
          </Card>
        </div>
      )}

      <div style={{ padding: '12px 16px 0' }}>
        <Card padding={0}>
          {item.url && (
            <>
              <DetailRow label="Source" value={item.url} valueColor="var(--blue)" icon="link" />
              <Divider2 />
            </>
          )}
          <DetailRow label="Priority" valueNode={
            <div style={{
              padding: '2px 8px', borderRadius: 6,
              background: priorityColor.bg, color: priorityColor.fg,
              fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
            }}>{item.priority}</div>
          } />
          <Divider2 />
          <DetailRow label="Category" value={item.category} />
        </Card>
      </div>
    </div>
  );
}

function GlassButton({ onClick, icon, label }: { onClick: () => void, icon?: string, label?: string }) {
  return (
    <div onClick={onClick} className="press" style={{
      display: 'flex', alignItems: 'center', gap: 6,
      height: 38, padding: label ? '0 14px 0 12px' : '0 11px',
      borderRadius: 19, background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      color: '#1B1813',
    }}>
      {icon && <LucideIcon name={icon} size={16} stroke={2.2} />}
      {label && <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.1 }}>{label}</span>}
    </div>
  );
}

function DetailRow({ label, value, valueNode, valueColor, icon, bold }: { label: string, value?: string, valueNode?: React.ReactNode, valueColor?: string, icon?: string, bold?: boolean }) {
  return (
    <div style={{
      padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 10, minHeight: 50,
    }}>
      <div style={{ fontSize: 14, color: 'var(--ink-2)', fontWeight: 500, flex: 1 }}>{label}</div>
      {valueNode ? valueNode : (
        <div className="num" style={{
          fontSize: 14, fontWeight: bold ? 700 : 600,
          color: valueColor || 'var(--ink)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {icon && <LucideIcon name={icon} size={14} />}
          {value}
        </div>
      )}
    </div>
  );
}

function Divider2() {
  return <div style={{ height: 0.5, background: 'var(--divider)', marginLeft: 18 }} />;
}
