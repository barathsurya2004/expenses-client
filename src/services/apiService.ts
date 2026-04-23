import type { Transaction, Goal, CategorySpending, Insight } from '../types';

export const FINANCE_DATA_UPDATED_EVENT = 'finance:data-updated';

const emitFinanceDataUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(FINANCE_DATA_UPDATED_EVENT));
  }
};

const normalizeTransaction = (value: unknown): Transaction | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  const merchant = typeof candidate.merchant === 'string' ? candidate.merchant : null;
  const category = typeof candidate.category === 'string' ? candidate.category : null;
  const icon = typeof candidate.icon === 'string' ? candidate.icon : 'receipt_long';
  const rawDate =
    typeof candidate.date === 'string'
      ? candidate.date
      : typeof candidate.transactionDate === 'string'
        ? candidate.transactionDate
        : null;

  const rawAmount = candidate.amount;
  const amount =
    typeof rawAmount === 'number'
      ? rawAmount
      : typeof rawAmount === 'string'
        ? Number(rawAmount)
        : NaN;

  const type = candidate.type === 'income' || candidate.type === 'expense' ? candidate.type : null;
  const explicitId =
    typeof candidate.id === 'string'
      ? candidate.id
      : typeof candidate._id === 'string'
        ? candidate._id
        : typeof candidate.id === 'number'
          ? String(candidate.id)
          : typeof candidate._id === 'number'
            ? String(candidate._id)
            : null;

  if (!merchant || !category || !rawDate || !type || Number.isNaN(amount)) {
    return null;
  }

  const userId = typeof candidate.userId === 'string' ? candidate.userId : 'user';
  const fallbackId = `${userId}-${rawDate}-${merchant}-${amount}`;

  return {
    id: explicitId ?? fallbackId,
    merchant,
    category,
    amount,
    date: rawDate,
    type,
    icon,
  };
};

const normalizeTransactionArray = (payload: unknown): Transaction[] => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((value) => normalizeTransaction(value))
    .filter((transaction): transaction is Transaction => transaction !== null);
};

const sortTransactionsByDateDesc = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const normalizeTransactionsPayload = (payload: unknown): Transaction[] => {
  if (Array.isArray(payload)) {
    return sortTransactionsByDateDesc(normalizeTransactionArray(payload));
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.transactions)) {
      return sortTransactionsByDateDesc(normalizeTransactionArray(record.transactions));
    }

    if (Array.isArray(record.data)) {
      return sortTransactionsByDateDesc(normalizeTransactionArray(record.data));
    }

    if (Array.isArray(record.items)) {
      return sortTransactionsByDateDesc(normalizeTransactionArray(record.items));
    }

    const dateKeys = Object.keys(record).filter((key) => /^\d{4}-\d{2}-\d{2}/.test(key));
    if (dateKeys.length > 0) {
      const flattened = dateKeys.flatMap((dateKey) => {
        const value = record[dateKey];
        return Array.isArray(value) ? value : [];
      });

      return sortTransactionsByDateDesc(normalizeTransactionArray(flattened));
    }
  }

  return [];
};

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  incomeSources?: number;
  transactionCount?: number;
}

export interface BudgetHealthStats {
  healthScore: number;
  totalCategories: number;
  onTrackCount: number;
  overBudgetCount: number;
  healthBarColor: string;
  overBudgetCategories: Array<{
    name: string;
    icon: string;
    percentage: number;
    overage: number;
    colorHex: string;
  }>;
  onTrackCategories: Array<{
    name: string;
    icon: string;
    percentage: number;
    colorHex: string;
  }>;
}

export interface RecurringCostSummary {
  name: string;
  icon: string;
  color?: string;
  amount: number;
  isPaid: boolean;
  nextPayCycle: string;
  paidOn: string | null;
  recurringDayOfMonth?: number;
}

export interface BudgetOverviewData {
  totalBudget: number;
  totalSpent: number;
  totalProgress: number;
  categoryCount: number;
}

let apiAuthToken: string | null = null;

export const setApiAuthToken = (token: string | null) => {
  apiAuthToken = token;
};

const requestWithAuth = async (
  url: string,
  options: RequestInit = {},
  tokenOverride?: string | null,
): Promise<Response> => {
  const headers = new Headers(options.headers);
  const token = tokenOverride ?? apiAuthToken;

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    cache: 'no-store',
    ...options,
    headers,
  });
};

const fetchWithAuth = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const initialToken = apiAuthToken;
  let response = await requestWithAuth(url, options, initialToken);

  // Retry once if the first request raced before token hydration.
  if (response.status === 401 && !initialToken && apiAuthToken) {
    response = await requestWithAuth(url, options, apiAuthToken);
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }

  return response.json() as Promise<T>;
};

const fetchMaybeWithAuth = async <T>(url: string, options: RequestInit = {}): Promise<T | undefined> => {
  const initialToken = apiAuthToken;
  let response = await requestWithAuth(url, options, initialToken);

  // Retry once if the first request raced before token hydration.
  if (response.status === 401 && !initialToken && apiAuthToken) {
    response = await requestWithAuth(url, options, apiAuthToken);
  }

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }

  return response.json() as Promise<T>;
};

export const apiService = {
  // Accounting / Stats Service
  getMonthlySummary: async (): Promise<MonthlySummary> => {
    return fetchWithAuth<MonthlySummary>('/api/stats/monthly-summary');
  },

  getBiggestExpense: async (): Promise<{ amount: number; merchant: string; category: string } | null> => {
    const result = await fetchMaybeWithAuth<{ amount: number; merchant: string; category: string }>('/api/stats/biggest-expense');
    return result ?? null;
  },

  // Transaction Service
  getRecentTransactions: async (): Promise<Transaction[]> => {
    const payload = await fetchWithAuth<unknown>('/api/transactions/recent');
    return normalizeTransactionsPayload(payload);
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const payload = await fetchWithAuth<unknown>('/api/transactions');
    return normalizeTransactionsPayload(payload);
  },

  getTransactionById: async (id: string): Promise<Transaction | undefined> => {
    const payload = await fetchMaybeWithAuth<unknown>(`/api/transactions/${id}`);
    if (!payload) {
      return undefined;
    }

    return normalizeTransaction(payload) ?? undefined;
  },

  addTransaction: async (data: Omit<Transaction, 'id'>): Promise<Transaction> => {
    return fetchWithAuth<Transaction>('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    const response = await requestWithAuth(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update transaction');
    }

    const nextTransaction = await response.json() as Transaction;
    emitFinanceDataUpdated();
    return nextTransaction;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    const response = await requestWithAuth(`/api/transactions/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete transaction');
    }

    emitFinanceDataUpdated();
  },

  // Budget & Category Service
  getCategorySpending: async (): Promise<CategorySpending[]> => {
    return fetchWithAuth<CategorySpending[]>('/api/categories/spending');
  },

  getCategorySavings: async (): Promise<CategorySpending[]> => {
    return fetchWithAuth<CategorySpending[]>('/api/categories/savings');
  },

  getBudgetHealthStats: async (): Promise<BudgetHealthStats> => {
    return fetchWithAuth<BudgetHealthStats>('/api/budgets/health');
  },

  getSpendingDistribution: async (): Promise<any[]> => {
    return fetchWithAuth<any[]>('/api/budgets/spending-distribution');
  },

  getBudgetOverview: async (): Promise<BudgetOverviewData> => {
    return fetchWithAuth<BudgetOverviewData>('/api/budgets/overview');
  },

  addCategory: async (data: Omit<CategorySpending, 'percentage' | 'spent'>): Promise<CategorySpending> => {
    const response = await requestWithAuth('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to add category');
    }

    const newC = await response.json() as CategorySpending;
    emitFinanceDataUpdated();
    return newC;
  },

  // Subscription Service (Recurring Costs)
  getRecurringCosts: async (): Promise<RecurringCostSummary[]> => {
    return fetchWithAuth<RecurringCostSummary[]>('/api/subscriptions');
  },

  getRecurringCostById: async (id: string): Promise<RecurringCostSummary | undefined> => {
    return fetchMaybeWithAuth<RecurringCostSummary>(`/api/subscriptions/${encodeURIComponent(id)}`);
  },

  toggleRecurringPaidStatus: async (id: string, isPaid: boolean): Promise<RecurringCostSummary> => {
    const response = await requestWithAuth(`/api/subscriptions/${encodeURIComponent(id)}/toggle-paid`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPaid }),
    });

    if (!response.ok) {
      throw new Error('Failed to update recurring cost status');
    }

    const updated = await response.json() as RecurringCostSummary;
    emitFinanceDataUpdated();
    return updated;
  },

  // Goal Service
  getGoals: async (): Promise<Goal[]> => {
    return fetchWithAuth<Goal[]>('/api/goals');
  },

  getGoalById: async (id: string): Promise<Goal | undefined> => {
    return fetchMaybeWithAuth<Goal>(`/api/goals/${id}`);
  },

  addGoal: async (data: Omit<Goal, 'id'>): Promise<Goal> => {
    const response = await requestWithAuth('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to add goal');
    }

    const newG = await response.json() as Goal;
    emitFinanceDataUpdated();
    return newG;
  },

  updateGoal: async (id: string, updates: Partial<Goal>): Promise<Goal> => {
    const response = await requestWithAuth(`/api/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update goal');
    }

    const nextGoal = await response.json() as Goal;
    emitFinanceDataUpdated();
    return nextGoal;
  },

  contributeToGoal: async (id: string, amount: number): Promise<Goal> => {
    const response = await requestWithAuth(`/api/goals/${id}/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to contribute to goal');
    }

    const nextGoal = await response.json() as Goal;
    emitFinanceDataUpdated();
    return nextGoal;
  },

  deleteGoal: async (id: string): Promise<void> => {
    const response = await requestWithAuth(`/api/goals/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete goal');
    }

    emitFinanceDataUpdated();
  },

  // Insights Service
  getTopInsights: async (): Promise<Insight[]> => {
    return fetchWithAuth<Insight[]>('/api/insights/top');
  },

  getAllInsights: async (): Promise<Insight[]> => {
    return fetchWithAuth<Insight[]>('/api/insights/all');
  },

};
