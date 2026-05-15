// App orchestrator — state, routing, tweaks, modal switchboard

const { useState: aUseState, useEffect: aUseEffect, useMemo: aUseMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "#C5703B",
  "density": "balanced"
}/*EDITMODE-END*/;

// Persisted user-facing settings (live in localStorage, controlled via in-app Settings)
const SETTINGS_DEFAULTS = {
  currency: 'INR',
  theme: 'light',
  accent: '#C5703B',
  palette: 'sand',
};

const USER_DEFAULTS = { name: '', email: '', signedIn: false };

// Background palette overrides per theme — only the surrounding background tones change.
const PALETTE_VARS = {
  sand: {
    light: { '--bg': '#F4F1EC', '--bg-2': '#EBE7DF' },
    dark:  { '--bg': '#0E0C0A', '--bg-2': '#16140F' },
  },
  linen: {
    light: { '--bg': '#F2F3F5', '--bg-2': '#E4E7EB' },
    dark:  { '--bg': '#0F1115', '--bg-2': '#171A20' },
  },
  slate: {
    light: { '--bg': '#EDEEF0', '--bg-2': '#DDE0E4' },
    dark:  { '--bg': '#101216', '--bg-2': '#181B20' },
  },
  paper: {
    light: { '--bg': '#FBFAF7', '--bg-2': '#F0EEE8' },
    dark:  { '--bg': '#0A0907', '--bg-2': '#12100D' },
  },
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch (_) { return fallback; }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // ── Persistent in-app settings (separate from designer Tweaks) ──
  const [settings, setSettings] = aUseState(() => loadJSON('finance.settings', SETTINGS_DEFAULTS));
  const [user, setUser] = aUseState(() => loadJSON('finance.user', USER_DEFAULTS));

  aUseEffect(() => { saveJSON('finance.settings', settings); }, [settings]);
  aUseEffect(() => { saveJSON('finance.user', user); }, [user]);

  // Settings update helper
  const updateSettings = (patch) => {
    if (patch.user) { setUser(patch.user); return; }
    setSettings(prev => ({ ...prev, ...patch }));
  };

  const dark = settings.theme === 'dark';

  // Apply theme to document
  aUseEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  // Apply accent color
  aUseEffect(() => {
    document.documentElement.style.setProperty('--copper', settings.accent);
    const r = parseInt(settings.accent.slice(1, 3), 16);
    const g = parseInt(settings.accent.slice(3, 5), 16);
    const b = parseInt(settings.accent.slice(5, 7), 16);
    document.documentElement.style.setProperty('--copper-tint', `rgba(${r},${g},${b},0.14)`);
    document.documentElement.style.setProperty('--shadow-fab', `0 6px 20px rgba(${r},${g},${b},0.35), 0 2px 6px rgba(0,0,0,0.15)`);
  }, [settings.accent]);

  // Apply palette
  aUseEffect(() => {
    const p = PALETTE_VARS[settings.palette];
    if (!p) return;
    const vars = p[dark ? 'dark' : 'light'];
    for (const k of Object.keys(vars)) {
      document.documentElement.style.setProperty(k, vars[k]);
    }
  }, [settings.palette, dark]);

  // Apply currency
  aUseEffect(() => {
    setAppCurrency(settings.currency);
    // Tickle a re-render of money strings by bumping a key — done via state below
    setCurrencyTick(x => x + 1);
  }, [settings.currency]);

  const [currencyTick, setCurrencyTick] = aUseState(0);

  // ── App state ──
  const [tab, setTab] = aUseState('dashboard');
  const [showSettings, setShowSettings] = aUseState(false);
  const [transactions, setTransactions] = aUseState(SEED_TRANSACTIONS);
  const [wishlist, setWishlist] = aUseState(SEED_WISHLIST);
  const [budget, setBudget] = aUseState(SEED_BUDGET);
  const [wishDetailId, setWishDetailId] = aUseState(null);
  const [unallocated, setUnallocated] = aUseState(6800);

  // Modal state
  const [addTxnOpen, setAddTxnOpen] = aUseState(false);
  const [editTxn, setEditTxn] = aUseState(null);
  const [editWish, setEditWish] = aUseState(null);
  const [addWishOpen, setAddWishOpen] = aUseState(false);
  const [editCat, setEditCat] = aUseState(null);
  const [editCatTier, setEditCatTier] = aUseState('wants');
  const [catModalMode, setCatModalMode] = aUseState('edit');
  const [allocateWish, setAllocateWish] = aUseState(null);

  const state = { transactions, wishlist, budget, unallocated, user };

  // ── Handlers (unchanged from before) ──
  const onAddTxn = (txn) => {
    setTransactions([txn, ...transactions]);
    if (txn.type === 'expense') {
      setBudget(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        for (const tier of Object.values(next.tiers)) {
          for (const c of tier.categories) {
            if (c.name === txn.category) c.spent += txn.amount;
          }
        }
        return next;
      });
    }
  };
  const onSaveTxn = (updated) => setTransactions(transactions.map(x => x.id === updated.id ? updated : x));
  const onDeleteTxn = (id) => {
    const txn = transactions.find(x => x.id === id);
    setTransactions(transactions.filter(x => x.id !== id));
    if (txn?.type === 'expense') {
      setBudget(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        for (const tier of Object.values(next.tiers)) {
          for (const c of tier.categories) {
            if (c.name === txn.category) c.spent = Math.max(0, c.spent - txn.amount);
          }
        }
        return next;
      });
    }
  };
  const onSaveWish = (w) => setWishlist(prev => {
    const exists = prev.find(x => x.id === w.id);
    return exists ? prev.map(x => x.id === w.id ? w : x) : [...prev, w];
  });
  const onSaveCategory = (cat, newTier, mode = 'edit') => {
    setBudget(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (mode === 'edit') {
        for (const k of Object.keys(next.tiers)) {
          next.tiers[k].categories = next.tiers[k].categories.filter(c => c.id !== cat.id);
        }
      }
      next.tiers[newTier].categories.push(cat);
      return next;
    });
  };
  const onTogglePaid = (catId) => {
    setBudget(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      for (const k of Object.keys(next.tiers)) {
        for (const c of next.tiers[k].categories) {
          if (c.id === catId) c.paid = !c.paid;
        }
      }
      return next;
    });
  };
  const onAdjustAllocation = (id, value) => setWishlist(prev => prev.map(w => w.id === id ? { ...w, allocation: value } : w));
  const onAllocateFunds = (id, amount) => {
    if (amount <= 0 || amount > unallocated) return;
    setWishlist(prev => prev.map(w => w.id === id ? { ...w, saved: Math.min(w.price, w.saved + amount) } : w));
    setUnallocated(prev => Math.max(0, prev - amount));
  };

  const onSignIn = (u) => setUser({ ...u, signedIn: true });
  const onSignOut = () => { setUser({ ...USER_DEFAULTS }); setShowSettings(false); setTab('dashboard'); };

  // ── Render gate ──
  if (!user.signedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <PhoneFrame dark={dark}>
          <LoginScreen onSignIn={onSignIn} />
        </PhoneFrame>
        <TweaksPanel>
          <TweakSection title="Appearance">
            <TweakRadio label="Theme" value={settings.theme}
              onChange={(v) => updateSettings({ theme: v })}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]} />
            <TweakColor label="Accent" value={settings.accent}
              onChange={(v) => updateSettings({ accent: v })}
              options={['#C5703B', '#6B8E5A', '#4A6FA5', '#B85540', '#7E5A8C']} />
          </TweakSection>
        </TweaksPanel>
      </div>
    );
  }

  // ── Screen routing ──
  const screen = (() => {
    if (showSettings) {
      return (
        <SettingsScreen
          user={user}
          settings={settings}
          onUpdate={updateSettings}
          onSignOut={onSignOut}
          onBack={() => setShowSettings(false)}
        />
      );
    }

    if (wishDetailId && tab === 'wishlist') {
      const item = wishlist.find(w => w.id === wishDetailId);
      if (item) return (
        <WishlistDetail
          item={item} state={state}
          onBack={() => setWishDetailId(null)}
          onEdit={() => setEditWish(item)}
          onAdjustAllocation={onAdjustAllocation}
          onAllocate={() => setAllocateWish(item)}
        />
      );
    }
    switch (tab) {
      case 'dashboard': return <Dashboard state={state} setActiveTab={setTab}
        onFAB={() => setAddTxnOpen(true)} onEditTxn={setEditTxn}
        onOpenWish={(w) => { setTab('wishlist'); setWishDetailId(w.id); }}
        onOpenSettings={() => setShowSettings(true)} />;
      case 'wishlist': return <Wishlist state={state} onAdd={() => setAddWishOpen(true)}
        onOpen={(w) => setWishDetailId(w.id)} onAllocate={(w) => setAllocateWish(w)} />;
      case 'budget': return <Budget state={state}
        onEditCategory={(c, tier) => { setCatModalMode('edit'); setEditCat(c); setEditCatTier(tier); }}
        onAddCategory={(tier) => { setCatModalMode('new'); setEditCat({}); setEditCatTier(tier); }}
        onTogglePaid={onTogglePaid} />;
      case 'insights': return <Insights state={state} />;
      case 'transactions': return <Transactions state={state} onEditTxn={setEditTxn}
        setTransactions={setTransactions} onDeleteTxn={onDeleteTxn} />;
      default: return null;
    }
  })();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <PhoneFrame dark={dark} whiteStatusBar={!!wishDetailId && tab === 'wishlist'}>
        <div key={tab + (wishDetailId || '') + (showSettings ? 's' : '') + ':' + currencyTick}
             style={{ height: '100%', position: 'relative' }}>
          {screen}
        </div>
        {!(wishDetailId && tab === 'wishlist') && !showSettings && <FAB onClick={() => setAddTxnOpen(true)} />}
        {!showSettings && <TabBar active={tab} onChange={(t) => { setTab(t); setWishDetailId(null); }} dark={dark} />}

        {/* Modals */}
        <AddTransactionModal open={addTxnOpen} onClose={() => setAddTxnOpen(false)} onSave={onAddTxn} />
        <TransactionEditModal open={!!editTxn} onClose={() => setEditTxn(null)} txn={editTxn} onSave={onSaveTxn} onDelete={onDeleteTxn} />
        <AddWishlistModal open={addWishOpen || !!editWish}
          onClose={() => { setAddWishOpen(false); setEditWish(null); }}
          editing={editWish} onSave={onSaveWish} />
        <EditCategoryModal open={!!editCat}
          onClose={() => setEditCat(null)}
          category={catModalMode === 'edit' ? editCat : null}
          currentTier={editCatTier} mode={catModalMode}
          onSave={onSaveCategory} />
        <AllocateModal open={!!allocateWish}
          onClose={() => setAllocateWish(null)}
          item={allocateWish} unallocated={unallocated}
          onAllocate={onAllocateFunds} />
      </PhoneFrame>

      <TweaksPanel>
        <TweakSection title="Appearance">
          <TweakRadio label="Theme" value={settings.theme}
            onChange={(v) => updateSettings({ theme: v })}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]} />
          <TweakColor label="Accent" value={settings.accent}
            onChange={(v) => updateSettings({ accent: v })}
            options={['#C5703B', '#6B8E5A', '#4A6FA5', '#B85540', '#7E5A8C', '#3F8E7C']} />
          <TweakSelect label="Currency" value={settings.currency}
            onChange={(v) => updateSettings({ currency: v })}
            options={[
              { value: 'INR', label: 'Indian Rupee (₹)' },
              { value: 'USD', label: 'US Dollar ($)' },
              { value: 'EUR', label: 'Euro (€)' },
              { value: 'GBP', label: 'British Pound (£)' },
              { value: 'JPY', label: 'Japanese Yen (¥)' },
              { value: 'AED', label: 'UAE Dirham' },
              { value: 'SGD', label: 'Singapore Dollar' },
            ]} />
          <TweakSelect label="Palette" value={settings.palette}
            onChange={(v) => updateSettings({ palette: v })}
            options={[
              { value: 'sand', label: 'Warm Sand' },
              { value: 'linen', label: 'Cool Linen' },
              { value: 'slate', label: 'Soft Slate' },
              { value: 'paper', label: 'Bright Paper' },
            ]} />
        </TweakSection>

        <TweakSection title="Navigate">
          <TweakButton onClick={() => setShowSettings(s => !s)}>
            {showSettings ? 'Close settings' : 'Open Settings screen'}
          </TweakButton>
          <TweakButton onClick={onSignOut}>
            Sign out (show login)
          </TweakButton>
        </TweakSection>

        <TweakSection title="Try it">
          <TweakButton onClick={() => {
            const samples = [
              { amount: 285, category: 'Coffee', merchant: 'Blue Tokai' },
              { amount: 920, category: 'Dining', merchant: 'CTR' },
              { amount: 1450, category: 'Shopping', merchant: 'Phoenix Mall' },
              { amount: 199, category: 'Transport', merchant: 'Auto fare' },
            ];
            const s = samples[Math.floor(Math.random() * samples.length)];
            onAddTxn({
              id: 't_' + Math.random().toString(36).slice(2, 8),
              ...s,
              date: new Date().toISOString(),
              type: 'expense', status: 'pending', tags: [],
            });
          }}>
            Add a sample expense
          </TweakButton>
          <TweakButton onClick={() => {
            setTransactions(SEED_TRANSACTIONS);
            setWishlist(SEED_WISHLIST);
            setBudget(SEED_BUDGET);
          }}>
            Reset all data
          </TweakButton>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Phone frame wrapper
// ─────────────────────────────────────────────────────────────
function PhoneFrame({ children, dark, whiteStatusBar = false }) {
  const statusDark = dark || whiteStatusBar;
  return (
    <div style={{
      width: 402, height: 874, borderRadius: 56, overflow: 'hidden',
      position: 'relative', background: 'var(--bg)',
      boxShadow: '0 40px 100px rgba(0,0,0,0.35), 0 0 0 11px #1a1a1a, 0 0 0 12px #2a2a2a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif',
    }}>
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 50,
      }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, color: statusDark ? '#fff' : '#000' }}>
        <IOSStatusBar dark={statusDark} />
      </div>

      <div style={{ height: '100%', position: 'relative' }}>
        {children}
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60,
        height: 28, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        paddingBottom: 8, pointerEvents: 'none',
      }}>
        <div style={{
          width: 139, height: 5, borderRadius: 100,
          background: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.25)',
        }} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
