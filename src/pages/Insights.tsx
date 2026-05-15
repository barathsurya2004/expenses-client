import React, { useState } from 'react';
import type { Budget, Transaction, Subscription } from '../types';
import { LucideIcon } from '../components/LucideIcon';
import { Card, ProgressBar, PageHeader, AnimatedRupees, AnimatedInt, Segmented } from '../components/Common';
import { fmtINR, SEED_SUBSCRIPTIONS, SEED_HISTORY } from '../data';

interface InsightsProps {
  state: {
    budget: Budget;
    transactions: Transaction[];
  };
}

export const Insights: React.FC<InsightsProps> = ({ state }) => {
  const [view, setView] = useState('overview');

  return (
    <div className="phone-scroll fade-up" style={{ height: '100%', overflowY: 'auto', paddingBottom: 110 }}>
      <div style={{ height: 16 }} />
      <PageHeader title="Insights" subtitle="The predictive co-pilot" />

      <div style={{ padding: '0 16px 14px' }}>
        <Segmented
          fullWidth
          value={view}
          onChange={setView}
          options={[
            { value: 'overview', label: 'Overview' },
            { value: 'trends', label: 'Trends' },
            { value: 'whatif', label: 'What-If' },
          ]}
        />
      </div>

      {view === 'overview' && <OverviewView state={state} />}
      {view === 'trends' && <TrendsView />}
      {view === 'whatif' && <WhatIfView state={state} />}
    </div>
  );
}

function OverviewView({ state }: { state: { budget: Budget } }) {
  const { budget } = state;
  const liquidSavings = 384000; // mock
  const fixedMonthly = budget.tiers.needs.categories.reduce((a, c) => a + c.limit, 0);
  const runwayMonths = fixedMonthly > 0 ? liquidSavings / fixedMonthly : 99;

  // Zero-Day predictor
  const wants = budget.tiers.wants.categories;
  const wantsLimit = wants.reduce((a, c) => a + c.limit, 0);
  const wantsSpent = wants.reduce((a, c) => a + c.spent, 0);
  const daysElapsed = 14;
  const dailyDiscretionary = wantsSpent / daysElapsed;
  const remainingDiscretionary = Math.max(0, wantsLimit - wantsSpent);
  const zeroDayInDays = dailyDiscretionary > 0 ? Math.round(remainingDiscretionary / dailyDiscretionary) : 99;
  const zeroDayDate = new Date('2026-05-14');
  zeroDayDate.setDate(zeroDayDate.getDate() + zeroDayInDays);

  // Opportunity cost
  const monthlyCoffee = 1900;
  const yearly = monthlyCoffee * 12;
  const tenYearCompound = yearly * (Math.pow(1.10, 10) - 1) / 0.10;

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px' }}>
      <Card padding={20} style={{
        background: 'linear-gradient(165deg, var(--surface) 0%, var(--surface-2) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <LucideIcon name="shield" size={16} style={{ color: 'var(--green)' }} stroke={2} />
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Emergency Runway</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <AnimatedRupees value={runwayMonths} decimals={1} prefix=""
            style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1.8, color: 'var(--ink)', lineHeight: 1 }} />
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-3)' }}>months</div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6 }}>
          of survival at <span className="num" style={{ fontWeight: 600 }}>{fmtINR(fixedMonthly)}</span>/month fixed costs
        </div>
      </Card>

      <Card padding={18}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: 'var(--clay-tint)',
            color: 'var(--clay)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LucideIcon name="alert" size={22} stroke={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Zero-Day Predictor</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginTop: 4, lineHeight: 1.35 }}>
              At current pace, discretionary spend hits zero on{' '}
              <span style={{ color: 'var(--clay)' }}>{zeroDayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span> — <span className="num">{zeroDayInDays} days</span> from today.
            </div>
          </div>
        </div>
      </Card>

      <Card padding={18}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: 'var(--amber-tint)',
            color: 'var(--amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LucideIcon name="coffee" size={22} stroke={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Opportunity Cost</div>
            <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.4 }}>
              Your <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{fmtINR(monthlyCoffee)}/mo</span> coffee habit, invested at 10% over 10 years, would compound to
            </div>
            <div className="num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--copper)', letterSpacing: -0.6, marginTop: 6 }}>
              <AnimatedRupees value={Math.round(tenYearCompound)} />
            </div>
          </div>
        </div>
      </Card>

      <Card padding={0}>
        <div style={{ padding: '16px 16px 8px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Subscription Audit</div>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 2 }}>
            <span className="num" style={{ fontWeight: 600, color: 'var(--ink)' }}>{fmtINR(SEED_SUBSCRIPTIONS.reduce((a, s) => a + s.amount, 0) * 12)}</span> true annual cost
          </div>
        </div>
        {SEED_SUBSCRIPTIONS.map((s: Subscription) => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            borderTop: '0.5px solid var(--divider)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: 'var(--surface-3)',
              color: 'var(--ink-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LucideIcon name="repeat" size={16} stroke={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{s.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                {s.warning ? (
                  <span style={{ color: 'var(--clay)' }}>· {s.warning} ·</span>
                ) : (
                  'Renews ' + s.renew
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="num" style={{ fontSize: 14, fontWeight: 600 }}>{fmtINR(s.amount)}</div>
              {s.raised && (
                <div className="num" style={{ fontSize: 11, color: 'var(--clay)', fontWeight: 600 }}>
                  ↑ {fmtINR(s.amount - s.prevAmount)}
                </div>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function TrendsView() {
  const cats = ['Dining', 'Coffee', 'Shopping', 'Hobbies'];
  const [selected, setSelected] = useState(new Set(['Dining', 'Coffee']));
  const colors: Record<string, string> = {
    Dining: 'var(--copper)',
    Coffee: 'var(--amber)',
    Shopping: 'var(--plum)',
    Hobbies: 'var(--clay)',
    Groceries: 'var(--green)',
    Transport: 'var(--blue)',
  };

  const toggle = (c: string) => {
    const next = new Set(selected);
    if (next.has(c)) next.delete(c); else next.add(c);
    setSelected(next);
  };

  const anomalies = cats.map(c => {
    const data = SEED_HISTORY[c];
    let growth = 0;
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1]) growth++;
      else growth = 0;
    }
    return { cat: c, growing: growth >= 3 };
  }).filter(a => a.growing);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px' }}>
      <Card padding={18}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>12-Month Trend</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3, marginBottom: 14 }}>Categorical Explorer</div>
        <TrendChart selected={selected} colors={colors} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
          {cats.map(c => {
            const on = selected.has(c);
            return (
              <div key={c} onClick={() => toggle(c)} className="press" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 8,
                background: on ? colors[c] + '20' : 'var(--surface-3)',
                border: on ? '1px solid ' + colors[c] : '1px solid transparent',
                fontSize: 12, fontWeight: 600,
                color: on ? colors[c] : 'var(--ink-3)',
              }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: colors[c], opacity: on ? 1 : 0.4 }} />
                {c}
              </div>
            );
          })}
        </div>
      </Card>

      {anomalies.length > 0 && (
        <Card padding={0}>
          <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <LucideIcon name="alert" size={16} style={{ color: 'var(--clay)' }} stroke={2.2} />
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Lifestyle Creep Detected</div>
          </div>
          {anomalies.map((a) => (
            <div key={a.cat} style={{
              padding: '12px 16px', borderTop: '0.5px solid var(--divider)',
              fontSize: 14, color: 'var(--ink-2)',
            }}>
              <span style={{ color: 'var(--clay)', fontWeight: 600 }}>{a.cat}</span> has been climbing month-over-month. Up{' '}
              <span className="num" style={{ fontWeight: 700, color: 'var(--ink)' }}>
                {Math.round((SEED_HISTORY[a.cat][10] - SEED_HISTORY[a.cat][0]) / SEED_HISTORY[a.cat][0] * 100)}%
              </span>{' '}
              from a year ago.
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function TrendChart({ selected, colors }: { selected: Set<string>, colors: Record<string, string> }) {
  const W = 320, H = 160;
  const padL = 8, padR = 8, padT = 8, padB = 22;
  const innerW = W - padL - padR, innerH = H - padT - padB;

  const cats = Array.from(selected);
  if (cats.length === 0) {
    return <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Select categories below to plot</div>;
  }

  const all = cats.flatMap(c => SEED_HISTORY[c]);
  const maxY = Math.max(...all) * 1.1;

  const x = (i: number) => padL + (i / 11) * innerW;
  const y = (v: number) => padT + innerH - (v / maxY) * innerH;

  const months = ['J','J','A','S','O','N','D','J','F','M','A','M'];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <line key={p} x1={padL} x2={W - padR}
              y1={padT + innerH * p} y2={padT + innerH * p}
              stroke="var(--divider)" strokeWidth="0.5" />
      ))}
      {cats.map(c => {
        const pts = SEED_HISTORY[c].map((v, i) => `${x(i)},${y(v)}`).join(' L ');
        return (
          <g key={c}>
            <path d={'M ' + pts} fill="none" stroke={colors[c]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {SEED_HISTORY[c].map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r="2.5" fill="var(--surface)" stroke={colors[c]} strokeWidth="1.5" />
            ))}
          </g>
        );
      })}
      {months.map((m, i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle"
              style={{ fontSize: 9, fontWeight: 600, fill: 'var(--ink-4)', fontFamily: '-apple-system, system-ui' }}>
          {m}
        </text>
      ))}
    </svg>
  );
}

function WhatIfView({ state }: { state: { budget: Budget } }) {
  const baselineRent = 35000;
  const baselineSIP = 15000;
  const baselineSavings = state.budget.income * 0.20;

  const [rentDelta, setRentDelta] = useState(0);
  const [sipDelta, setSipDelta] = useState(0);
  const [incomeDelta, setIncomeDelta] = useState(0);

  const newIncome = state.budget.income + incomeDelta;
  const newSIP = baselineSIP + sipDelta;

  const newSavings = baselineSavings + sipDelta + (incomeDelta - rentDelta) * 0.6;
  const newRatio = newIncome > 0 ? newSavings / newIncome : 0;

  const compounded = (monthly: number, years: number) => monthly * 12 * (Math.pow(1.10, years) - 1) / 0.10;

  const oneYear = compounded(newSIP, 1);
  const fiveYear = compounded(newSIP, 5);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px' }}>
      <Card padding={20}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Scenario Modeler</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3, marginTop: 2, marginBottom: 18 }}>
          Test a lifestyle change
        </div>

        <ScenarioSlider label="Rent" baseline={baselineRent} delta={rentDelta} setDelta={setRentDelta} min={-10000} max={20000} step={1000} />
        <ScenarioSlider label="Monthly SIP" baseline={baselineSIP} delta={sipDelta} setDelta={setSipDelta} min={-5000} max={20000} step={1000} />
        <ScenarioSlider label="Income" baseline={state.budget.income} delta={incomeDelta} setDelta={setIncomeDelta} min={-20000} max={50000} step={5000} />
      </Card>

      <Card padding={18}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 12 }}>Projected Impact</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'var(--surface-2)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.3 }}>1 Year</div>
            <AnimatedRupees value={Math.round(oneYear)} style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)', letterSpacing: -0.4, marginTop: 4, display: 'block' }} />
          </div>
          <div style={{ padding: 12, borderRadius: 12, background: 'var(--surface-2)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.3 }}>5 Years</div>
            <AnimatedRupees value={Math.round(fiveYear)} style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)', letterSpacing: -0.4, marginTop: 4, display: 'block' }} />
          </div>
        </div>

        <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>Savings ratio</div>
            <div className="num" style={{ fontSize: 14, fontWeight: 700, color: newRatio >= 0.20 ? 'var(--green)' : 'var(--clay)' }}>
              <AnimatedInt value={Math.round(newRatio * 100)} suffix="%" /> <span style={{ fontWeight: 500, color: 'var(--ink-4)' }}>/ 20% target</span>
            </div>
          </div>
          <ProgressBar value={newRatio * 100} max={30} color={newRatio >= 0.20 ? 'green' : 'clay'} height={6} />
        </div>

        {(rentDelta !== 0 || sipDelta !== 0 || incomeDelta !== 0) && (
          <div style={{
            marginTop: 12, padding: '10px 12px', borderRadius: 10,
            background: newRatio >= 0.20 ? 'var(--green-tint)' : 'var(--clay-tint)',
            color: newRatio >= 0.20 ? 'var(--green)' : 'var(--clay)',
            fontSize: 12, fontWeight: 500, lineHeight: 1.4,
          }}>
            {newRatio >= 0.20
              ? 'This scenario keeps you on the 50/30/20 track. Worth considering.'
              : 'This scenario breaks your 20% savings target. Proceed with caution.'}
          </div>
        )}
      </Card>
    </div>
  );
}

interface ScenarioSliderProps {
  label: string;
  baseline: number;
  delta: number;
  setDelta: (v: number) => void;
  min: number;
  max: number;
  step: number;
}

function ScenarioSlider({ label, baseline, delta, setDelta, min, max, step }: ScenarioSliderProps) {
  const newVal = baseline + delta;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
        <div className="num" style={{ fontSize: 14, fontWeight: 600, color: delta === 0 ? 'var(--ink-2)' : (delta > 0 ? 'var(--green)' : 'var(--clay)') }}>
          {fmtINR(newVal)}
          {delta !== 0 && (
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700 }}>
              {delta > 0 ? '↑' : '↓'} {fmtINR(Math.abs(delta))}
            </span>
          )}
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={delta}
             onChange={e => setDelta(Number(e.target.value))}
             style={{
               width: '100%', accentColor: 'var(--copper)',
               height: 4,
             }} />
    </div>
  );
}
