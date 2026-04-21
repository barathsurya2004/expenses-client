import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { CategorySpending, Goal, Insight, Transaction } from './src/types'

const dbFilePath = path.resolve(process.cwd(), 'db.json')

type FinanceDb = {
  transactions: Transaction[]
  goals: Goal[]
  categories: CategorySpending[]
  insights: Insight[]
}

const EMPTY_FINANCE_DB: FinanceDb = {
  transactions: [],
  goals: [],
  categories: [],
  insights: [],
}

const COLOR_HEX: Record<string, string> = {
  primary: '#aac7ff',
  secondary: '#aac7ff',
  tertiary: '#ffb691',
  'tertiary-container': '#eb6a12',
  error: '#ffb4ab',
  'blue-400': '#60a5fa',
  'green-400': '#4ade80',
}

const normalizeFinanceDb = (data: unknown): FinanceDb => {
  if (!data || typeof data !== 'object') {
    return { ...EMPTY_FINANCE_DB }
  }

  const db = data as Partial<FinanceDb>

  return {
    transactions: Array.isArray(db.transactions) ? db.transactions : [],
    goals: Array.isArray(db.goals) ? db.goals : [],
    categories: Array.isArray(db.categories) ? db.categories : [],
    insights: Array.isArray(db.insights) ? db.insights : [],
  }
}

const readDb = async (): Promise<FinanceDb> => {
  try {
    const fileContent = await fs.readFile(dbFilePath, 'utf-8')
    if (!fileContent.trim()) {
      return { ...EMPTY_FINANCE_DB }
    }

    return normalizeFinanceDb(JSON.parse(fileContent))
  } catch {
    return { ...EMPTY_FINANCE_DB }
  }
}

const writeDb = async (nextDb: FinanceDb) => {
  const normalized = normalizeFinanceDb(nextDb)
  await fs.writeFile(dbFilePath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf-8')
}

const readRequestBody = (req: { on: (event: string, cb: (chunk?: Buffer) => void) => void }) =>
  new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []

    req.on('data', (chunk?: Buffer) => {
      if (chunk) chunks.push(chunk)
    })

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf-8'))
    })

    req.on('error', reject)
  })

const createId = () => Math.random().toString(36).slice(2, 11)

const respondJson = (res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body?: string) => void }, statusCode: number, body: unknown) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  today.setHours(0, 0, 0, 0)
  yesterday.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  if (date.getTime() === today.getTime()) return 'Today'
  if (date.getTime() === yesterday.getTime()) return 'Yesterday'

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
}

const groupTransactionsByDate = (transactions: Transaction[]) => {
  const groupedMap: Record<string, Transaction[]> = {}

  transactions.forEach((transaction) => {
    if (!groupedMap[transaction.date]) groupedMap[transaction.date] = []
    groupedMap[transaction.date].push(transaction)
  })

  return Object.keys(groupedMap)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(date => ({
      date,
      label: formatDateLabel(date),
      items: groupedMap[date].sort((a, b) => b.id.localeCompare(a.id)),
    }))
}

const isRecurringCategory = (category: CategorySpending) => (
  category.kind === 'recurring' || (!category.kind && category.name === 'Housing')
)

const addRecurringInterval = (
  sourceDate: Date,
  interval: CategorySpending['recurringInterval'],
  customValue: number,
  customUnit: NonNullable<CategorySpending['recurringCustomUnit']>
) => {
  const date = new Date(sourceDate)
  switch (interval) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      return date
    case 'weekly':
      date.setDate(date.getDate() + 7)
      return date
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      return date
    case 'custom':
      if (customUnit === 'days') {
        date.setDate(date.getDate() + customValue)
      } else if (customUnit === 'weeks') {
        date.setDate(date.getDate() + (customValue * 7))
      } else {
        date.setMonth(date.getMonth() + customValue)
      }
      return date
    default:
      date.setMonth(date.getMonth() + 1)
      return date
  }
}

const buildRecurringCardSummary = (category: CategorySpending, today: Date) => {
  const formatCycleDate = (date: Date) => date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const interval = category.recurringInterval ?? 'monthly'
  const customValue = Math.max(1, Math.floor(category.recurringCustomValue ?? 1))
  const customUnit = category.recurringCustomUnit ?? 'months'
  const isPaid = category.spent >= category.budget

  const todayAtMidnight = new Date(today)
  todayAtMidnight.setHours(0, 0, 0, 0)

  const defaultStartDate = new Date(todayAtMidnight.getFullYear(), todayAtMidnight.getMonth(), 1)
  const startDate = category.recurringStartDate ? new Date(category.recurringStartDate) : defaultStartDate
  if (Number.isNaN(startDate.getTime())) {
    startDate.setTime(defaultStartDate.getTime())
  }
  startDate.setHours(0, 0, 0, 0)

  let cycleDate = new Date(startDate)
  let guard = 0
  while (cycleDate < todayAtMidnight && guard < 500) {
    cycleDate = addRecurringInterval(cycleDate, interval, customValue, customUnit)
    guard += 1
  }

  if (isPaid) {
    cycleDate = addRecurringInterval(cycleDate, interval, customValue, customUnit)
  }

  return {
    name: category.name,
    icon: category.icon,
    color: category.color,
    amount: category.budget,
    isPaid,
    nextPayCycle: formatCycleDate(cycleDate),
    paidOn: category.recurringPaidAt ? formatDateLabel(category.recurringPaidAt) : null,
    recurringStartDate: category.recurringStartDate ?? null,
    recurringInterval: interval,
    recurringCustomValue: interval === 'custom' ? customValue : null,
    recurringCustomUnit: interval === 'custom' ? customUnit : null,
  }
}

const buildDashboardSummary = (db: FinanceDb) => {
  const sortedTransactions = [...db.transactions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalIncome = db.transactions
    .filter(t => t.type === 'income')
    .reduce((acc, transaction) => acc + transaction.amount, 0)

  const totalExpense = db.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => acc + transaction.amount, 0)

  const recentTransactions = groupTransactionsByDate(sortedTransactions.slice(0, 5))

  return {
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    recentTransactions,
    goals: db.goals,
    categories: db.categories,
    insights: db.insights,
  }
}

const buildInsightsPageData = (db: FinanceDb) => {
  const summary = buildDashboardSummary(db)
  const sortedTransactions = [...db.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const transactions = sortedTransactions

  const today = new Date()
  const currentMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date)
    return transactionDate.getFullYear() === today.getFullYear() && transactionDate.getMonth() === today.getMonth()
  })

  const expenses = currentMonthTransactions.filter(transaction => transaction.type === 'expense')
  const incomeItems = currentMonthTransactions.filter(transaction => transaction.type === 'income')

  const totalExpenses = expenses.reduce((sum, transaction) => sum + transaction.amount, 0)
  const totalIncome = incomeItems.reduce((sum, transaction) => sum + transaction.amount, 0)
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

  const dayOfMonth = today.getDate()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const daysRemaining = daysInMonth - dayOfMonth
  const dailyBurn = dayOfMonth > 0 ? totalExpenses / dayOfMonth : 0
  const projectedSpend = Math.round(dailyBurn * daysInMonth)
  const netAmount = totalIncome - totalExpenses
  const isPositive = netAmount >= 0

  const overBudgetCats = db.categories.filter(category => category.percentage > 100)
  const onTrackCats = db.categories.filter(category => category.percentage <= 100)
  const healthScore = db.categories.length > 0
    ? Math.round((onTrackCats.length / db.categories.length) * 100)
    : 100

  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const daySpend = expenses.reduce((acc, transaction) => {
    const day = new Date(transaction.date).toLocaleDateString('en-US', { weekday: 'short' })
    acc[day] = (acc[day] || 0) + transaction.amount
    return acc
  }, {} as Record<string, number>)
  const maxDaySpend = Math.max(...dayOrder.map(day => daySpend[day] ?? 0), 1)
  const hasDaySpend = dayOrder.some(day => (daySpend[day] ?? 0) > 0)
  const currentWeekDay = today.toLocaleDateString('en-US', { weekday: 'short' })
  const peakDay = hasDaySpend
    ? dayOrder.reduce(
      (peak, day) => (daySpend[day] ?? 0) > (daySpend[peak] ?? 0) ? day : peak,
      dayOrder[0]
    )
    : (dayOrder.includes(currentWeekDay) ? currentWeekDay : dayOrder[0])

  const merchantFreq = expenses.reduce((acc, transaction) => {
    acc[transaction.merchant] = (acc[transaction.merchant] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const biggestExpense = [...expenses].sort((a, b) => b.amount - a.amount)[0]

  const recurringCats = db.categories.filter(category => category.kind === 'recurring')
  const recurringTotal = recurringCats.reduce((sum, category) => sum + (category.spent ?? 0), 0)
  const recurringPct = totalIncome > 0 ? Math.round((recurringTotal / totalIncome) * 100) : 0
  const discretionaryPct = Math.max(0, 100 - Math.round(savingsRate) - recurringPct)

  const monthBuckets = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1)
    return date
  })
  const last6Months = monthBuckets.map(date => date.toLocaleString('default', { month: 'short' }))
  const cashFlowSeries = monthBuckets.map(date => {
    const monthIncomeAndExpense = db.transactions.reduce((acc, transaction) => {
      const transactionDate = new Date(transaction.date)
      const isSameMonth = transactionDate.getFullYear() === date.getFullYear() && transactionDate.getMonth() === date.getMonth()

      if (!isSameMonth) {
        return acc
      }

      if (transaction.type === 'income') {
        acc.income += transaction.amount
      } else {
        acc.expense += transaction.amount
      }

      return acc
    }, { income: 0, expense: 0 })

    return {
      month: date.toLocaleString('default', { month: 'short' }),
      value: monthIncomeAndExpense.income - monthIncomeAndExpense.expense,
    }
  })

  const savingsColor = savingsRate >= 20 ? '#4ade80' : savingsRate >= 5 ? '#facc15' : '#f87171'
  const healthBarColor = healthScore >= 80 ? '#4ade80' : healthScore >= 50 ? '#facc15' : '#f87171'
  const topMerchantsBase = Object.entries(merchantFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const topMerchantMaxCount = Math.max(...topMerchantsBase.map(([, count]) => count), 1)

  return {
    header: {
      monthLabel: today.toLocaleString('default', { month: 'long', year: 'numeric' }),
      dayOfMonth,
      daysInMonth,
      daysRemaining,
    },
    pulseStats: [
      {
        icon: 'savings',
        label: 'Savings Rate',
        value: `${savingsRate.toFixed(1)}%`,
        sub: savingsRate >= 20 ? 'Healthy — keep it up' : savingsRate >= 5 ? 'Low — try to cut back' : 'Spending more than earning',
        colorHex: savingsColor,
      },
      {
        icon: 'local_fire_department',
        label: 'Daily Burn',
        value: `₹${Math.round(dailyBurn).toLocaleString()}`,
        sub: `Projected month total: ₹${projectedSpend.toLocaleString()}`,
        colorHex: null,
      },
      {
        icon: isPositive ? 'trending_up' : 'trending_down',
        label: 'Net This Month',
        value: `${isPositive ? '+' : '−'}₹${Math.abs(netAmount).toLocaleString()}`,
        sub: isPositive
          ? `₹${totalIncome.toLocaleString()} in · ₹${totalExpenses.toLocaleString()} out`
          : `Deficit · ₹${Math.abs(netAmount).toLocaleString()} over income`,
        colorHex: isPositive ? '#4ade80' : '#f87171',
      },
    ],
    budgetHealth: {
      totalCategories: db.categories.length,
      healthScore,
      onTrackCount: onTrackCats.length,
      overBudgetCount: overBudgetCats.length,
      healthBarColor,
    },
    overBudgetCategories: overBudgetCats.map(category => ({
      name: category.name,
      icon: category.icon,
      percentage: category.percentage,
      overage: category.spent - category.budget,
      colorHex: COLOR_HEX[category.color ?? 'primary'] ?? COLOR_HEX.primary,
    })),
    onTrackCategories: onTrackCats.map(category => ({
      name: category.name,
      icon: category.icon,
      percentage: category.percentage,
      colorHex: COLOR_HEX[category.color ?? 'primary'] ?? COLOR_HEX.primary,
    })),
    daySpend: dayOrder.map(day => ({
      day,
      amount: daySpend[day] ?? 0,
      isPeak: day === peakDay,
      heightPercent: (daySpend[day] ?? 0) <= 0
        ? 0
        : Math.max(((daySpend[day] ?? 0) / maxDaySpend) * 100, 8),
    })),
    peakDay,
    topMerchants: topMerchantsBase.map(([merchant, count], index) => ({
      merchant,
      count,
      rank: index + 1,
      progress: (count / topMerchantMaxCount) * 100,
      opacity: 0.4 + (count / topMerchantMaxCount) * 0.6,
    })),
    biggestExpense: biggestExpense
      ? { amount: biggestExpense.amount, merchant: biggestExpense.merchant, category: biggestExpense.category }
      : null,
    recurring: {
      recurringPct,
      recurringTotal,
      savingsRate: Math.round(savingsRate),
      discretionaryPct,
    },
    last6Months,
    cashFlowSeries,
    savingsColorHex: savingsColor,
    healthBarColorHex: healthBarColor,
    categoryRows: db.categories.slice(0, 5).map(category => ({
      name: category.name,
      icon: category.icon,
      percentage: category.percentage,
      colorHex: COLOR_HEX[category.color ?? 'primary'] ?? COLOR_HEX.primary,
    })),
    insights: summary.insights,
    transactions,
  }
}

const buildBudgetSummary = (db: FinanceDb) => {
  const today = new Date()

  const totalBudget = db.categories.reduce((sum, category) => sum + category.budget, 0)
  const totalSpent = db.categories.reduce((sum, category) => sum + category.spent, 0)
  const totalProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const spendingCategories = db.categories.filter(category => category.kind === 'spending' || (!category.kind && category.name !== 'Savings' && category.name !== 'Housing' && category.name !== 'Emergency'))
  const savingsCategories = db.categories.filter(category => category.kind === 'savings' || (!category.kind && (category.name === 'Savings' || category.name === 'Emergency')))
  const recurringCategories = db.categories.filter(isRecurringCategory)
  const recurringCards = recurringCategories.map((category) => buildRecurringCardSummary(category, today))

  return {
    totalBudget,
    totalSpent,
    totalProgress,
    spendingCategories,
    savingsCategories,
    recurringCategories,
    recurringCards,
  }
}

const dbMiddleware = async (
  req: { url?: string; method?: string; on: (event: string, cb: (chunk?: Buffer) => void) => void },
  res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body?: string) => void },
  next: () => void
) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const { pathname } = url

  if (pathname === '/api/db' && req.method === 'GET') {
    try {
      const fileContent = await fs.readFile(dbFilePath, 'utf-8')
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(fileContent)
      return
    } catch {
      res.statusCode = 500
      res.end(JSON.stringify({ error: 'Failed to read db.json' }))
      return
    }
  }

  if (pathname === '/api/dashboard-summary' && req.method === 'GET') {
    const db = await readDb()
    respondJson(res, 200, buildDashboardSummary(db))
    return
  }

  if (pathname === '/api/transactions-grouped' && req.method === 'GET') {
    const db = await readDb()
    respondJson(res, 200, groupTransactionsByDate(db.transactions))
    return
  }

  if (pathname === '/api/goals' && req.method === 'GET') {
    const db = await readDb()
    respondJson(res, 200, db.goals)
    return
  }

  if (pathname.startsWith('/api/goals/') && req.method === 'GET') {
    const goalId = pathname.replace('/api/goals/', '')
    const db = await readDb()
    const goal = db.goals.find(entry => entry.id === goalId)
    if (!goal) {
      respondJson(res, 404, { error: 'Goal not found' })
      return
    }

    respondJson(res, 200, goal)
    return
  }

  if (pathname === '/api/categories' && req.method === 'GET') {
    const db = await readDb()
    respondJson(res, 200, db.categories)
    return
  }

  if (pathname === '/api/insights' && req.method === 'GET') {
    const db = await readDb()
    respondJson(res, 200, db.insights)
    return
  }

  if (pathname === '/api/insights-page' && req.method === 'GET') {
    const db = await readDb()
    respondJson(res, 200, buildInsightsPageData(db))
    return
  }

  if (pathname === '/api/budget-summary' && req.method === 'GET') {
    const db = await readDb()
    respondJson(res, 200, buildBudgetSummary(db))
    return
  }

  if (pathname.startsWith('/api/recurring-costs/') && req.method === 'GET' && !pathname.endsWith('/paid')) {
    const recurringName = decodeURIComponent(pathname.replace('/api/recurring-costs/', ''))
    const db = await readDb()
    const recurringCategory = db.categories.find((entry) => isRecurringCategory(entry) && entry.name === recurringName)

    if (!recurringCategory) {
      respondJson(res, 404, { error: 'Recurring cost not found' })
      return
    }

    respondJson(res, 200, buildRecurringCardSummary(recurringCategory, new Date()))
    return
  }

  if (pathname.startsWith('/api/recurring-costs/') && pathname.endsWith('/paid') && req.method === 'PUT') {
    try {
      const recurringName = decodeURIComponent(pathname.replace('/api/recurring-costs/', '').replace('/paid', ''))
      const db = await readDb()
      const category = db.categories.find((entry) => isRecurringCategory(entry) && entry.name === recurringName)

      if (!category) {
        respondJson(res, 404, { error: 'Recurring cost not found' })
        return
      }

      const raw = await readRequestBody(req)
      const payload = JSON.parse(raw) as { isPaid?: boolean }
      const markAsPaid = payload.isPaid === true

      if (markAsPaid) {
        category.spent = category.budget
        category.percentage = category.budget > 0 ? 100 : 0
        category.recurringPaidAt = new Date().toISOString()
      } else {
        category.spent = 0
        category.percentage = 0
        delete category.recurringPaidAt
      }

      await writeDb(db)
      respondJson(res, 200, buildRecurringCardSummary(category, new Date()))
    } catch {
      respondJson(res, 500, { error: 'Failed to update recurring cost status' })
    }
    return
  }

  if (pathname === '/api/transactions' && req.method === 'POST') {
    try {
      const db = await readDb()
      const raw = await readRequestBody(req)
      const parsed = JSON.parse(raw) as Omit<Transaction, 'id'>
      const newTransaction: Transaction = {
        ...parsed,
        id: createId(),
      }

      db.transactions = [newTransaction, ...db.transactions]

      if (newTransaction.type === 'expense') {
        const category = db.categories.find(entry => entry.name === newTransaction.category)
        if (category) {
          category.spent += newTransaction.amount
          category.percentage = category.budget > 0 ? Math.round((category.spent / category.budget) * 100) : 0
        }
      }

      await writeDb(db)
      respondJson(res, 201, newTransaction)
    } catch {
      respondJson(res, 500, { error: 'Failed to add transaction' })
    }
    return
  }

  if (pathname.startsWith('/api/transactions/') && req.method === 'GET') {
    const transactionId = pathname.replace('/api/transactions/', '')
    const db = await readDb()
    const transaction = db.transactions.find(entry => entry.id === transactionId)
    if (!transaction) {
      respondJson(res, 404, { error: 'Transaction not found' })
      return
    }

    respondJson(res, 200, transaction)
    return
  }

  if (pathname.startsWith('/api/transactions/') && req.method === 'PUT') {
    try {
      const transactionId = pathname.replace('/api/transactions/', '')
      const db = await readDb()
      const index = db.transactions.findIndex(entry => entry.id === transactionId)

      if (index === -1) {
        respondJson(res, 404, { error: 'Transaction not found' })
        return
      }

      const raw = await readRequestBody(req)
      const updates = JSON.parse(raw) as Partial<Transaction>
      const previousTransaction = db.transactions[index]
      const nextTransaction: Transaction = { ...previousTransaction, ...updates }

      if (previousTransaction.type === 'expense') {
        const previousCategory = db.categories.find(entry => entry.name === previousTransaction.category)
        if (previousCategory) {
          previousCategory.spent = Math.max(previousCategory.spent - previousTransaction.amount, 0)
          previousCategory.percentage = previousCategory.budget > 0 ? Math.round((previousCategory.spent / previousCategory.budget) * 100) : 0
        }
      }

      if (nextTransaction.type === 'expense') {
        const nextCategory = db.categories.find(entry => entry.name === nextTransaction.category)
        if (nextCategory) {
          nextCategory.spent += nextTransaction.amount
          nextCategory.percentage = nextCategory.budget > 0 ? Math.round((nextCategory.spent / nextCategory.budget) * 100) : 0
        }
      }

      db.transactions[index] = nextTransaction
      await writeDb(db)
      respondJson(res, 200, nextTransaction)
    } catch {
      respondJson(res, 500, { error: 'Failed to update transaction' })
    }
    return
  }

  if (pathname.startsWith('/api/transactions/') && req.method === 'DELETE') {
    try {
      const transactionId = pathname.replace('/api/transactions/', '')
      const db = await readDb()
      const index = db.transactions.findIndex(entry => entry.id === transactionId)

      if (index === -1) {
        respondJson(res, 404, { error: 'Transaction not found' })
        return
      }

      const transactionToDelete = db.transactions[index]

      if (transactionToDelete.type === 'expense') {
        const category = db.categories.find(entry => entry.name === transactionToDelete.category)
        if (category) {
          category.spent = Math.max(category.spent - transactionToDelete.amount, 0)
          category.percentage = category.budget > 0 ? Math.round((category.spent / category.budget) * 100) : 0
        }
      }

      db.transactions.splice(index, 1)
      await writeDb(db)
      respondJson(res, 200, { success: true })
    } catch {
      respondJson(res, 500, { error: 'Failed to delete transaction' })
    }
    return
  }

  if (pathname === '/api/goals' && req.method === 'POST') {
    try {
      const db = await readDb()
      const raw = await readRequestBody(req)
      const parsed = JSON.parse(raw) as Omit<Goal, 'id'>
      const newGoal: Goal = { ...parsed, id: createId() }
      db.goals = [...db.goals, newGoal]
      await writeDb(db)
      respondJson(res, 201, newGoal)
    } catch {
      respondJson(res, 500, { error: 'Failed to add goal' })
    }
    return
  }

  if (pathname.startsWith('/api/goals/') && req.method === 'PUT') {
    try {
      const goalId = pathname.replace('/api/goals/', '')
      const db = await readDb()
      const index = db.goals.findIndex(entry => entry.id === goalId)

      if (index === -1) {
        respondJson(res, 404, { error: 'Goal not found' })
        return
      }

      const raw = await readRequestBody(req)
      const updates = JSON.parse(raw) as Partial<Goal>
      db.goals[index] = { ...db.goals[index], ...updates }
      await writeDb(db)
      respondJson(res, 200, db.goals[index])
    } catch {
      respondJson(res, 500, { error: 'Failed to update goal' })
    }
    return
  }

  if (pathname.startsWith('/api/goals/') && pathname.endsWith('/contribute') && req.method === 'POST') {
    try {
      const goalId = pathname.replace('/api/goals/', '').replace('/contribute', '')
      const db = await readDb()
      const index = db.goals.findIndex(entry => entry.id === goalId)

      if (index === -1) {
        respondJson(res, 404, { error: 'Goal not found' })
        return
      }

      const raw = await readRequestBody(req)
      const { amount } = JSON.parse(raw) as { amount: number }
      db.goals[index].currentAmount += amount
      await writeDb(db)
      respondJson(res, 200, db.goals[index])
    } catch {
      respondJson(res, 500, { error: 'Failed to contribute to goal' })
    }
    return
  }

  if (pathname.startsWith('/api/goals/') && req.method === 'DELETE') {
    try {
      const goalId = pathname.replace('/api/goals/', '')
      const db = await readDb()
      db.goals = db.goals.filter(entry => entry.id !== goalId)
      await writeDb(db)
      respondJson(res, 200, { ok: true })
    } catch {
      respondJson(res, 500, { error: 'Failed to delete goal' })
    }
    return
  }

  if (pathname === '/api/categories' && req.method === 'POST') {
    try {
      const db = await readDb()
      const raw = await readRequestBody(req)
      const parsed = JSON.parse(raw) as Omit<CategorySpending, 'percentage' | 'spent'>
      const newCategory: CategorySpending = { ...parsed, spent: 0, percentage: 0 }
      db.categories = [...db.categories, newCategory]
      await writeDb(db)
      respondJson(res, 201, newCategory)
    } catch {
      respondJson(res, 500, { error: 'Failed to add category' })
    }
    return
  }

  if (pathname !== '/api/db') {
    next()
    return
  }

  if (req.method === 'PUT') {
    const chunks: Buffer[] = []

    req.on('data', (chunk?: Buffer) => {
      if (chunk) chunks.push(chunk)
    })

    req.on('end', async () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8')
        const parsed = JSON.parse(raw)
        await writeDb(normalizeFinanceDb(parsed))
        respondJson(res, 200, { ok: true })
      } catch {
        respondJson(res, 500, { error: 'Failed to update db.json' })
      }
    })

    return
  }

  respondJson(res, 405, { error: 'Method not allowed' })
}

const createDbMiddlewarePlugin = () => ({
  name: 'finance-db-middleware',
  configureServer(server: { middlewares: { use: (handler: (req: { url?: string; method?: string; on: (event: string, cb: (chunk?: Buffer) => void) => void }, res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body?: string) => void }, next: () => void) => void) => void } }) {
    server.middlewares.use(dbMiddleware)
  },
  configurePreviewServer(server: { middlewares: { use: (handler: (req: { url?: string; method?: string; on: (event: string, cb: (chunk?: Buffer) => void) => void }, res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body?: string) => void }, next: () => void) => void) => void } }) {
    server.middlewares.use(dbMiddleware)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), createDbMiddlewarePlugin()],
})
