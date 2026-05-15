import React, { useState, useEffect, useRef } from 'react';
import { LucideIcon } from './LucideIcon';
import { fmtINR, CATEGORY_META, currencySymbol } from '../data';

// ─────────────────────────────────────────────────────────────
// AnimatedNumber — liquid spring transitions on value change
// ─────────────────────────────────────────────────────────────
interface SpringOpts {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export function useSpringValue(target: number, opts: SpringOpts = {}) {
  const { stiffness = 170, damping = 26, mass = 1 } = opts;
  const [val, setVal] = useState(target);
  const ref = useRef({ v: target, vel: 0, target });

  useEffect(() => {
    ref.current.target = target;
    let raf: number;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.064);
      last = now;
      const s = ref.current;
      const f = -stiffness * (s.v - s.target);
      const d = -damping * s.vel;
      const a = (f + d) / mass;
      s.vel += a * dt;
      s.v += s.vel * dt;
      if (Math.abs(s.vel) < 0.5 && Math.abs(s.v - s.target) < 0.5) {
        s.v = s.target;
        s.vel = 0;
        setVal(s.target);
        return;
      }
      setVal(s.v);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, stiffness, damping, mass]);

  return val;
}

interface AnimatedRupeesProps {
  value: number;
  sign?: boolean;
  className?: string;
  style?: React.CSSProperties;
  prefix?: string;
  decimals?: number;
}

export const AnimatedRupees: React.FC<AnimatedRupeesProps> = ({ value, sign = false, className = '', style = {}, prefix, decimals }) => {
  const v = useSpringValue(value);
  let display = fmtINR(v, { sign, decimals });
  if (prefix != null) {
    const sym = currencySymbol();
    // strip current symbol (and any +/− sign before it) and prepend prefix
    display = display.replace(sym, '');
    display = prefix + display;
  }
  return <span className={'num ' + className} style={style}>{display}</span>;
}

interface AnimatedIntProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
  suffix?: string;
}

export const AnimatedInt: React.FC<AnimatedIntProps> = ({ value, className = '', style = {}, suffix = '' }) => {
  const v = useSpringValue(value);
  return <span className={'num ' + className} style={style}>{Math.round(v).toLocaleString('en-IN')}{suffix}</span>;
}

// ─────────────────────────────────────────────────────────────
// Card — Apple Wallet/Health style surface
// ─────────────────────────────────────────────────────────────
interface CardProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  padding?: number | string;
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, style = {}, padding = 16, onClick, className = '' }) => {
  return (
    <div onClick={onClick} className={className + (onClick ? ' press' : '')} style={{
      background: 'var(--surface)',
      borderRadius: 22,
      padding,
      boxShadow: 'var(--shadow-card)',
      ...style,
    }}>{children}</div>
  );
}

// Section header (small caps)
interface SectionLabelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  action?: React.ReactNode;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ children, style = {}, action }) => {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '0 4px', marginBottom: 8, ...style,
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, letterSpacing: 0.4,
        textTransform: 'uppercase', color: 'var(--ink-3)',
      }}>{children}</div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ProgressBar — animated, color states
// ─────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'copper' | 'green' | 'amber' | 'clay' | 'blue' | 'plum';
  height?: number;
  showOver?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, color = 'copper', height = 8, showOver = true }) => {
  const ratio = max > 0 ? value / max : 0;
  const animated = useSpringValue(Math.min(ratio, 1) * 100, { stiffness: 120, damping: 22 });
  const over = ratio > 1;
  const state = ratio > 1 ? 'clay' : ratio > 0.85 ? 'amber' : color;
  const colorVar = {
    copper: 'var(--copper)',
    green: 'var(--green)',
    amber: 'var(--amber)',
    clay: 'var(--clay)',
    blue: 'var(--blue)',
    plum: 'var(--plum)',
  }[state] || 'var(--copper)';

  return (
    <div style={{
      position: 'relative', height, borderRadius: height, overflow: 'hidden',
      background: 'var(--surface-3)',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: animated + '%', background: colorVar,
        borderRadius: height, transition: 'background 200ms',
      }} />
      {over && showOver && (
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '8%',
          background: 'repeating-linear-gradient(45deg, var(--clay), var(--clay) 3px, transparent 3px, transparent 6px)',
          opacity: 0.6,
        }} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Category icon — colored tile
// ─────────────────────────────────────────────────────────────
interface CategoryTileProps {
  name: string;
  icon?: string;
  color?: string;
  size?: number;
  radius?: number;
}

export const CategoryTile: React.FC<CategoryTileProps> = ({ name, icon, color, size = 36, radius }) => {
  const meta = (icon || color)
    ? { icon: icon || 'tag', color: color || 'plum' }
    : (CATEGORY_META[name] || { icon: 'tag', color: 'plum' });
  const colorMap: Record<string, [string, string]> = {
    green: ['var(--green)', 'var(--green-tint)'],
    blue: ['var(--blue)', 'var(--blue-tint)'],
    amber: ['var(--amber)', 'var(--amber-tint)'],
    copper: ['var(--copper)', 'var(--copper-tint)'],
    plum: ['var(--plum)', 'var(--plum-tint)'],
    clay: ['var(--clay)', 'var(--clay-tint)'],
  };
  const [fg, bg] = colorMap[meta.color] || colorMap.plum;
  return (
    <div style={{
      width: size, height: size, borderRadius: radius ?? size * 0.28,
      background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <LucideIcon name={meta.icon} size={size * 0.5} stroke={1.8} />
    </div>
  );
}

// Curated icon set for the category picker — covers transactions + bills.
export const CATEGORY_ICON_CHOICES = [
  'shopping-bag', 'shopping-cart', 'utensils', 'coffee',
  'car', 'home', 'zap', 'wifi',
  'phone', 'dumbbell', 'receipt', 'repeat',
  'briefcase', 'trending-up', 'shield', 'star',
  'palette', 'film', 'gift', 'wallet',
  'sparkles', 'flame', 'bell', 'sun',
  'moon', 'clock', 'compass', 'mic',
  'image', 'list', 'eye', 'tag',
];

export const CATEGORY_COLOR_CHOICES = ['copper', 'green', 'blue', 'amber', 'plum', 'clay'];

// ─────────────────────────────────────────────────────────────
// Tab Bar — bottom nav with glass blur
// ─────────────────────────────────────────────────────────────
interface TabBarProps {
  active: string;
  onChange: (id: string) => void;
  dark?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({ active, onChange, dark }) => {
  const tabs = [
    { id: 'dashboard', label: 'Today', icon: 'wallet' },
    { id: 'budget', label: 'Budget', icon: 'list' },
    { id: 'insights', label: 'Insights', icon: 'compass' },
    { id: 'wishlist', label: 'Wishlist', icon: 'gift' },
    { id: 'transactions', label: 'Ledger', icon: 'clock' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 16,
      borderRadius: 30, overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
      zIndex: 30,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        background: dark ? 'rgba(28,25,22,0.78)' : 'rgba(255,255,255,0.78)',
        border: dark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.04)',
        borderRadius: 30,
      }} />
      <div style={{
        position: 'relative', display: 'flex', justifyContent: 'space-around',
        padding: '10px 8px 14px',
      }}>
        {tabs.map(t => {
          const isActive = active === t.id;
          return (
            <div key={t.id} onClick={() => onChange(t.id)} className="press" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '4px 10px',
              color: isActive ? 'var(--copper)' : 'var(--ink-3)',
            }}>
              <LucideIcon name={t.icon} size={24} stroke={isActive ? 2.0 : 1.6} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, letterSpacing: 0.1 }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FAB — floating action button (above tab bar)
// ─────────────────────────────────────────────────────────────
interface FABProps {
  onClick: () => void;
}

export const FAB: React.FC<FABProps> = ({ onClick }) => {
  return (
    <div onClick={onClick} className="press" style={{
      position: 'absolute', right: 18, bottom: 96,
      width: 56, height: 56, borderRadius: 28,
      background: 'var(--copper)',
      boxShadow: 'var(--shadow-fab)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', zIndex: 25,
    }}>
      <LucideIcon name="plus" size={26} stroke={2.5} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LiveBanner — alert bar at top of dashboard
// ─────────────────────────────────────────────────────────────
interface Alert {
  tone: 'warn' | 'info' | 'pos';
  text: string;
}

interface LiveBannerProps {
  alerts: Alert[];
  onDismiss?: () => void;
}

export const LiveBanner: React.FC<LiveBannerProps> = ({ alerts }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (alerts.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % alerts.length), 5200);
    return () => clearInterval(t);
  }, [alerts.length]);
  if (!alerts.length) return null;
  const a = alerts[idx % alerts.length];
  const tones: Record<string, { bg: string, fg: string, dot: string }> = {
    warn: { bg: 'var(--clay-tint)', fg: 'var(--clay)', dot: 'var(--clay)' },
    info: { bg: 'var(--blue-tint)', fg: 'var(--blue)', dot: 'var(--blue)' },
    pos:  { bg: 'var(--green-tint)', fg: 'var(--green)', dot: 'var(--green)' },
  };
  const tone = tones[a.tone] || tones.info;
  return (
    <div style={{
      margin: '0 16px', padding: '10px 14px',
      borderRadius: 16, background: tone.bg, color: tone.fg,
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 13, fontWeight: 500, letterSpacing: -0.1,
      minHeight: 56, boxSizing: 'border-box',
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: 3, background: tone.dot,
        boxShadow: '0 0 0 4px ' + tone.bg, flexShrink: 0,
      }} />
      <div style={{ flex: 1, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.text}</div>
      {alerts.length > 1 && (
        <div style={{ display: 'flex', gap: 3 }}>
          {alerts.map((_, i) => (
            <div key={i} style={{
              width: 4, height: 4, borderRadius: 2,
              background: i === idx ? tone.fg : tone.fg,
              opacity: i === idx ? 1 : 0.3,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Segmented Control
// ─────────────────────────────────────────────────────────────
interface SegmentedOption {
  label: string;
  value: string;
}

interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
}

export const Segmented: React.FC<SegmentedProps> = ({ options, value, onChange, fullWidth = false }) => {
  return (
    <div style={{
      display: 'inline-flex', padding: 3, borderRadius: 11,
      background: 'var(--surface-3)', position: 'relative',
      width: fullWidth ? '100%' : 'auto',
    }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <div key={o.value} onClick={() => onChange(o.value)} className="press" style={{
            flex: fullWidth ? 1 : 'none',
            padding: '7px 14px', fontSize: 13, fontWeight: 600,
            letterSpacing: -0.1, color: active ? 'var(--ink)' : 'var(--ink-2)',
            background: active ? 'var(--surface)' : 'transparent',
            borderRadius: 9, textAlign: 'center',
            boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)' : 'none',
            transition: 'all 200ms ease',
          }}>{o.label}</div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BottomSheet — Apple-style modal
// ─────────────────────────────────────────────────────────────
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  height?: string | number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ open, onClose, children, title, footer, height = 'auto' }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <div onClick={onClose} className="sheet-bg-in" style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
      }} />
      <div className="sheet-up" style={{
        position: 'relative', background: 'var(--bg)',
        borderRadius: '24px 24px 0 0', maxHeight: '88%',
        height,
        display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-modal)',
      }}>
        <div style={{
          width: 36, height: 5, background: 'var(--ink-4)', opacity: 0.5,
          borderRadius: 3, margin: '8px auto 0', flexShrink: 0,
        }} />
        {title && (
          <div style={{
            padding: '14px 20px 6px',
            fontSize: 17, fontWeight: 600, textAlign: 'center',
            color: 'var(--ink)', flexShrink: 0,
          }}>{title}</div>
        )}
        <div className="phone-scroll" style={{
          flex: 1, overflow: 'auto', padding: '8px 20px 20px',
        }}>{children}</div>
        {footer && (
          <div style={{
            padding: '12px 20px 24px', borderTop: '0.5px solid var(--divider)',
            flexShrink: 0,
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PrimaryButton
// ─────────────────────────────────────────────────────────────
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'copper' | 'ghost' | 'clay';
  fullWidth?: boolean;
  icon?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, onClick, disabled, variant = 'primary', fullWidth = true, icon }) => {
  const styles: Record<string, { bg: string, fg: string }> = {
    primary: { bg: 'var(--ink)', fg: 'var(--bg)' },
    copper:  { bg: 'var(--copper)', fg: 'white' },
    ghost:   { bg: 'var(--surface-3)', fg: 'var(--ink)' },
    clay:    { bg: 'var(--clay-tint)', fg: 'var(--clay)' },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button onClick={onClick} disabled={disabled} className="press" style={{
      width: fullWidth ? '100%' : 'auto',
      padding: '14px 18px', border: 'none', borderRadius: 14,
      background: s.bg, color: s.fg,
      fontFamily: 'inherit', fontSize: 16, fontWeight: 600,
      letterSpacing: -0.2, opacity: disabled ? 0.5 : 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      {icon && <LucideIcon name={icon} size={18} stroke={2.2} />}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// PageHeader — large title + optional subtitle
// ─────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, trailing }) => {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      padding: '8px 20px 12px',
    }}>
      <div>
        {subtitle && (
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-3)', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 2 }}>{subtitle}</div>
        )}
        <div style={{
          fontSize: 34, fontWeight: 700, letterSpacing: -0.8,
          color: 'var(--ink)', lineHeight: 1.05,
        }}>{title}</div>
      </div>
      {trailing}
    </div>
  );
}
