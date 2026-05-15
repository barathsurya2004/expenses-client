import React, { useState } from 'react';
import { LucideIcon } from '../components/LucideIcon';
import { Card, PrimaryButton } from '../components/Common';

interface LoginScreenProps {
  onSignIn: (user: { name: string, email: string }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSignIn }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showEmail, setShowEmail] = useState(false);

  const canContinue = name.trim().length > 0;

  const submit = () => {
    if (!canContinue) return;
    onSignIn({ name: name.trim(), email: email.trim() });
  };

  return (
    <div className="phone-scroll fade-up" style={{
      height: '100%', overflowY: 'auto', overflowX: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* Status spacer */}
      <div style={{ height: 16 }} />

      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 28px', textAlign: 'center', gap: 18,
      }}>
        {/* Brand mark — copper coin */}
        <div style={{
          width: 88, height: 88, borderRadius: 28,
          background: 'linear-gradient(155deg, var(--copper) 0%, var(--copper-soft) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', boxShadow: 'var(--shadow-fab)',
          marginBottom: 6,
        }}>
          <LucideIcon name="wallet" size={42} stroke={1.6} />
        </div>

        <div>
          <div style={{
            fontSize: 12, fontWeight: 600, letterSpacing: 1.2,
            textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8,
          }}>A quiet money app</div>
          <div style={{
            fontSize: 40, fontWeight: 700, letterSpacing: -1.2,
            color: 'var(--ink)', lineHeight: 1.0,
          }}>Welcome.</div>
          <div style={{
            fontSize: 16, fontWeight: 500, color: 'var(--ink-2)',
            marginTop: 14, lineHeight: 1.45, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Tell us your name so we can greet you properly.
            <br />Everything stays on this device.
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div style={{ padding: '0 22px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card padding={0}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '16px 18px',
          }}>
            <LucideIcon name="pencil" size={18} style={{ color: 'var(--ink-3)' }} />
            <input value={name} onChange={e => setName(e.target.value)}
                   placeholder="Your name"
                   autoFocus
                   onKeyDown={e => e.key === 'Enter' && submit()}
                   style={{
                     flex: 1, border: 'none', outline: 'none', background: 'transparent',
                     fontFamily: 'inherit', fontSize: 17, fontWeight: 500, color: 'var(--ink)',
                   }} />
          </div>
          {showEmail && (
            <>
              <div style={{ height: 0.5, background: 'var(--divider)', marginLeft: 18 }} />
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '16px 18px',
              }}>
                <LucideIcon name="bell" size={18} style={{ color: 'var(--ink-3)' }} />
                <input value={email} onChange={e => setEmail(e.target.value)}
                       placeholder="Email (optional)"
                       type="email"
                       onKeyDown={e => e.key === 'Enter' && submit()}
                       style={{
                         flex: 1, border: 'none', outline: 'none', background: 'transparent',
                         fontFamily: 'inherit', fontSize: 16, fontWeight: 500, color: 'var(--ink)',
                       }} />
              </div>
            </>
          )}
        </Card>

        {!showEmail && (
          <div onClick={() => setShowEmail(true)} className="press" style={{
            textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--ink-3)',
            padding: '4px 0',
          }}>
            Add an email for backups
          </div>
        )}

        <div style={{ height: 6 }} />

        <PrimaryButton variant="copper" onClick={submit} disabled={!canContinue} icon="arrow-right">
          Continue
        </PrimaryButton>

        <div style={{
          marginTop: 4, textAlign: 'center', fontSize: 11,
          color: 'var(--ink-4)', fontWeight: 500, letterSpacing: 0.2,
          lineHeight: 1.5, padding: '0 16px',
        }}>
          By continuing you agree to keep your financial life
          <br />honest, curious, and a little kinder to yourself.
        </div>
      </div>

      {/* Home indicator spacer */}
      <div style={{ height: 30 }} />
    </div>
  );
}
