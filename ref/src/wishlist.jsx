// Wishlist screen — motivation engine

function Wishlist({ state, onAdd, onOpen, onAllocate }) {
  const { wishlist, unallocated = 0 } = state;

  const totalTarget = wishlist.reduce((a, w) => a + w.price, 0);
  const totalSaved = wishlist.reduce((a, w) => a + w.saved, 0);
  const totalAllocation = wishlist.reduce((a, w) => a + (w.allocation || 0), 0);
  const overallPct = totalTarget > 0 ? Math.round(totalSaved / totalTarget * 100) : 0;

  // Sort: priority then by ETA (closest first), funded last
  const sorted = [...wishlist].sort((a, b) => {
    const aFunded = a.saved >= a.price ? 1 : 0;
    const bFunded = b.saved >= b.price ? 1 : 0;
    if (aFunded !== bFunded) return aFunded - bFunded;
    const aETA = a.allocation > 0 ? (a.price - a.saved) / a.allocation : 999;
    const bETA = b.allocation > 0 ? (b.price - b.saved) / b.allocation : 999;
    return aETA - bETA;
  });

  return (
    <div className="phone-scroll fade-up" style={{
      height: '100%', overflowY: 'auto', paddingBottom: 110,
    }}>
      <div style={{ height: 60 }} />

      <PageHeader title="Wishlist" subtitle="The motivation engine" />

      {/* Savings velocity card */}
      <div style={{ padding: '0 16px 12px' }}>
        <Card padding={20}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Savings velocity</div>
              <AnimatedRupees value={totalAllocation} style={{
                fontSize: 36, fontWeight: 700, letterSpacing: -1, display: 'block', marginTop: 4,
              }} />
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>per month toward goals</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="num" style={{ fontSize: 28, fontWeight: 700, color: 'var(--copper)', letterSpacing: -0.6 }}>
                <AnimatedInt value={overallPct} suffix="%" />
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.3, textTransform: 'uppercase' }}>funded</div>
            </div>
          </div>

          <ProgressBar value={totalSaved} max={totalTarget} color="copper" height={8} showOver={false} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, fontWeight: 500 }}>
            <span className="num" style={{ color: 'var(--ink-2)' }}>{fmtINR(totalSaved)} saved</span>
            <span className="num" style={{ color: 'var(--ink-3)' }}>of {fmtINR(totalTarget)}</span>
          </div>

          {/* Unallocated pool */}
          <div style={{
            marginTop: 14, paddingTop: 14, borderTop: '0.5px solid var(--divider)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, background: 'var(--copper-tint)',
              color: 'var(--copper)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lucide name="wallet" size={16} stroke={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.3 }}>Unallocated</div>
              <div className="num" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginTop: 1 }}>
                {fmtINR(unallocated)}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'right', maxWidth: 140, lineHeight: 1.3 }}>
              Push funds into any item with <strong style={{ color: 'var(--copper)' }}>Allocate</strong>
            </div>
          </div>
        </Card>
      </div>

      {/* Wishlist items */}
      <div style={{ padding: '4px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SectionLabel action={
          <span className="press" onClick={() => onAdd()} style={{
            fontSize: 13, fontWeight: 600, color: 'var(--copper)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Lucide name="plus" size={14} stroke={2.4} />
            New
          </span>
        }>{wishlist.length} items</SectionLabel>

        {sorted.map(w => <WishlistCard key={w.id} item={w}
          onOpen={() => onOpen(w)}
          onAllocate={() => onAllocate(w)}
          canAllocate={unallocated > 0 && w.saved < w.price}
        />)}
      </div>
    </div>
  );
}

function WishlistCard({ item, onOpen, onAllocate, canAllocate }) {
  const pct = item.price > 0 ? item.saved / item.price : 0;
  const remaining = item.price - item.saved;
  const funded = item.saved >= item.price;
  const months = funded ? 0 : (item.allocation > 0 ? Math.ceil(remaining / item.allocation) : 0);
  const weeks = funded ? 0 : Math.ceil(remaining / (item.allocation / 4.3));

  const eta = funded
    ? 'Fully funded'
    : months <= 1
      ? (weeks <= 1 ? 'days away' : weeks + ' weeks away')
      : months + ' months away';

  const priorityColor = PRIORITY_COLORS[item.priority];

  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'stretch' }} onClick={onOpen} className="press">
        {/* Product image */}
        <div style={{
          width: 110, minHeight: 110, position: 'relative', flexShrink: 0,
          background: 'var(--surface-3)',
        }}>
          {item.image ? (
            <img src={item.image} alt={item.name}
                 style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }} />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'repeating-linear-gradient(135deg, var(--surface-2) 0 10px, var(--surface-3) 10px 20px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink-4)',
            }}>
              <Lucide name="image" size={24} stroke={1.6} />
            </div>
          )}
        </div>

        {/* Right side content */}
        <div style={{ flex: 1, padding: '14px 14px 14px 14px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 2 }}>
            <div style={{
              fontSize: 15, fontWeight: 600, color: 'var(--ink)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              flex: 1, letterSpacing: -0.2, lineHeight: 1.25, paddingTop: 1,
            }}>{item.name}</div>
            <div style={{
              padding: '2px 7px', borderRadius: 5,
              background: priorityColor.bg, color: priorityColor.fg,
              fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
              flexShrink: 0,
            }}>{item.priority}</div>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 500,
            color: funded ? 'var(--green)' : 'var(--ink-3)', marginBottom: 10,
          }}>
            {funded
              ? <><Lucide name="check" size={12} stroke={2.5} /> Ready to buy</>
              : <><Lucide name="clock" size={12} /> {eta}</>
            }
          </div>

          <ProgressBar value={item.saved} max={item.price} color="copper" height={5} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, alignItems: 'baseline' }}>
            <div className="num" style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
              {fmtINR(item.saved)} <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>/ {fmtINR(item.price)}</span>
            </div>
            <div className="num" style={{
              fontSize: 11, fontWeight: 600,
              color: funded ? 'var(--green)' : 'var(--copper)',
            }}>
              {funded ? '✓' : fmtINR(remaining) + ' to go'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer action row */}
      {!funded && (
        <div style={{
          display: 'flex', borderTop: '0.5px solid var(--divider)',
        }}>
          <div onClick={onOpen} className="press" style={{
            flex: 1, padding: '10px 0', textAlign: 'center',
            fontSize: 12, fontWeight: 600, color: 'var(--ink-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}>
            <Lucide name="arrow-up-right" size={13} stroke={2.2} /> Details
          </div>
          <div style={{ width: 0.5, background: 'var(--divider)' }} />
          <div onClick={(e) => { e.stopPropagation(); if (canAllocate) onAllocate(); }}
            className="press" style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              fontSize: 12, fontWeight: 700,
              color: canAllocate ? 'var(--copper)' : 'var(--ink-4)',
              cursor: canAllocate ? 'pointer' : 'not-allowed',
              opacity: canAllocate ? 1 : 0.6,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}>
            <Lucide name="plus" size={13} stroke={2.6} /> Allocate
          </div>
        </div>
      )}
    </Card>
  );
}

Object.assign(window, { Wishlist });
