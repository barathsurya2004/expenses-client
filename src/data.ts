import type { Transaction, WishlistItem, Budget, Subscription, CategoryMeta, Currency, CurrencyCode } from './types';
export type { CurrencyCode };

export const SEED_TRANSACTIONS: Transaction[] = [];

export const SEED_WISHLIST: WishlistItem[] = [];

export const SEED_BUDGET: Budget = {
  income: 0,
  tiers: {
    needs: { label: 'Fixed & Recurring', target: 0.50, categories: [] },
    savings: { label: 'Savings & Investments', target: 0.20, categories: [] },
    wants: { label: 'Discretionary', target: 0.30, categories: [] },
  }
};

export const SEED_SUBSCRIPTIONS: Subscription[] = [];

export const SEED_HISTORY: Record<string, number[]> = {};

export const PRIORITY_COLORS: Record<string, { bg: string, fg: string }> = {
  high:   { bg: 'var(--clay-tint)', fg: 'var(--clay)' },
  medium: { bg: 'var(--copper-tint)', fg: 'var(--copper)' },
  low:    { bg: 'var(--blue-tint)', fg: 'var(--blue)' },
};

export const CATEGORY_META: Record<string, CategoryMeta> = {
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

export const CATEGORY_LIST = Object.keys(CATEGORY_META);

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  INR: { symbol: '₹', rate: 1,       grouping: 'indian',  decimals: 0 },
  USD: { symbol: '$', rate: 1/83,    grouping: 'western', decimals: 0 },
  EUR: { symbol: '€', rate: 1/90,    grouping: 'western', decimals: 0 },
  GBP: { symbol: '£', rate: 1/105,   grouping: 'western', decimals: 0 },
  JPY: { symbol: '¥', rate: 0.55,    grouping: 'western', decimals: 0 },
  AED: { symbol: 'AED ', rate: 1/22, grouping: 'western', decimals: 0 },
  SGD: { symbol: 'S$', rate: 1/62,   grouping: 'western', decimals: 0 },
};

// Global state simulation for now (should be replaced with React State/Context)
let currentCurrency: CurrencyCode = 'INR';

export function setAppCurrency(code: CurrencyCode) {
  if (CURRENCIES[code]) currentCurrency = code;
}
export function getAppCurrency(): CurrencyCode { return currentCurrency; }
export function currencySymbol() { return CURRENCIES[currentCurrency].symbol; }

function groupIndian(intStr: string) {
  const last3 = intStr.slice(-3);
  let rest = intStr.slice(0, -3);
  if (rest) rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return rest ? rest + ',' + last3 : last3;
}
function groupWestern(intStr: string) {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function fmtINR(nInr: number, opts: { sign?: boolean, decimals?: number } = {}) {
  const { sign = false, decimals } = opts;
  const cur = CURRENCIES[currentCurrency] || CURRENCIES.INR;
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

export function fmtCompact(nInr: number) {
  const cur = CURRENCIES[currentCurrency] || CURRENCIES.INR;
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

export function dayKey(d: string | Date) {
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

export function relativeDay(d: string | Date) {
  const dt = new Date(d);
  const today = new Date();
  const dtMidnight = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((todayMidnight.getTime() - dtMidnight.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7 && diffDays > 0) return dt.toLocaleDateString('en-US', { weekday: 'long' });
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function relativeTime(d: string | Date) {
  const dt = new Date(d);
  return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
