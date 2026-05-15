// New widget set — donut, bills, daily pulse, savings rate gauge, cash flow bars.
// Pure SVG, uses existing palette tokens. No new dependencies.

const { useMemo: chUseMemo } = React;

// ──────────────────────────────────────────────────────────
// Colors keyed off CATEGORY_META so the donut matches tiles.
// ──────────────────────────────────────────────────────────
const PALETTE_COLOR = {
  green: 'var(--green)', blue: 'var(--blue)', amber: 'var(--amber)',
  copper: 'var(--copper)', plum: 'var(--plum)', clay: 'var(--clay)',
};

function categoryColor(cat) {
  const meta = CATEGORY_META[cat] || { color: 'plum' };
  return PALETTE_COLOR[meta.color] || PALETTE_COLOR.plum;
}

// ──────────────────────────────────────────────────────────
// SpendingDonut — May-to-date expenses, by category.
// ──────────────────────────────────────────────────────────
function SpendingDonut({ transactions, size = 132, stroke = 20 }) {
  const data = chUseMemo(() => {
    const cats = {};
    transactions.forEach(t => {
      if (t.type !== 'expense') return;
      const d = new Date(t.date);
      if (d.getMonth() !== 4 || d.getFullYear() !== 2026) return;
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats)
      .map(([cat, amt]) => ({ cat, amt }))
      .sort((a, b) => b.amt - a.amt);
  }, [transactions]);

  const total = data.reduce((a, x) => a + x.amt, 0);

  if (!total) {
    return (
      <Card padding={18}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
          Where it went
        </div>
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
          No spending logged this month yet.
        </div>
      </Card>
    );
  }

  // Show top 5, group the rest as "Other"
  const TOP = 5;
  const top = data.slice(0, TOP);
  const rest = data.slice(TOP);
  const restTotal = rest.reduce((a, x) => a + x.amt, 0);
  const slices = [...top, ...(restTotal > 0 ? [{ cat: 'Other', amt: restTotal, isOther: true }] : [])];

  const cx = size / 2, cy = size / 2;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const GAP = 0.012; // small visual gap between arcs

  let cum = 0;
  const arcs = slices.map(s => {
    const pct = s.amt / total;
    const visible = Math.max(0, pct - GAP);
    const dasharray = `${visible * C} ${C}`;
    const offset = -cum * C;
    cum += pct;
    return {
      ...s,
      dasharray,
      offset,
      color: s.isOther ? 'var(--ink-4)' : categoryColor(s.cat),
    };
  });

  return (
    <Card padding={18}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Where it went
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3, marginTop: 2 }}>
            Spending breakdown
          </div>
        </div>
        <div className="num" style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)' }}>
          {slices.length} categories
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
            {arcs.map((a) => (
              <circle key={a.cat} cx={cx} cy={cy} r={r} fill="none"
                stroke={a.color} strokeWidth={stroke}
                strokeDasharray={a.dasharray} strokeDashoffset={a.offset}
                strokeLinecap="butt"
              />
            ))}
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div className="num" style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: 'var(--ink)', lineHeight: 1 }}>
              {fmtCompact(total)}
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 4 }}>
              Spent · May
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {arcs.slice(0, 5).map(a => (
            <div key={a.cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: a.color, flexShrink: 0 }} />
              <div style={{
                fontSize: 12, fontWeight: 500, color: 'var(--ink-2)',
                flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{a.cat}</div>
              <div className="num" style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', minWidth: 28, textAlign: 'right' }}>
                {Math.round(a.amt / total * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────
// UpcomingBills — surfaces budget.tiers.needs with due dates.
// ──────────────────────────────────────────────────────────
function UpcomingBills({ budget, onSeeAll }) {
  const today = new Date('2026-05-14');

  const bills = chUseMemo(() => {
    const MONS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return budget.tiers.needs.categories
      .filter(c => c.due && !c.paid)
      .map(c => {
        const parts = c.due.split(' ');
        const monthIdx = MONS.indexOf(parts[0]);
        const day = parseInt(parts[1], 10);
        if (monthIdx < 0 || !day) return null;
        const dueDate = new Date(2026, monthIdx, day);
        const daysUntil = Math.round((dueDate - today) / 86400000);
        return { ...c, dueDate, daysUntil };
      })
      .filter(Boolean)
      .filter(c => c.daysUntil >= -2 && c.daysUntil <= 45)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 4);
  }, [budget]);

  if (bills.length === 0) return null;

  const totalDue = bills.reduce((a, b) => a + (b.limit - b.spent), 0);

  const toneFor = (days) => {
    if (days <= 3) return { bg: 'var(--clay-tint)', fg: 'var(--clay)' };
    if (days <= 10) return { bg: 'var(--amber-tint)', fg: 'var(--amber)' };
    return { bg: 'var(--green-tint)', fg: 'var(--green)' };
  };

  const labelFor = (days) => {
    if (days < 0) return Math.abs(days) + 'd late';
    if (days === 0) return 'today';
    if (days === 1) return 'tomorrow';
    return days + ' days';
  };

  return (
    <Card padding={0}>
      <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Lucide name="bell" size={15} style={{ color: 'var(--ink-3)' }} stroke={2} />
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
          Upcoming Bills
        </div>
        <div style={{ flex: 1 }} />
        <div className="num" style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)' }}>
          {fmtINR(totalDue)} due
        </div>
      </div>
      {bills.map((b) => {
        const tone = toneFor(b.daysUntil);
        return (
          <div key={b.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 16px',
            borderTop: '0.5px solid var(--divider)',
          }}>
            <CategoryTile name={b.name} icon={b.icon} color={b.color} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {b.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{b.due}</div>
            </div>
            <div className="num" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
              {fmtINR(b.limit - b.spent)}
            </div>
            <div style={{
              padding: '4px 9px', borderRadius: 7,
              background: tone.bg, color: tone.fg,
              fontSize: 10.5, fontWeight: 700, letterSpacing: 0.1,
              minWidth: 60, textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {labelFor(b.daysUntil)}
            </div>
          </div>
        );
      })}
    </Card>
  );
}

// ──────────────────────────────────────────────────────────
// DailyPulse — 14-bar strip, today highlighted, blow-outs in clay.
// ──────────────────────────────────────────────────────────
function DailyPulse({ transactions }) {
  const data = chUseMemo(() => {
    const days = {};
    for (let d = 1; d <= 14; d++) days[d] = 0;
    transactions.forEach(t => {
      if (t.type !== 'expense') return;
      const dt = new Date(t.date);
      if (dt.getMonth() !== 4 || dt.getFullYear() !== 2026) return;
      const day = dt.getDate();
      if (day >= 1 && day <= 14) days[day] = (days[day] || 0) + t.amount;
    });
    return Object.entries(days).map(([day, amt]) => ({ day: parseInt(day, 10), amt }));
  }, [transactions]);

  const spendDays = data.filter(d => d.amt > 0);
  const max = Math.max(...data.map(d => d.amt), 1);
  const avg = spendDays.length > 0 ? spendDays.reduce((a, d) => a + d.amt, 0) / spendDays.length : 0;
  const blowoutCount = spendDays.filter(d => d.amt > avg * 1.8).length;

  return (
    <Card padding={16}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Daily Pulse
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
            <span className="num" style={{ fontWeight: 700, color: 'var(--ink-2)' }}>
              {fmtINR(Math.round(avg))}
            </span>
            <span> avg / spending day</span>
            {blowoutCount > 0 && (
              <span style={{ color: 'var(--clay)', fontWeight: 600 }}>
                {' · '}{blowoutCount} blow-out day{blowoutCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="num" style={{ fontSize: 10, color: 'var(--ink-4)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
          May 1 – 14
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 48 }}>
        {data.map(d => {
          const h = d.amt > 0 ? Math.max(4, (d.amt / max) * 44) : 3;
          const blowout = d.amt > avg * 1.8 && d.amt > 0;
          const isToday = d.day === 14;
          let bg, opacity = 1;
          if (d.amt === 0) { bg = 'var(--surface-3)'; }
          else if (blowout) { bg = 'var(--clay)'; }
          else if (isToday) { bg = 'var(--copper)'; }
          else { bg = 'var(--copper)'; opacity = 0.4; }
          return (
            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: '100%', height: h, borderRadius: 3,
                background: bg, opacity,
              }} />
              <div className="num" style={{
                fontSize: 9, fontWeight: isToday ? 700 : 500,
                color: isToday ? 'var(--copper)' : 'var(--ink-4)',
                letterSpacing: 0.2,
              }}>{d.day}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────
// SavingsRateGauge — semicircle arc, spring-animated to target tick.
// ──────────────────────────────────────────────────────────
function SavingsRateGauge({ income, spent, target = 30 }) {
  const saved = Math.max(0, income - spent);
  const rateRaw = income > 0 ? (saved / income) * 100 : 0;
  const rate = Math.max(0, Math.round(rateRaw));
  const animated = useSpringValue(rate, { stiffness: 120, damping: 22 });

  // Semicircle from 180° (left) to 360° (right). 50% is the visual ceiling.
  const VIS_MAX = 50;
  const W = 240, H = 130;
  const cx = W / 2, cy = H - 10;
  const r = 92;
  const stroke = 14;

  const fracToAngle = (frac) => Math.PI + Math.PI * Math.min(frac, 1);
  const arcPath = (frac0, frac1) => {
    if (frac1 <= frac0) return '';
    const a0 = fracToAngle(frac0);
    const a1 = fracToAngle(frac1);
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const largeArc = (frac1 - frac0) > 0.5 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}`;
  };

  const progressFrac = Math.min(animated / VIS_MAX, 1);
  const targetFrac = target / VIS_MAX;

  const onTrack = rate >= target;
  const color = onTrack
    ? 'var(--green)'
    : (rate >= target * 0.6 ? 'var(--amber)' : 'var(--clay)');

  // Tick at target
  const tickAngle = fracToAngle(targetFrac);
  const tickR0 = r - stroke / 2 - 3;
  const tickR1 = r + stroke / 2 + 3;
  const tx0 = cx + tickR0 * Math.cos(tickAngle);
  const ty0 = cy + tickR0 * Math.sin(tickAngle);
  const tx1 = cx + tickR1 * Math.cos(tickAngle);
  const ty1 = cy + tickR1 * Math.sin(tickAngle);

  // Label position outside the tick
  const labelR = r + stroke / 2 + 14;
  const lx = cx + labelR * Math.cos(tickAngle);
  const ly = cy + labelR * Math.sin(tickAngle);

  return (
    <Card padding={18}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Lucide name="trending-up" size={16} style={{ color: 'var(--copper)' }} stroke={2} />
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
          Savings Rate
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 6 }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
          {/* background track */}
          <path d={arcPath(0, 1)} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} strokeLinecap="round" />
          {/* progress */}
          {progressFrac > 0.001 && (
            <path d={arcPath(0, progressFrac)} fill="none" stroke={color}
                  strokeWidth={stroke} strokeLinecap="round"
                  style={{ filter: onTrack ? 'drop-shadow(0 1px 4px rgba(107,142,90,0.35))' : 'none' }} />
          )}
          {/* target tick */}
          <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" />
          <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: 10, fontWeight: 700, fill: 'var(--ink-3)', letterSpacing: 0.4 }}>
            {target}%
          </text>
        </svg>
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', pointerEvents: 'none',
        }}>
          <div className="num" style={{
            fontSize: 52, fontWeight: 700, color: 'var(--ink)',
            letterSpacing: -2, lineHeight: 1,
          }}>
            {Math.round(animated)}<span style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink-3)', marginLeft: 2 }}>%</span>
          </div>
          <div className="num" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4, fontWeight: 600 }}>
            {fmtINR(saved)} of {fmtINR(income)}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 4, padding: '9px 12px', borderRadius: 10,
        background: onTrack ? 'var(--green-tint)' : (rate >= target * 0.6 ? 'var(--amber-tint)' : 'var(--clay-tint)'),
        color: onTrack ? 'var(--green)' : (rate >= target * 0.6 ? 'var(--amber)' : 'var(--clay)'),
        fontSize: 12, fontWeight: 500, textAlign: 'center', lineHeight: 1.4,
      }}>
        {onTrack
          ? `Beating your ${target}% target — keep it up.`
          : rate >= target * 0.6
            ? <>{fmtINR(Math.round(income * target / 100 - saved))} short of {target}% this month.</>
            : `Well below ${target}%. Trim discretionary?`}
      </div>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────
// CashFlowChart — 6-month income vs expense bars.
// ──────────────────────────────────────────────────────────
function CashFlowChart() {
  // Derived from SEED_HISTORY (sum of all expense categories) + fixed income line.
  const data = chUseMemo(() => {
    // SEED_HISTORY index 6→11 = last 6 entries (Dec-May using our 12-month window)
    const idxs = [6, 7, 8, 9, 10, 11];
    const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const fixedMonthly = 35000 + 1850 + 1199 + 599 + 1500 + 1499; // rent + utils + etc.
    const incomes = [142000, 145000, 145000, 148000, 145000, 145000];

    return idxs.map((idx, i) => {
      const discretionary = Object.values(SEED_HISTORY).reduce((a, arr) => a + arr[idx], 0);
      const expense = i === 5
        ? discretionary // partial month — already low in seed
        : discretionary + fixedMonthly;
      return { m: months[i], income: incomes[i], expense };
    });
  }, []);

  const max = Math.max(...data.flatMap(d => [d.income, d.expense]));

  const W = 320, H = 168;
  const padL = 8, padR = 8, padT = 6, padB = 22;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const groupW = innerW / data.length;
  const barW = (groupW - 10) / 2;

  const avgIncome = data.reduce((a, d) => a + d.income, 0) / data.length;
  const avgExpense = data.reduce((a, d) => a + d.expense, 0) / data.length;
  const avgNet = avgIncome - avgExpense;

  return (
    <Card padding={18}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            6-Month Cash Flow
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3, marginTop: 2 }}>
            Income vs Expenses
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--green)' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--green)' }} />In
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--copper)' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--copper)' }} />Out
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
        {[0.5, 1].map(p => (
          <line key={p} x1={padL} x2={W - padR}
                y1={padT + innerH * (1 - p)} y2={padT + innerH * (1 - p)}
                stroke="var(--divider)" strokeWidth="0.5" />
        ))}
        {data.map((d, i) => {
          const gx = padL + i * groupW + (groupW - barW * 2 - 4) / 2;
          const incH = (d.income / max) * innerH;
          const expH = (d.expense / max) * innerH;
          const isCurrent = i === data.length - 1;
          return (
            <g key={d.m}>
              <rect x={gx} y={padT + innerH - incH} width={barW} height={incH}
                    rx={2.5} fill="var(--green)" opacity={isCurrent ? 0.55 : 1} />
              <rect x={gx + barW + 4} y={padT + innerH - expH} width={barW} height={expH}
                    rx={2.5} fill="var(--copper)" opacity={isCurrent ? 0.55 : 1} />
              <text x={gx + barW + 2} y={H - 6} textAnchor="middle"
                    style={{
                      fontSize: 10,
                      fontWeight: isCurrent ? 700 : 600,
                      fill: isCurrent ? 'var(--ink-2)' : 'var(--ink-4)',
                      letterSpacing: 0.2,
                    }}>
                {d.m}{isCurrent ? '*' : ''}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{
        marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
        padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 12,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.3, textTransform: 'uppercase' }}>Avg in</div>
          <div className="num" style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)', marginTop: 2 }}>
            {fmtCompact(avgIncome)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.3, textTransform: 'uppercase' }}>Avg out</div>
          <div className="num" style={{ fontSize: 15, fontWeight: 700, color: 'var(--copper)', marginTop: 2 }}>
            {fmtCompact(avgExpense)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.3, textTransform: 'uppercase' }}>Net</div>
          <div className="num" style={{ fontSize: 15, fontWeight: 700, color: avgNet >= 0 ? 'var(--ink)' : 'var(--clay)', marginTop: 2 }}>
            {fmtCompact(avgNet)}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 6, textAlign: 'right', fontStyle: 'italic' }}>
        * May is mid-month
      </div>
    </Card>
  );
}

Object.assign(window, {
  SpendingDonut, UpcomingBills, DailyPulse, SavingsRateGauge, CashFlowChart,
});
