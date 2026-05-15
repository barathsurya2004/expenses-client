// Sample data + state shape

const SEED_TRANSACTIONS = [
  // Today
  { id: 't1', amount: 480, category: 'Groceries', merchant: 'BigBasket', date: '2026-05-14T09:12:00', type: 'expense', status: 'pending', tags: ['weekly'] },
  { id: 't2', amount: 220, category: 'Transport', merchant: 'Uber — Indiranagar', date: '2026-05-14T08:30:00', type: 'expense', status: 'cleared', tags: [] },
  { id: 't3', amount: 145, category: 'Coffee', merchant: 'Third Wave Coffee', date: '2026-05-14T07:55:00', type: 'expense', status: 'cleared', tags: ['guilty-pleasure'] },
  // Yesterday
  { id: 't4', amount: 1280, category: 'Dining', merchant: 'Toit Brewpub', date: '2026-05-13T20:42:00', type: 'expense', status: 'cleared', tags: ['friends'] },
  { id: 't5', amount: 199, category: 'Subscriptions', merchant: 'Netflix', date: '2026-05-13T11:00:00', type: 'expense', status: 'cleared', tags: ['recurring'] },
  { id: 't6', amount: 350, category: 'Transport', merchant: 'Namma Metro', date: '2026-05-13T09:14:00', type: 'expense', status: 'cleared', tags: [] },
  // 2 days
  { id: 't7', amount: 2400, category: 'Shopping', merchant: 'Decathlon', date: '2026-05-12T17:30:00', type: 'expense', status: 'cleared', tags: ['fitness'] },
  { id: 't8', amount: 145, category: 'Coffee', merchant: 'Blue Tokai', date: '2026-05-12T08:10:00', type: 'expense', status: 'cleared', tags: ['guilty-pleasure'] },
  // This week
  { id: 't9', amount: 35000, category: 'Salary', merchant: 'Acme Corp', date: '2026-05-11T09:00:00', type: 'income', status: 'cleared', tags: ['salary'] },
  { id: 't10', amount: 880, category: 'Dining', merchant: 'Truffles', date: '2026-05-11T13:20:00', type: 'expense', status: 'cleared', tags: [] },
  { id: 't11', amount: 1450, category: 'Groceries', merchant: 'Nature\u2019s Basket', date: '2026-05-10T11:00:00', type: 'expense', status: 'cleared', tags: ['weekly'] },
  { id: 't12', amount: 320, category: 'Coffee', merchant: 'Araku Coffee', date: '2026-05-09T08:30:00', type: 'expense', status: 'cleared', tags: ['guilty-pleasure'] },
  { id: 't13', amount: 4500, category: 'Hobbies', merchant: 'Crossword Books', date: '2026-05-08T16:00:00', type: 'expense', status: 'cleared', tags: ['art-supplies'] },
  // Last week
  { id: 't14', amount: 35000, category: 'Rent', merchant: 'Landlord transfer', date: '2026-05-05T10:00:00', type: 'expense', status: 'cleared', tags: ['recurring'] },
  { id: 't15', amount: 1850, category: 'Utilities', merchant: 'BESCOM', date: '2026-05-04T18:00:00', type: 'expense', status: 'cleared', tags: ['recurring'] },
  { id: 't16', amount: 599, category: 'Subscriptions', merchant: 'Spotify Family', date: '2026-05-03T11:00:00', type: 'expense', status: 'cleared', tags: ['recurring'] },
  { id: 't17', amount: 15000, category: 'SIP', merchant: 'Parag Parikh Flexi', date: '2026-05-02T09:00:00', type: 'expense', status: 'cleared', tags: ['investment'] },
  { id: 't18', amount: 1300, category: 'Dining', merchant: 'Burma Burma', date: '2026-05-02T20:00:00', type: 'expense', status: 'cleared', tags: ['friends'] },
];

const SEED_WISHLIST = [
  { id: 'w1', name: 'Sony WH-1000XM6', price: 34990, saved: 18500, priority: 'high', emoji: '🎧', allocation: 3500,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
    category: 'Audio', brand: 'Sony', url: 'sony.com',
    notes: 'Industry-leading noise cancellation. Replace the XM4s once flights pick back up.' },
  { id: 'w2', name: 'Kyoto trip, 8 days', price: 145000, saved: 42000, priority: 'high', emoji: '🗾', allocation: 8000,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    category: 'Travel', brand: 'Trip', url: 'self-planned',
    notes: 'Late April cherry blossom window. Flights + ryokan + day in Nara.' },
  { id: 'w3', name: 'Aer Travel Pack 3', price: 22500, saved: 22500, priority: 'medium', emoji: '🎒', allocation: 0,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    category: 'Gear', brand: 'Aer', url: 'aersf.com',
    notes: 'Carry-on ready. Funded — order anytime.' },
  { id: 'w4', name: 'Mechanical keyboard', price: 18900, saved: 4200, priority: 'medium', emoji: '⌨️', allocation: 1500,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    category: 'Desk setup', brand: 'Keychron Q1', url: 'keychron.com',
    notes: 'Custom build — gateron browns, PBT keycaps.' },
  { id: 'w5', name: 'Iaido starter set', price: 28000, saved: 2400, priority: 'low', emoji: '⚔️', allocation: 800,
    image: 'https://images.unsplash.com/photo-1583499871880-de841d1ace2a?w=800&q=80',
    category: 'Hobby', brand: 'Tozando', url: 'tozandoshop.com',
    notes: 'Iaito + obi + dogi. Get past beginner cycle first.' },
  { id: 'w6', name: 'JLPT N4 registration', price: 6200, saved: 1800, priority: 'high', emoji: '🇯🇵', allocation: 1200,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
    category: 'Education', brand: 'JLPT', url: 'jlpt.jp',
    notes: 'July sitting. Need to register by April 30.' },
];

// Budget — INR, monthly allocations and current actuals
const SEED_BUDGET = {
  income: 145000,
  tiers: {
    needs: { label: 'Fixed & Recurring', target: 0.50, categories: [
      { id: 'rent', name: 'Rent', limit: 35000, spent: 35000, icon: 'home', color: 'blue', frequency: 'monthly', paid: true, due: 'May 1' },
      { id: 'electricity', name: 'Electricity', limit: 1850, spent: 1850, icon: 'zap', color: 'amber', frequency: 'monthly', paid: true, due: 'May 4' },
      { id: 'internet', name: 'Internet', limit: 1199, spent: 0, icon: 'wifi', color: 'blue', frequency: 'monthly', paid: false, due: 'May 20' },
      { id: 'phone', name: 'Phone', limit: 599, spent: 599, icon: 'phone', color: 'green', frequency: 'monthly', paid: true, due: 'May 5' },
      { id: 'subs', name: 'Subscriptions', limit: 1500, spent: 798, icon: 'repeat', color: 'plum', frequency: 'monthly', paid: false, due: 'May 22' },
      { id: 'gym', name: 'Gym', limit: 1499, spent: 0, icon: 'dumbbell', color: 'clay', frequency: 'monthly', paid: false, due: 'May 27' },
    ]},
    savings: { label: 'Savings & Investments', target: 0.20, categories: [
      { id: 'sip', name: 'SIP — Index', limit: 15000, spent: 15000, icon: 'trending-up', color: 'green' },
      { id: 'emerg', name: 'Emergency fund', limit: 8000, spent: 8000, icon: 'shield', color: 'green' },
      { id: 'wish', name: 'Wishlist pool', limit: 15000, spent: 15000, icon: 'star', color: 'copper' },
    ]},
    wants: { label: 'Discretionary', target: 0.30, categories: [
      { id: 'groceries', name: 'Groceries', limit: 12000, spent: 1930, icon: 'shopping-bag', color: 'green' },
      { id: 'transport', name: 'Transport', limit: 4000, spent: 570, icon: 'car', color: 'blue' },
      { id: 'dining', name: 'Dining', limit: 5000, spent: 3460, icon: 'utensils', color: 'copper' },
      { id: 'coffee', name: 'Coffee', limit: 2000, spent: 610, icon: 'coffee', color: 'amber' },
      { id: 'shopping', name: 'Shopping', limit: 6000, spent: 2400, icon: 'shopping-cart', color: 'plum' },
      { id: 'hobbies', name: 'Hobbies', limit: 4000, spent: 4500, icon: 'palette', color: 'clay' },
      { id: 'entertainment', name: 'Entertainment', limit: 2000, spent: 200, icon: 'film', color: 'blue' },
    ]},
  }
};

// Subscriptions for audit
const SEED_SUBSCRIPTIONS = [
  { id: 's1', name: 'Netflix', amount: 199, prevAmount: 149, raised: true, frequency: 'monthly', renew: 'May 22' },
  { id: 's2', name: 'Spotify Family', amount: 599, prevAmount: 599, raised: false, frequency: 'monthly', renew: 'Jun 03' },
  { id: 's3', name: 'iCloud 200GB', amount: 219, prevAmount: 219, raised: false, frequency: 'monthly', renew: 'May 28' },
  { id: 's4', name: 'Notion', amount: 750, prevAmount: 750, raised: false, frequency: 'monthly', renew: 'Jun 10' },
  { id: 's5', name: 'Audible', amount: 199, prevAmount: 199, raised: false, frequency: 'monthly', renew: 'May 30', warning: 'unused 47 days' },
];

// Monthly history for insight charts (last 12 months)
const SEED_HISTORY = {
  Dining:        [3200, 3400, 3000, 3650, 3800, 4100, 4300, 4500, 4700, 4900, 5100, 3460],
  Coffee:        [ 850,  920,  900, 1100, 1200, 1300, 1500, 1700, 1900, 2050, 2200,  610],
  Groceries:     [10500,11000,10200,10800,11500,11800,12000,12300,12100,11900,12200,1930],
  Shopping:      [4500, 3200, 5500, 6800, 4900, 5200, 6100, 5800, 6900, 7500, 6200, 2400],
  Transport:     [3400, 3600, 3500, 3800, 3700, 3900, 4000, 4200, 4100, 4000, 4200,  570],
  Hobbies:       [1200, 2400, 1800, 3000, 4500, 2200, 3800, 4000, 4200, 4400, 4800, 4500],
  Entertainment: [1800, 1900, 1500, 1700, 2000, 1800, 2100, 1900, 2200, 2000, 1800,  200],
};

const PRIORITY_COLORS = {
  high:   { bg: 'var(--clay-tint)', fg: 'var(--clay)' },
  medium: { bg: 'var(--copper-tint)', fg: 'var(--copper)' },
  low:    { bg: 'var(--blue-tint)', fg: 'var(--blue)' },
};

const CATEGORY_META = {
  Groceries:    { icon: 'shopping-bag', color: 'green' },
  Transport:    { icon: 'car', color: 'blue' },
  Coffee:       { icon: 'coffee', color: 'amber' },
  Dining:       { icon: 'utensils', color: 'copper' },
  Subscriptions:{ icon: 'repeat', color: 'plum' },
  Shopping:     { icon: 'shopping-cart', color: 'plum' },
  Salary:       { icon: 'briefcase', color: 'green' },
  Rent:         { icon: 'home', color: 'blue' },
  Utilities:    { icon: 'zap', color: 'amber' },
  Electricity:  { icon: 'zap', color: 'amber' },
  Internet:     { icon: 'wifi', color: 'blue' },
  Phone:        { icon: 'phone', color: 'green' },
  Gym:          { icon: 'dumbbell', color: 'clay' },
  SIP:          { icon: 'trending-up', color: 'green' },
  Hobbies:      { icon: 'palette', color: 'clay' },
  Entertainment:{ icon: 'film', color: 'blue' },
};

const CATEGORY_LIST = Object.keys(CATEGORY_META);

// Currency registry. Base unit = INR.
// rate = how many display-units per 1 INR.
const CURRENCIES = {
  INR: { symbol: '₹', rate: 1,       grouping: 'indian',  decimals: 0 },
  USD: { symbol: '$', rate: 1/83,    grouping: 'western', decimals: 0 },
  EUR: { symbol: '€', rate: 1/90,    grouping: 'western', decimals: 0 },
  GBP: { symbol: '£', rate: 1/105,   grouping: 'western', decimals: 0 },
  JPY: { symbol: '¥', rate: 0.55,    grouping: 'western', decimals: 0 },
  AED: { symbol: 'AED ', rate: 1/22, grouping: 'western', decimals: 0 },
  SGD: { symbol: 'S$', rate: 1/62,   grouping: 'western', decimals: 0 },
};

// Mutable runtime config — Settings page flips this.
window.__APP_CURRENCY = window.__APP_CURRENCY || 'INR';
function setAppCurrency(code) {
  if (CURRENCIES[code]) window.__APP_CURRENCY = code;
}
function getAppCurrency() { return window.__APP_CURRENCY; }
function currencySymbol() { return CURRENCIES[window.__APP_CURRENCY].symbol; }

function groupIndian(intStr) {
  const last3 = intStr.slice(-3);
  let rest = intStr.slice(0, -3);
  if (rest) rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return rest ? rest + ',' + last3 : last3;
}
function groupWestern(intStr) {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format money. Function name kept as fmtINR for compatibility — outputs current currency.
function fmtINR(nInr, opts = {}) {
  const { sign = false, decimals } = opts;
  const cur = CURRENCIES[window.__APP_CURRENCY] || CURRENCIES.INR;
  const d = decimals != null ? decimals : cur.decimals;
  const converted = nInr * cur.rate;
  const abs = Math.abs(Math.round(converted * Math.pow(10, d)) / Math.pow(10, d));
  const parts = abs.toFixed(d).split('.');
  const grouped = cur.grouping === 'indian' ? groupIndian(parts[0]) : groupWestern(parts[0]);
  const out = grouped + (parts[1] ? '.' + parts[1] : '');
  if (sign && converted > 0) return '+' + cur.symbol + out;
  if (converted < 0) return '−' + cur.symbol + out;
  return cur.symbol + out;
}

function fmtCompact(nInr) {
  const cur = CURRENCIES[window.__APP_CURRENCY] || CURRENCIES.INR;
  const n = nInr * cur.rate;
  const abs = Math.abs(n);
  if (cur.grouping === 'indian') {
    if (abs >= 10000000) return (n / 10000000).toFixed(1) + 'Cr';
    if (abs >= 100000) return (n / 100000).toFixed(1) + 'L';
    if (abs >= 1000) return (n / 1000).toFixed(1) + 'K';
    return Math.round(n).toString();
  }
  if (abs >= 1_000_000_000) return (n / 1e9).toFixed(1) + 'B';
  if (abs >= 1_000_000) return (n / 1e6).toFixed(1) + 'M';
  if (abs >= 1000) return (n / 1000).toFixed(1) + 'K';
  return Math.round(n).toString();
}

function dayKey(d) {
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

function relativeDay(d) {
  const dt = new Date(d);
  const today = new Date('2026-05-14T00:00:00');
  const dtMidnight = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const diffDays = Math.round((today - dtMidnight) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7 && diffDays > 0) return dt.toLocaleDateString('en-US', { weekday: 'long' });
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function relativeTime(d) {
  const dt = new Date(d);
  return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

Object.assign(window, {
  SEED_TRANSACTIONS, SEED_WISHLIST, SEED_BUDGET, SEED_SUBSCRIPTIONS, SEED_HISTORY,
  PRIORITY_COLORS, CATEGORY_META, CATEGORY_LIST,
  fmtINR, fmtCompact, dayKey, relativeDay, relativeTime,
  CURRENCIES, setAppCurrency, getAppCurrency, currencySymbol,
});
