import { useState, useEffect, useMemo } from 'react';
import type { Transaction, WishlistItem, Budget, CurrencyCode, BudgetCategory } from './types';
import { SEED_TRANSACTIONS, SEED_WISHLIST, SEED_BUDGET, setAppCurrency } from './data';
import { TabBar, FAB } from './components/Common';
import { Dashboard } from './pages/Dashboard';
import { Budget as BudgetPage } from './pages/Budget';
import { Insights } from './pages/Insights';
import { Wishlist } from './pages/Wishlist';
import { WishlistDetail } from './pages/WishlistDetail';
import { Transactions } from './pages/Transactions';
import { SettingsScreen } from './pages/SettingsScreen';
import { LoginScreen } from './pages/LoginScreen';
import { AddTransactionModal, AddWishlistModal, EditCategoryModal, TransactionEditModal, AllocateModal } from './components/Modals';

// Persistence helpers (v2 to clear previous dummy data)
const STORAGE_KEYS = {
  SETTINGS: 'finance_settings_v2',
  USER: 'finance_user_v2',
  TRANSACTIONS: 'finance_transactions_v2',
  WISHLIST: 'finance_wishlist_v2',
  BUDGET: 'finance_budget_v2',
  UNALLOCATED: 'finance_unallocated_v2'
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.warn(`Error loading ${key}:`, e);
    return fallback;
  }
}

function saveToStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving ${key}:`, e);
  }
}

export default function App() {
  // App state
  const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.USER, { name: '', email: '', signedIn: false }));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS));
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => loadFromStorage(STORAGE_KEYS.WISHLIST, SEED_WISHLIST));
  const [budget, setBudget] = useState<Budget>(() => loadFromStorage(STORAGE_KEYS.BUDGET, SEED_BUDGET));
  const [unallocated, setUnallocated] = useState(() => loadFromStorage(STORAGE_KEYS.UNALLOCATED, 0));

  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal / Detail state
  const [activeWish, setActiveWish] = useState<WishlistItem | null>(null);
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [showAddWish, setShowAddWish] = useState(false);
  const [editingWish, setEditingWish] = useState<WishlistItem | null>(null);
  const [editingCat, setEditingCat] = useState<{ cat: BudgetCategory, tier: string } | null>(null);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [allocatingWish, setAllocatingWish] = useState<WishlistItem | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [settings, setSettings] = useState(() => loadFromStorage(STORAGE_KEYS.SETTINGS, {
    currency: 'INR' as CurrencyCode,
    theme: 'light' as 'light' | 'dark',
    accent: '#C5703B',
    palette: 'sand',
  }));

  // Auto-save Effects
  useEffect(() => saveToStorage(STORAGE_KEYS.SETTINGS, settings), [settings]);
  useEffect(() => saveToStorage(STORAGE_KEYS.USER, user), [user]);
  useEffect(() => saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions), [transactions]);
  useEffect(() => saveToStorage(STORAGE_KEYS.WISHLIST, wishlist), [wishlist]);
  useEffect(() => saveToStorage(STORAGE_KEYS.BUDGET, budget), [budget]);
  useEffect(() => saveToStorage(STORAGE_KEYS.UNALLOCATED, unallocated), [unallocated]);

  // Derived stats
  const dynamicIncome = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return transactions
      .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
      .reduce((a, t) => a + t.amount, 0);
  }, [transactions]);

  useEffect(() => {
    setBudget(prev => ({ ...prev, income: dynamicIncome }));
  }, [dynamicIncome]);

  useEffect(() => {
    setAppCurrency(settings.currency);
  }, [settings.currency]);

  // ── Recurring Auto-Processor ──
  useEffect(() => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const today = now.getDate();
    let hasChanges = false;
    const newTxns: Transaction[] = [];

    const nextBudget = JSON.parse(JSON.stringify(budget));

    nextBudget.tiers.needs.categories.forEach((cat: BudgetCategory) => {
      if (!cat.dueDay) return;

      // 1. Auto-Deduct Logic
      // If today is >= due day and we haven't processed this month yet
      if (today >= cat.dueDay && cat.lastProcessedMonth !== currentMonthKey) {
        const start = cat.startDate ? new Date(cat.startDate) : null;
        if (!start || now >= start) {
          const autoTxn: Transaction = {
            id: 'auto_' + Math.random().toString(36).slice(2, 8),
            amount: cat.limit,
            category: cat.name,
            merchant: `${cat.name} (Auto-pay)`,
            date: now.toISOString(),
            type: 'expense',
            status: 'cleared',
            tags: ['auto-pay']
          };
          newTxns.push(autoTxn);
          cat.paid = true;
          cat.lastProcessedMonth = currentMonthKey;
          hasChanges = true;
        }
      }

      // 2. Reset Status Logic
      // If we are within 7 days of the due day (and not yet at the due day)
      // and it's currently marked as 'paid', reset it for the upcoming cycle.
      const daysUntilDue = cat.dueDay - today;
      if (daysUntilDue > 0 && daysUntilDue <= 7 && cat.paid) {
        cat.paid = false;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      if (newTxns.length > 0) setTransactions(prev => [...newTxns, ...prev]);
      setBudget(nextBudget);
    }
  }, [budget, transactions.length, user.signedIn]);

  const state = { transactions, wishlist, budget: { ...budget, income: dynamicIncome }, unallocated, user };

  const renderContent = () => {
    if (activeWish) return (
      <WishlistDetail
        item={activeWish}
        state={state}
        onBack={() => setActiveWish(null)}
        onEdit={() => { setEditingWish(activeWish); setShowAddWish(true); }}
        onAdjustAllocation={(id, val) => setWishlist(prev => prev.map(w => w.id === id ? { ...w, allocation: val } : w))}
        onAllocate={() => setAllocatingWish(activeWish)}
      />
    );

    if (showSettings) return (
      <SettingsScreen
        user={user}
        settings={settings}
        onUpdate={(patch) => {
          if (patch.user) setUser(prev => ({ ...prev, ...patch.user }));
          else setSettings(prev => ({ ...prev, ...patch }));
        }}
        onSignOut={() => setUser(prev => ({ ...prev, signedIn: false }))}
        onBack={() => setShowSettings(false)}
      />
    );

    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} setActiveTab={setActiveTab} onFAB={() => setShowAddTxn(true)} onEditTxn={setEditingTxn} onOpenWish={setActiveWish} onOpenSettings={() => setShowSettings(true)} />;
      case 'budget':    return <BudgetPage state={state} onEditCategory={(cat, tier) => setEditingCat({ cat, tier })} onAddCategory={(tier) => setEditingCat({ cat: null as any, tier })} onTogglePaid={(id) => {
        setBudget(prev => {
          const next = { ...prev };
          const now = new Date();
          const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          Object.values(next.tiers).forEach(t => {
            t.categories = t.categories.map(c => {
              if (c.id === id) {
                const nextPaid = !c.paid;
                return { 
                  ...c, 
                  paid: nextPaid,
                  // If marking as paid manually, also set lastProcessedMonth to avoid auto-double-pay
                  lastProcessedMonth: nextPaid ? currentMonthKey : c.lastProcessedMonth
                };
              }
              return c;
            });
          });
          return next;
        });
      }} />;
      case 'insights':  return <Insights state={state} />;
      case 'wishlist':  return <Wishlist state={state} onAdd={() => setShowAddWish(true)} onOpen={setActiveWish} onAllocate={setAllocatingWish} />;
      case 'transactions': return <Transactions state={state} onEditTxn={setEditingTxn} setTransactions={setTransactions} onDeleteTxn={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} />;
      default: return null;
    }
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  // Background palette overrides per theme
  const PALETTE_VARS: Record<string, { light: Record<string, string>, dark: Record<string, string> }> = {
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

  useEffect(() => {
    const p = PALETTE_VARS[settings.palette];
    if (!p) return;
    const vars = p[settings.theme];
    Object.entries(vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  }, [settings.palette, settings.theme]);

  // Apply accent color
  useEffect(() => {
    const ACCENT_MAP: Record<string, { light: string, dark: string, softLight: string, softDark: string }> = {
      '#C5703B': { light: '#C5703B', dark: '#E89865', softLight: '#E89865', softDark: '#F0AE82' }, // Copper
      '#6B8E5A': { light: '#6B8E5A', dark: '#8FB079', softLight: '#8FB079', softDark: '#A6C592' }, // Eucalyptus
      '#4A6FA5': { light: '#4A6FA5', dark: '#7B9CC9', softLight: '#7B9CC9', softDark: '#9DB8DC' }, // Indigo
      '#B85540': { light: '#B85540', dark: '#D87560', softLight: '#D87560', softDark: '#E49282' }, // Clay
      '#7E5A8C': { light: '#7E5A8C', dark: '#A881B5', softLight: '#A881B5', softDark: '#BD9DC8' }, // Plum
      '#3F8E7C': { light: '#3F8E7C', dark: '#5EB09E', softLight: '#5EB09E', softDark: '#7DC0B1' }, // Sea Glass
    };

    const config = ACCENT_MAP[settings.accent] || ACCENT_MAP['#C5703B'];
    const color = settings.theme === 'dark' ? config.dark : config.light;
    const soft = settings.theme === 'dark' ? config.softDark : config.softLight;

    document.documentElement.style.setProperty('--copper', color);
    document.documentElement.style.setProperty('--copper-soft', soft);
    
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const tintOpacity = settings.theme === 'dark' ? 0.16 : 0.12;
    document.documentElement.style.setProperty('--copper-tint', `rgba(${r},${g},${b},${tintOpacity})`);
    document.documentElement.style.setProperty('--shadow-fab', `0 6px 20px rgba(${r},${g},${b},0.35), 0 2px 6px rgba(0,0,0,0.15)`);
  }, [settings.accent, settings.theme]);

  if (!user.signedIn) {
    return (
      <div data-theme={settings.theme} className="native-container">
        <LoginScreen onSignIn={(u) => setUser({ ...u, signedIn: true })} />
      </div>
    );
  }

  // ── Handlers ──
  const syncBudgetWithTxns = (txns: Transaction[], currentBudget: Budget) => {
    const next = JSON.parse(JSON.stringify(currentBudget));
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Reset all spent values and clear auto-paid status for fixed categories
    Object.values(next.tiers).forEach((t: any) => {
      t.categories.forEach((c: any) => {
        c.spent = 0;
        // We don't reset 'paid' manually set by user, but we will auto-set it below
      });
    });

    txns.forEach(t => {
      const d = new Date(t.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'expense') {
        for (const tierKey of Object.keys(next.tiers)) {
          const tier = next.tiers[tierKey as keyof Budget['tiers']];
          const cat = tier.categories.find((c: any) => c.name === t.category);
          if (cat) {
            cat.spent += t.amount;
            // If it's a fixed category and amount matches or exceeds limit, mark as paid
            if (tierKey === 'needs' && cat.spent >= cat.limit) {
              cat.paid = true;
            }
          }
        }
      }
    });
    return next;
  };

  const handleAddTxn = (data: any) => {
    if (data.type === 'recurring_update') {
      setBudget(prev => {
        const next = { ...prev };
        next.tiers.needs.categories = next.tiers.needs.categories.map(c => 
          c.id === data.id ? { ...c, paid: data.paid } : c
        );
        return next;
      });
    } else {
      const nextTxns = [data, ...transactions];
      setTransactions(nextTxns);
      setBudget(prev => syncBudgetWithTxns(nextTxns, prev));
    }
  };

  const handleEditTxn = (updated: Transaction) => {
    const nextTxns = transactions.map(t => t.id === updated.id ? updated : t);
    setTransactions(nextTxns);
    setBudget(prev => syncBudgetWithTxns(nextTxns, prev));
  };

  const handleDeleteTxn = (id: string) => {
    const nextTxns = transactions.filter(t => t.id !== id);
    setTransactions(nextTxns);
    setBudget(prev => syncBudgetWithTxns(nextTxns, prev));
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    } as any}>
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }} className="phone-scroll">
        {renderContent()}
      </div>

      {!activeWish && !showSettings && (
        <>
          <TabBar active={activeTab} onChange={setActiveTab} dark={settings.theme === 'dark'} />
          <FAB onClick={() => setShowAddTxn(true)} />
        </>
      )}

      {/* Modals */}
      <AddTransactionModal 
        open={showAddTxn} 
        onClose={() => setShowAddTxn(false)} 
        budgetTiers={state.budget.tiers}
        onSave={handleAddTxn} 
      />
      <AddWishlistModal 
        open={showAddWish} 
        editing={editingWish} 
        onClose={() => { setShowAddWish(false); setEditingWish(null); }} 
        onSave={(w) => {
          if (editingWish) setWishlist(prev => prev.map(i => i.id === w.id ? w : i));
          else setWishlist(prev => [w, ...prev]);
        }} 
        onDelete={(id) => {
          setWishlist(prev => prev.filter(w => w.id !== id));
          setActiveWish(null);
        }}
      />
      <EditCategoryModal 
        open={!!editingCat} 
        category={editingCat?.cat || null} 
        currentTier={editingCat?.tier || 'wants'} 
        mode={editingCat?.cat ? 'edit' : 'new'} 
        onClose={() => setEditingCat(null)} 
        onSave={(cat, tier, mode) => {
          setBudget(prev => {
            const next = { ...prev };
            const t = next.tiers[tier as keyof Budget['tiers']];
            if (mode === 'new') t.categories.push(cat);
            else t.categories = t.categories.map(c => c.id === cat.id ? cat : c);
            return syncBudgetWithTxns(transactions, next);
          });
        }} 
        onDelete={(id, tier) => {
          setBudget(prev => {
            const next = { ...prev };
            const t = next.tiers[tier as keyof Budget['tiers']];
            t.categories = t.categories.filter(c => c.id !== id);
            return next;
          });
        }}
      />
      <TransactionEditModal open={!!editingTxn} txn={editingTxn} onClose={() => setEditingTxn(null)} onSave={handleEditTxn} onDelete={handleDeleteTxn} />
      <AllocateModal open={!!allocatingWish} item={allocatingWish} unallocated={unallocated} onAllocate={(id, amt) => {
        setWishlist(prev => prev.map(w => w.id === id ? { ...w, saved: w.saved + amt } : w));
        setUnallocated(prev => prev - amt);
      }} onClose={() => setAllocatingWish(null)} />
    </div>
  );
}
