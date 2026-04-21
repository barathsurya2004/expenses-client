import type { Transaction, Goal, CategorySpending, Insight } from '../types';

export const mockTransactions: Transaction[] = [
  { id: '1', merchant: 'Apple Store', category: 'Electronics', amount: 84900, date: '2026-04-20', type: 'expense', icon: 'shopping_cart' },
  { id: '2', merchant: 'Salary Deposit', category: 'Income', amount: 125000, date: '2026-04-19', type: 'income', icon: 'work' },
  { id: '3', merchant: 'Cafe Coffee Day', category: 'Food', amount: 450, date: '2026-04-12', type: 'expense', icon: 'restaurant' },
  { id: '4', merchant: 'Whole Foods', category: 'Groceries', amount: 420.5, date: '2026-04-12', type: 'expense', icon: 'shopping_bag' },
  { id: '5', merchant: 'Blue Bottle', category: 'Coffee', amount: 85.2, date: '2026-04-10', type: 'expense', icon: 'local_cafe' },
  { id: '6', merchant: 'Uber', category: 'Transport', amount: 112, date: '2026-04-10', type: 'expense', icon: 'directions_car' },
  { id: '7', merchant: 'Amazon', category: 'Shopping', amount: 2500, date: '2026-04-04', type: 'expense', icon: 'shopping_basket' },
  { id: '8', merchant: 'Netflix', category: 'Entertainment', amount: 499, date: '2026-04-01', type: 'expense', icon: 'movie' },
];

export const mockGoals: Goal[] = [
  {
    id: 'macbook-pro',
    name: 'MacBook Pro M3 Max',
    targetAmount: 399990,
    currentAmount: 245000,
    category: 'Technology',
    description: 'Ultimate performance workstation for design, video editing, and compiling large codebases.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2w_Ji2O5LmEIbLOwnmFkf_3MNkac5SxXLTL4fgGqCG_EICTK2hQg33PWlz8hEHV-G1Q2XuRuQAmVeiCk79QXqrNZuQA261TtixTd0Spa-kQl_CpAcGm0Xb_X_8Ige_GykxxFa3jSBMmyeG8Rei8mF1NaZdw6kqVNDHZnZxUZ5SeXljnIulNMc2v3jiqfHoKTFGJ-QPNQIa3w_GU01XgPhjSZBOJ4UhS1X7wwPOboZ5HMpgp5eOUZnr4wGBwYX3lyl8RFkCsW0Usal',
    icon: 'laptop_mac',
    color: 'primary',
    eta: '2 Months',
    priority: 'High'
  },
  {
    id: 'paris-trip',
    name: 'Paris Autumn Trip',
    targetAmount: 500000,
    currentAmount: 120000,
    category: 'Experience',
    description: 'Two weeks in Le Marais, exploring the art galleries and cafes.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiHpNsN9LKjKHuN7XdsMoTqgUM91fRvHDs9jYpIvAh9GOcvFq8x7YJk-matQ_uXtX8DziCHrVktmZ7os4F0Qt-NIzzahH52P2jIw38Eb2LKcDlla-VaxMHzRViUQvp8U7pIIReN7qRp7K4kJN7mVJ-f80PmKjz0Vv1LCui4tovkyt4aHK7hEGgSSSrVaKlGMQMVUBGG2XfFhrmgakNYlxvYjUu1D39zjWne42woVL7WdovPLQp4I98-9N-njZg-bVfs5HZArs5mnhn',
    icon: 'flight',
    color: 'tertiary',
    eta: '6 Months',
    priority: 'Medium'
  },
  {
    id: 'nomad-band',
    name: 'Nomad Horween Band',
    targetAmount: 15000,
    currentAmount: 4500,
    category: 'Accessories',
    description: 'Premium leather upgrade for daily wear.',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1400&q=80',
    icon: 'watch',
    color: 'secondary',
    eta: 'Next Week',
    priority: 'Low'
  },
  {
    id: 'new-house',
    name: 'Dream House',
    targetAmount: 25000000,
    currentAmount: 1500000,
    category: 'Property',
    description: 'Down payment for a 3BHK in the suburbs.',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=80',
    icon: 'home',
    color: 'primary',
    eta: '5 Years',
    priority: 'High'
  },
];

export const mockCategories: CategorySpending[] = [
  { name: 'Housing', percentage: 100, spent: 20000, budget: 20000, icon: 'home', color: 'primary', kind: 'recurring' },
  { name: 'Food', percentage: 85, spent: 8500, budget: 10000, icon: 'restaurant', color: 'tertiary-container', kind: 'spending' },
  { name: 'Transport', percentage: 60, spent: 3000, budget: 5000, icon: 'directions_car', color: 'blue-400', kind: 'spending' },
  { name: 'Savings', percentage: 73, spent: 11000, budget: 15000, icon: 'savings', color: 'green-400', kind: 'savings' },
  { name: 'Travel', percentage: 60, spent: 3000, budget: 5000, icon: 'flight', color: 'tertiary', kind: 'spending' },
  { name: 'Emergency', percentage: 73, spent: 11000, budget: 15000, icon: 'medical_services', color: 'error', kind: 'savings' },
];

export const mockInsights: Insight[] = [
  { id: '1', title: 'Smart Insight', description: "You've spent 20% less on dining out this month. Keep it up to reach your 'New House' goal faster.", trend: '+12%', icon: 'lightbulb' },
  { id: '2', title: 'Spending Trend', description: "You spent 15% less on dining this month. Consistent tracking is paying off. You're on track to save an extra ₹3,400 by month end.", trend: '-15%', icon: 'trending_down' },
];
