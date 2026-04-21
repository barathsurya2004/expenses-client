export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  type: 'expense' | 'income';
  icon: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  description: string;
  image?: string;
  icon?: string;
  color?: string;
  eta?: string;
  priority?: 'High' | 'Medium' | 'Low';
}

export interface CategorySpending {
  name: string;
  percentage: number;
  spent: number;
  budget: number;
  icon: string;
  color: string;
  kind?: 'spending' | 'savings' | 'recurring';
  recurringPaidAt?: string;
  recurringDayOfMonth?: number;
  recurringStartDate?: string;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurringCustomValue?: number;
  recurringCustomUnit?: 'days' | 'weeks' | 'months';
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  trend: string;
  icon: string;
}
