import React, { useState } from 'react';
import { LucideIcon } from '../components/LucideIcon';
import { Card, PageHeader } from '../components/Common';
import { fmtINR, setAppCurrency, getAppCurrency } from '../data';
import type { CurrencyCode } from '../data';

const CURRENCY_LIST = [
  { code: 'INR' as CurrencyCode, label: 'Indian Rupee',  symbol: '₹',   sub: 'INR' },
  { code: 'USD' as CurrencyCode, label: 'US Dollar',     symbol: '$',   sub: 'USD' },
  { code: 'EUR' as CurrencyCode, label: 'Euro',          symbol: '€',   sub: 'EUR' },
  { code: 'GBP' as CurrencyCode, label: 'British Pound', symbol: '£',   sub: 'GBP' },
  { code: 'JPY' as CurrencyCode, label: 'Japanese Yen',  symbol: '¥',   sub: 'JPY' },
  { code: 'AED' as CurrencyCode, label: 'UAE Dirham',    symbol: 'AED', sub: 'AED' },
  { code: 'SGD' as CurrencyCode, label: 'Singapore Dollar', symbol: 'S$', sub: 'SGD' },
];

const ACCENT_OPTIONS = [
  { value: '#C5703B', name: 'Copper'     },
  { value: '#6B8E5A', name: 'Eucalyptus' },
  { value: '#4A6FA5', name: 'Indigo'     },
  { value: '#B85540', name: 'Clay'       },
  { value: '#7E5A8C', name: 'Plum'       },
  { value: '#3F8E7C', name: 'Sea Glass'  },
];

export const PALETTE_OPTIONS = [
  { value: 'sand',    name: 'Warm Sand',   swatches: ['#F4F1EC', '#EBE7DF', '#1B1813'] },
  { value: 'linen',   name: 'Cool Linen',  swatches: ['#F2F3F5', '#E4E7EB', '#171A20'] },
  { value: 'slate',   name: 'Soft Slate',  swatches: ['#EDEEF0', '#DDE0E4', '#1A1D22'] },
  { value: 'paper',   name: 'Bright Paper',swatches: ['#FBFAF7', '#F0EEE8', '#15130F'] },
];

interface SettingsScreenProps {
  user: { name: string, email: string };
  settings: { currency: CurrencyCode, theme: 'light' | 'dark', accent: string, palette: string };
  onUpdate: (patch: any) => void;
  onSignOut: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, settings, onUpdate, onSignOut, onBack }) => {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.name || '');
  const [emailDraft, setEmailDraft] = useState(user.email || '');

  const saveName = () => {
    onUpdate({ user: { ...user, name: nameDraft.trim() || user.name, email: emailDraft.trim() } });
    setEditingName(false);
  };

  return (
    <div className="phone-scroll fade-up" style={{
      height: '100%', overflowY: 'auto', overflowX: 'hidden',
      paddingBottom: 110, background: 'var(--bg)',
    }}>
      {/* Status spacer */}
      <div style={{ height: 16 }} />

      {/* Header with back */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px 4px',
      }}>
        <div onClick={onBack} className="press" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '6px 10px 6px 6px', borderRadius: 10,
          fontSize: 14, fontWeight: 600, color: 'var(--ink-2)',
        }}>
          <LucideIcon name="chevron-left" size={18} stroke={2} />
          Back
        </div>
      </div>

      <PageHeader title="Settings" subtitle="Tune the app to fit you" />

      {/* Profile card */}
      <div style={{ padding: '0 16px 14px' }}>
        <Card padding={0}>
          <div style={{
            padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <Avatar name={user.name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingName ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input value={nameDraft} onChange={e => setNameDraft(e.target.value)}
                         autoFocus
                         placeholder="Your name"
                         style={{
                           border: 'none', outline: 'none', background: 'var(--surface-3)',
                           padding: '8px 10px', borderRadius: 8,
                           fontFamily: 'inherit', fontSize: 16, fontWeight: 600, color: 'var(--ink)',
                         }} />
                  <input value={emailDraft} onChange={e => setEmailDraft(e.target.value)}
                         placeholder="Email (optional)"
                         style={{
                           border: 'none', outline: 'none', background: 'var(--surface-3)',
                           padding: '8px 10px', borderRadius: 8,
                           fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
                         }} />
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3 }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email || 'No email · backups paused'}
                  </div>
                </>
              )}
            </div>
            {editingName ? (
              <div className="press" onClick={saveName} style={{
                padding: '8px 12px', borderRadius: 10,
                background: 'var(--copper)', color: 'white',
                fontSize: 13, fontWeight: 700,
              }}>Save</div>
            ) : (
              <div className="press" onClick={() => { setNameDraft(user.name); setEmailDraft(user.email || ''); setEditingName(true); }} style={{
                padding: '8px 10px', borderRadius: 10,
                background: 'var(--surface-3)', color: 'var(--ink-2)',
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 13, fontWeight: 600,
              }}>
                <LucideIcon name="pencil" size={14} stroke={2} />
                Edit
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Currency */}
      <SettingsSection title="Currency" subtitle="Display amounts in your home currency">
        <Card padding={0}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {CURRENCY_LIST.map((c, i) => {
              const active = settings.currency === c.code;
              return (
                <div key={c.code}
                  onClick={() => onUpdate({ currency: c.code })}
                  className="press"
                  style={{
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    borderBottom: i < CURRENCY_LIST.length - 2 ? '0.5px solid var(--divider)' : 'none',
                    borderRight: i % 2 === 0 ? '0.5px solid var(--divider)' : 'none',
                    background: active ? 'var(--copper-tint)' : 'transparent',
                  }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: active ? 'var(--copper)' : 'var(--surface-3)',
                    color: active ? 'white' : 'var(--ink-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, letterSpacing: -0.3,
                  }}>{c.symbol}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600,
                      color: active ? 'var(--copper)' : 'var(--ink)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{c.sub}</div>
                    <div style={{
                      fontSize: 11, color: 'var(--ink-3)', fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{c.label}</div>
                  </div>
                  {active && <LucideIcon name="check" size={14} stroke={3} style={{ color: 'var(--copper)' }} />}
                </div>
              );
            })}
          </div>
        </Card>
        <PreviewRow currency={settings.currency} />
      </SettingsSection>

      {/* Theme */}
      <SettingsSection title="Theme" subtitle="Light or dark — pick what your eyes prefer">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ThemeCard mode="light"
            active={settings.theme === 'light'}
            onClick={() => onUpdate({ theme: 'light' })} />
          <ThemeCard mode="dark"
            active={settings.theme === 'dark'}
            onClick={() => onUpdate({ theme: 'dark' })} />
        </div>
      </SettingsSection>

      {/* Accent */}
      <SettingsSection title="Accent color" subtitle="Used for highlights and primary actions">
        <Card padding={16}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
            {ACCENT_OPTIONS.map(a => {
              const active = settings.accent === a.value;
              return (
                <div key={a.value} onClick={() => onUpdate({ accent: a.value })} className="press"
                  title={a.name}
                  style={{
                    aspectRatio: '1 / 1', borderRadius: 14,
                    background: a.value, position: 'relative',
                    boxShadow: active
                      ? `0 0 0 2px var(--surface), 0 0 0 4px ${a.value}`
                      : '0 1px 2px rgba(0,0,0,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'box-shadow 200ms',
                  }}>
                  {active && <LucideIcon name="check" size={18} stroke={3} style={{ color: 'white' }} />}
                </div>
              );
            })}
          </div>
          <div style={{
            marginTop: 12, fontSize: 12, color: 'var(--ink-3)', fontWeight: 500,
            textAlign: 'center',
          }}>
            {ACCENT_OPTIONS.find(a => a.value === settings.accent)?.name || 'Custom'}
          </div>
        </Card>
      </SettingsSection>

      {/* Palette */}
      <SettingsSection title="Background palette" subtitle="The undertone of every surface">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {PALETTE_OPTIONS.map(p => {
            const active = settings.palette === p.value;
            return (
              <div key={p.value} onClick={() => onUpdate({ palette: p.value })} className="press" style={{
                padding: 12, borderRadius: 16,
                background: 'var(--surface)', boxShadow: 'var(--shadow-card)',
                outline: active ? '1.5px solid var(--copper)' : 'none',
              }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {p.swatches.map((s, i) => (
                    <div key={i} style={{
                      flex: 1, height: 36, borderRadius: 8, background: s,
                      boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.06)',
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</div>
                  {active && <LucideIcon name="check" size={14} stroke={3} style={{ color: 'var(--copper)' }} />}
                </div>
              </div>
            );
          })}
        </div>
      </SettingsSection>

      {/* Other */}
      <SettingsSection title="Other">
        <Card padding={0}>
          <Row label="App version" trailing={<span style={{ color: 'var(--ink-3)', fontSize: 14 }}>1.0.0 · build 482</span>} />
          <Hr />
          <Row label="Reset to defaults" tone="copper" trailing={<LucideIcon name="chevron-right" size={16} style={{ color: 'var(--ink-4)' }} />}
            onClick={() => onUpdate({ currency: 'INR', theme: 'light', accent: '#C5703B', palette: 'sand' })} />
          <Hr />
          <Row label="Sign out" tone="clay" trailing={<LucideIcon name="chevron-right" size={16} style={{ color: 'var(--ink-4)' }} />}
            onClick={onSignOut} />
        </Card>
      </SettingsSection>

      <div style={{ height: 20 }} />
    </div>
  );
}

function SettingsSection({ title, subtitle, children }: { title: string, subtitle?: string, children: React.ReactNode }) {
  return (
    <div style={{ padding: '6px 16px 18px' }}>
      <div style={{ padding: '6px 4px 10px' }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'var(--ink-3)',
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3, fontWeight: 500 }}>{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = (name || '?').trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('');
  return (
    <div style={{
      width: 52, height: 52, borderRadius: 18,
      background: 'linear-gradient(155deg, var(--copper) 0%, var(--copper-soft) 100%)',
      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, fontWeight: 700, letterSpacing: -0.5, flexShrink: 0,
    }}>{initials || '–'}</div>
  );
}

function ThemeCard({ mode, active, onClick }: { mode: 'light' | 'dark', active: boolean, onClick: () => void }) {
  const isLight = mode === 'light';
  return (
    <div onClick={onClick} className="press" style={{
      padding: 14, borderRadius: 18,
      background: 'var(--surface)', boxShadow: 'var(--shadow-card)',
      outline: active ? '1.5px solid var(--copper)' : 'none',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{
        height: 96, borderRadius: 12, overflow: 'hidden', position: 'relative',
        background: isLight ? '#F4F1EC' : '#0E0C0A',
      }}>
        <div style={{
          position: 'absolute', top: 10, left: 10, right: 10,
          height: 8, borderRadius: 3,
          background: isLight ? 'rgba(27,24,19,0.15)' : 'rgba(244,241,235,0.18)',
          width: '40%',
        }} />
        <div style={{
          position: 'absolute', top: 24, left: 10, right: 10,
          height: 16, borderRadius: 4,
          background: isLight ? '#FFFFFF' : '#1C1916',
          boxShadow: isLight ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
        }} />
        <div style={{
          position: 'absolute', top: 48, left: 10, right: 10,
          height: 32, borderRadius: 8,
          background: isLight ? '#FFFFFF' : '#1C1916',
          display: 'flex', alignItems: 'center', padding: '0 8px',
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: 5,
            background: 'var(--copper)',
          }} />
          <div style={{
            marginLeft: 6, height: 6, flex: 1, borderRadius: 3,
            background: isLight ? 'rgba(27,24,19,0.12)' : 'rgba(244,241,235,0.15)',
          }} />
        </div>
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          color: isLight ? '#C58A3B' : '#F0AE82',
        }}>
          <LucideIcon name={isLight ? 'sun' : 'moon'} size={16} stroke={2} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', textTransform: 'capitalize' }}>{mode}</div>
        {active && <LucideIcon name="check" size={16} stroke={3} style={{ color: 'var(--copper)' }} />}
      </div>
    </div>
  );
}

function PreviewRow({ currency }: { currency: CurrencyCode }) {
  const samples = [125, 12500, 1450000];
  const prev = getAppCurrency();
  setAppCurrency(currency);
  const out = samples.map(n => fmtINR(n));
  setAppCurrency(prev);

  return (
    <div style={{
      marginTop: 10, padding: '12px 16px', borderRadius: 14,
      background: 'var(--surface-2)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'baseline',
    }}>
      {out.map((v, i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <div className="num" style={{
            fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3,
          }}>{v}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', marginTop: 2 }}>
            {['small', 'medium', 'large'][i]}
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({ label, trailing, onClick, tone }: { label: string, trailing?: React.ReactNode, onClick?: () => void, tone?: 'copper' | 'clay' }) {
  const toneMap: Record<string, string> = {
    copper: 'var(--copper)',
    clay: 'var(--clay)',
  };
  return (
    <div onClick={onClick} className={onClick ? 'press' : ''} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px',
      color: tone ? toneMap[tone] : 'var(--ink)',
      fontSize: 15, fontWeight: 600,
    }}>
      <div>{label}</div>
      {trailing}
    </div>
  );
}

function Hr() {
  return <div style={{ height: 0.5, background: 'var(--divider)', marginLeft: 16 }} />;
}
