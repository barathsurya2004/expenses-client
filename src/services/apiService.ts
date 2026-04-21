import type { Transaction, Goal, CategorySpending, Insight } from '../types';

export const FINANCE_DATA_UPDATED_EVENT = 'finance:data-updated';

const emitFinanceDataUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(FINANCE_DATA_UPDATED_EVENT));
  }
};

export interface DashboardSummary {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  recentTransactions: {
    date: string;
    label: string;
    items: Transaction[];
  }[];
  goals: Goal[];
  categories: CategorySpending[];
  insights: Insight[];
}

export interface GroupedTransactions {
  date: string;
  label: string;
  items: Transaction[];
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalProgress: number;
  spendingCategories: CategorySpending[];
  savingsCategories: CategorySpending[];
  recurringCategories: CategorySpending[];
  recurringCards: RecurringCostSummary[];
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

export interface InsightsPageData {
  header: {
    monthLabel: string;
    dayOfMonth: number;
    daysInMonth: number;
    daysRemaining: number;
  };
  pulseStats: Array<{
    icon: string;
    label: string;
    value: string;
    sub: string;
    colorHex: string | null;
  }>;
  budgetHealth: {
    totalCategories: number;
    healthScore: number;
    onTrackCount: number;
    overBudgetCount: number;
    healthBarColor: string;
  };
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
  daySpend: Array<{
    day: string;
    amount: number;
    isPeak: boolean;
    heightPercent: number;
  }>;
  peakDay: string;
  topMerchants: Array<{
    merchant: string;
    count: number;
    rank: number;
    progress: number;
    opacity: number;
  }>;
  biggestExpense: {
    amount: number;
    merchant: string;
    category: string;
  } | null;
  recurring: {
    recurringPct: number;
    recurringTotal: number;
    savingsRate: number;
    discretionaryPct: number;
  };
  last6Months: string[];
  savingsColorHex: string;
  healthBarColorHex: string;
  categoryRows: Array<{
    name: string;
    icon: string;
    percentage: number;
    colorHex: string;
  }>;
  insights: Insight[];
  transactions: Transaction[];
}

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }

  return response.json() as Promise<T>;
};

const fetchMaybeJson = async <T>(url: string): Promise<T | undefined> => {
  const response = await fetch(url, { cache: 'no-store' });
  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }

  return response.json() as Promise<T>;
};

export const apiService = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    return fetchJson<DashboardSummary>('/api/dashboard-summary');
  },

  getTransactionsGrouped: async (): Promise<GroupedTransactions[]> => {
    return fetchJson<GroupedTransactions[]>('/api/transactions-grouped');
  },

  getTransactionById: async (id: string): Promise<Transaction | undefined> => {
    return fetchMaybeJson<Transaction>(`/api/transactions/${id}`);
  },

  getGoals: async (): Promise<Goal[]> => {
    return fetchJson<Goal[]>('/api/goals');
  },

  getGoalById: async (id: string): Promise<Goal | undefined> => {
    return fetchMaybeJson<Goal>(`/api/goals/${id}`);
  },

  getCategories: async (): Promise<CategorySpending[]> => {
    return fetchJson<CategorySpending[]>('/api/categories');
  },

  getInsights: async (): Promise<Insight[]> => {
    return fetchJson<Insight[]>('/api/insights');
  },

  getInsightsPageData: async (): Promise<InsightsPageData> => {
    return fetchJson<InsightsPageData>('/api/insights-page');
  },

  getBudgetSummary: async (): Promise<BudgetSummary> => {
    return fetchJson<BudgetSummary>('/api/budget-summary');
  },

  getRecurringCostByName: async (name: string): Promise<RecurringCostSummary | undefined> => {
    return fetchMaybeJson<RecurringCostSummary>(`/api/recurring-costs/${encodeURIComponent(name)}`);
  },

  setRecurringCostPaidStatus: async (name: string, isPaid: boolean): Promise<RecurringCostSummary> => {
    const response = await fetch(`/api/recurring-costs/${encodeURIComponent(name)}/paid`, {
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

  addTransaction: async (data: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to add transaction');
    }

    const newT = await response.json() as Transaction;
    emitFinanceDataUpdated();
    return newT;
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    const response = await fetch(`/api/transactions/${id}`, {
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

  addGoal: async (data: Omit<Goal, 'id'>): Promise<Goal> => {
    const response = await fetch('/api/goals', {
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
    const response = await fetch(`/api/goals/${id}`, {
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
    const response = await fetch(`/api/goals/${id}/contribute`, {
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
    const response = await fetch(`/api/goals/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete goal');
    }

    emitFinanceDataUpdated();
  },

  addCategory: async (data: Omit<CategorySpending, 'percentage' | 'spent'>): Promise<CategorySpending> => {
    const response = await fetch('/api/categories', {
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
};
