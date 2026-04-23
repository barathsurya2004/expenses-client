import type { Transaction, Goal, CategorySpending, Insight } from '../types';

export const FINANCE_DATA_UPDATED_EVENT = 'finance:data-updated';

const emitFinanceDataUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(FINANCE_DATA_UPDATED_EVENT));
  }
};

export interface GroupedTransactions {
  date: string;
  label: string;
  items: Transaction[];
}

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
  // Accounting / Stats Service
  getMonthlySummary: async (): Promise<MonthlySummary> => {
    return fetchJson<MonthlySummary>('/api/stats/monthly-summary');
  },

  getBiggestExpense: async (): Promise<{ amount: number; merchant: string; category: string } | null> => {
    return fetchMaybeJson<{ amount: number; merchant: string; category: string }>('/api/stats/biggest-expense') || null;
  },

  // Transaction Service
  getRecentTransactions: async (): Promise<GroupedTransactions[]> => {
    return fetchJson<GroupedTransactions[]>('/api/transactions/recent');
  },

  getTransactions: async (): Promise<Transaction[]> => {
    return fetchJson<Transaction[]>('/api/transactions/all');
  },

  getTransactionById: async (id: string): Promise<Transaction | undefined> => {
    return fetchMaybeJson<Transaction>(`/api/transactions/${id}`);
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

  deleteTransaction: async (id: string): Promise<void> => {
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete transaction');
    }

    emitFinanceDataUpdated();
  },

  // Budget & Category Service
  getSpendingCategories: async (): Promise<CategorySpending[]> => {
    return fetchJson<CategorySpending[]>('/api/categories/spending');
  },

  getSavingsCategories: async (): Promise<CategorySpending[]> => {
    return fetchJson<CategorySpending[]>('/api/categories/savings');
  },

  getBudgetHealth: async (): Promise<BudgetHealthStats> => {
    return fetchJson<BudgetHealthStats>('/api/budgets/health');
  },

  getSpendingDistribution: async (): Promise<Array<{ name: string; icon: string; percentage: number; colorHex: string; spent: number }>> => {
    return fetchJson<any[]>('/api/budgets/spending-distribution');
  },

  getBudgetOverview: async (): Promise<BudgetOverviewData> => {
    return fetchJson<BudgetOverviewData>('/api/budgets/overview');
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

  // Subscription Service (Recurring Costs)
  getRecurringCosts: async (): Promise<RecurringCostSummary[]> => {
    return fetchJson<RecurringCostSummary[]>('/api/subscriptions');
  },

  getRecurringCostById: async (id: string): Promise<RecurringCostSummary | undefined> => {
    return fetchMaybeJson<RecurringCostSummary>(`/api/subscriptions/${encodeURIComponent(id)}`);
  },

  toggleRecurringPaidStatus: async (id: string, isPaid: boolean): Promise<RecurringCostSummary> => {
    const response = await fetch(`/api/subscriptions/${encodeURIComponent(id)}/toggle-paid`, {
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
    return fetchJson<Goal[]>('/api/goals');
  },

  getGoalById: async (id: string): Promise<Goal | undefined> => {
    return fetchMaybeJson<Goal>(`/api/goals/${id}`);
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

  // Insights Service
  getTopInsights: async (): Promise<Insight[]> => {
    return fetchJson<Insight[]>('/api/insights/top');
  },

  getInsights: async (): Promise<Insight[]> => {
    return fetchJson<Insight[]>('/api/insights/all');
  },
};
