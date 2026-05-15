export type TransactionType = 'expense' | 'income';
export type TransactionStatus = 'pending' | 'cleared';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  merchant: string;
  date: string;
  type: TransactionType;
  status: TransactionStatus;
  tags: string[];
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  saved: number;
  priority: 'high' | 'medium' | 'low';
  emoji: string;
  allocation: number;
  image: string;
  category: string;
  brand: string;
  url: string;
  notes: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
  spent: number;
  icon: string;
  color: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  customCount?: number;
  customUnit?: 'days' | 'weeks' | 'months';
  paid?: boolean;
  due?: string;
  dueDay?: number;
  startDate?: string;
  lastProcessedMonth?: string; // YYYY-MM
  notes?: string;
}

export interface BudgetTier {
  label: string;
  target: number;
  categories: BudgetCategory[];
}

export interface Budget {
  income: number;
  tiers: {
    needs: BudgetTier;
    savings: BudgetTier;
    wants: BudgetTier;
  };
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  prevAmount: number;
  raised: boolean;
  frequency: string;
  renew: string;
  warning?: string;
}

export interface CategoryMeta {
  icon: string;
  color: string;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED' | 'SGD';

export interface Currency {
  symbol: string;
  rate: number;
  grouping: 'indian' | 'western';
  decimals: number;
}
