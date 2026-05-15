// Transactions Ledger — master record

const { useState: tUseState, useMemo: tUseMemo } = React;

function Transactions({ state, onEditTxn, setTransactions, onDeleteTxn }) {
  const { transactions } = state;
  const [query, setQuery] = tUseState('');
  const [activeFilter, setActiveFilter] = tUseState('all');
  const [selectedIds, setSelectedIds] = tUseState(new Set());
  const [bulkOpen, setBulkOpen] = tUseState(false);

  const filtered = tUseMemo(() => {
    let xs = transactions;
    if (activeFilter === 'expenses') xs = xs.filter(t => t.type === 'expense');
    if (activeFilter === 'income') xs = xs.filter(t => t.type === 'income');
    if (activeFilter === 'pending') xs = xs.filter(t => t.status === 'pending');
    if (query.trim()) {
      const q = query.toLowerCase();
      xs = xs.filter(t =>
        t.merchant.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q)) ||
        (t.notes || '').toLowerCase().includes(q)
      );
    }
    return xs.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, query, activeFilter]);

  // Group by day
  const grouped = tUseMemo(() => {
    const g = {};
    filtered.forEach(t => {
      const k = dayKey(t.date);
      (g[k] = g[k] || []).push(t);
    });
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const toggleSel = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const clearSel = () => { setSelectedIds(new Set()); setBulkOpen(false); };

  const bulkRecategorize = (newCat) => {
    setTransactions(transactions.map(t =>
      selectedIds.has(t.id) ? { ...t, category: newCat } : t
    ));
    clearSel();
  };

  const bulkDelete = () => {
    if (onDeleteTxn) {
      Array.from(selectedIds).forEach(id => onDeleteTxn(id));
    } else {
      setTransactions(transactions.filter(t => !selectedIds.has(t.id)));
    }
    clearSel();
  };

  const hasSelection = selectedIds.size > 0;

  return (
    <div className="phone-scroll fade-up" style={{ height: '100%', overflowY: 'auto', paddingBottom: 110 }}>
      <div style={{ height: 60 }} />
      <PageHeader title="Ledger" subtitle="The master record" />

      {/* Search */}
      <div style={{ padding: '0 16px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 12,
          background: 'var(--surface-3)',
        }}>
          <Lucide name="search" size={16} style={{ color: 'var(--ink-3)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)}
                 placeholder="Merchant, category, or tag"
                 style={{
                   flex: 1, border: 'none', outline: 'none', background: 'transparent',
                   fontFamily: 'inherit', fontSize: 15, color: 'var(--ink)',
                 }} />
          {query && (
            <div className="press" onClick={() => setQuery('')} style={{ color: 'var(--ink-3)' }}>
              <Lucide name="close" size={16} stroke={2} />
            </div>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, overflowX: 'auto' }} className="phone-scroll">
        {[
          { id: 'all', label: 'All' },
          { id: 'expenses', label: 'Expenses' },
          { id: 'income', label: 'Income' },
          { id: 'pending', label: 'Pending' },
        ].map(f => {
          const on = activeFilter === f.id;
          return (
            <div key={f.id} onClick={() => setActiveFilter(f.id)} className="press" style={{
              padding: '7px 14px', borderRadius: 10,
              fontSize: 13, fontWeight: 600,
              background: on ? 'var(--ink)' : 'var(--surface-3)',
              color: on ? 'var(--bg)' : 'var(--ink-2)',
              flexShrink: 0, letterSpacing: -0.1,
            }}>{f.label}</div>
          );
        })}
      </div>

      {/* Bulk action bar */}
      {hasSelection && (
        <div style={{ padding: '0 16px 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', borderRadius: 14,
            background: 'var(--ink)', color: 'var(--bg)',
          }}>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
              {selectedIds.size} selected
            </div>
            <div className="press" onClick={() => setBulkOpen(true)} style={{
              padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.15)',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Lucide name="tag" size={12} stroke={2.2} />
              Re-categorize
            </div>
            <div className="press" onClick={bulkDelete} style={{
              padding: '6px 10px', borderRadius: 8, background: 'var(--clay)',
              color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Lucide name="trash" size={12} stroke={2.4} />
              Delete
            </div>
            <div className="press" onClick={clearSel} style={{ opacity: 0.7, marginLeft: 2 }}>
              <Lucide name="close" size={18} stroke={2.2} />
            </div>
          </div>
        </div>
      )}

      {/* Groups */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {grouped.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
            No transactions match
          </div>
        ) : grouped.map(([day, txns]) => {
          const expense = txns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
          const income = txns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
          return (
            <div key={day}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '0 6px 8px',
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.2 }}>{relativeDay(day)}</div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-3)', marginTop: 1 }}>
                    {new Date(day).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div className="num" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', textAlign: 'right' }}>
                  {income > 0 && <div style={{ color: 'var(--green)' }}>+{fmtINR(income)}</div>}
                  {expense > 0 && <div>−{fmtINR(expense)}</div>}
                </div>
              </div>

              <Card padding={0}>
                {txns.map((t, i) => (
                  <TxnRow key={t.id} t={t}
                    isLast={i === txns.length - 1}
                    onClick={() => hasSelection ? toggleSel(t.id) : onEditTxn(t)}
                    onLongPress={() => toggleSel(t.id)}
                    selected={selectedIds.has(t.id)}
                    selecting={hasSelection}
                  />
                ))}
              </Card>
            </div>
          );
        })}
      </div>

      {/* Bulk modal */}
      <BottomSheet open={bulkOpen} onClose={() => setBulkOpen(false)} title="Re-categorize">
        <div style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', marginBottom: 16 }}>
          Move {selectedIds.size} transaction{selectedIds.size > 1 ? 's' : ''} to:
        </div>
        <Card padding={0}>
          {CATEGORY_LIST.filter(c => c !== 'Salary').map((c, i, arr) => (
            <div key={c} onClick={() => bulkRecategorize(c)} className="press" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              borderBottom: i < arr.length - 1 ? '0.5px solid var(--divider)' : 'none',
            }}>
              <CategoryTile name={c} size={32} />
              <div style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{c}</div>
              <Lucide name="chevron-right" size={16} style={{ color: 'var(--ink-4)' }} />
            </div>
          ))}
        </Card>
      </BottomSheet>
    </div>
  );
}

function TxnRow({ t, isLast, onClick, onLongPress, selected, selecting }) {
  const [pressTimer, setPressTimer] = tUseState(null);
  const startPress = () => {
    setPressTimer(setTimeout(onLongPress, 450));
  };
  const endPress = () => {
    if (pressTimer) clearTimeout(pressTimer);
    setPressTimer(null);
  };

  return (
    <div
      onClick={onClick}
      onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
      onTouchStart={startPress} onTouchEnd={endPress}
      className="press"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        borderBottom: isLast ? 'none' : '0.5px solid var(--divider)',
        background: selected ? 'var(--copper-tint)' : 'transparent',
      }}
    >
      {selecting && (
        <div style={{
          width: 22, height: 22, borderRadius: 11,
          background: selected ? 'var(--copper)' : 'transparent',
          border: selected ? 'none' : '1.5px solid var(--ink-4)',
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {selected && <Lucide name="check" size={14} stroke={2.8} />}
        </div>
      )}
      <CategoryTile name={t.category} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 600, color: 'var(--ink)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{t.merchant}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{t.category}</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>{relativeTime(t.date)}</span>
          {t.tags && t.tags.length > 0 && (
            <>
              <span style={{ opacity: 0.5 }}>·</span>
              <span style={{
                padding: '1px 6px', borderRadius: 4,
                background: 'var(--surface-3)', color: 'var(--ink-3)',
                fontSize: 10, fontWeight: 600,
              }}>{t.tags[0]}</span>
            </>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="num" style={{
          fontSize: 15, fontWeight: 600,
          color: t.type === 'income' ? 'var(--green)' : 'var(--ink)',
        }}>
          {t.type === 'income' ? '+' : '−'}{fmtINR(t.amount)}
        </div>
        {t.status === 'pending' && (
          <div style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 700, marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.3 }}>Pending</div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Transactions });
