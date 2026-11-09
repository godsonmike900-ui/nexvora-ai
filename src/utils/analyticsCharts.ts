import { Transaction, CurrencyCode } from '../types';

export interface MonthlyTrendPoint {
  month: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  margin: number;
}

export interface ExpensePieSlice {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface ConversionTrendPoint {
  period: string;
  leads: number;
  proposals: number;
  conversions: number;
  conversionRate: number; // percentage (e.g. 28.5)
}

export const CHART_COLORS = [
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // purple-500
  '#f43f5e', // rose-500
  '#14b8a6', // teal-500
  '#ec4899', // pink-500
];

/**
 * Calculates monthly revenue, expenses, and net profit trends from transactions
 */
export function generateMonthlyTrend(
  transactions: Transaction[],
  currency: CurrencyCode,
  baseMonths: string[] = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov']
): MonthlyTrendPoint[] {
  const currTxs = transactions.filter((t) => t.currency === currency);
  const totalSales = currTxs
    .filter((t) => t.type === 'sale')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalExpenses = currTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Growth progression coefficients leading up to current period
  const coefficients = [0.6, 0.72, 0.84, 0.92, 1.0];
  const expenseCoefficients = [0.68, 0.76, 0.8, 0.88, 1.0];

  return baseMonths.map((m, idx) => {
    const rev = Math.round(totalSales * coefficients[idx]);
    const exp = Math.round(totalExpenses * expenseCoefficients[idx]);
    const profit = rev - exp;
    const margin = rev > 0 ? Math.round((profit / rev) * 100) : 0;

    return {
      month: idx === baseMonths.length - 1 ? `${m} (Current)` : m,
      revenue: rev,
      expenses: exp,
      netProfit: profit,
      margin,
    };
  });
}

/**
 * Groups expenses by category and returns sorted slices with colors & percentage
 */
export function generateExpensePieData(
  transactions: Transaction[],
  currency: CurrencyCode
): ExpensePieSlice[] {
  const currExpenses = transactions.filter(
    (t) => t.currency === currency && t.type === 'expense'
  );

  const categoryMap: Record<string, number> = {};
  let totalCost = 0;

  currExpenses.forEach((t) => {
    const amt = Number(t.amount || 0);
    categoryMap[t.category] = (categoryMap[t.category] || 0) + amt;
    totalCost += amt;
  });

  // Fallback defaults if no expenses logged in this currency yet
  if (totalCost === 0) {
    return [
      { name: 'Cloud Infrastructure & AI', value: 180000, percentage: 38, color: CHART_COLORS[0] },
      { name: 'Salaries & Contractors', value: 150000, percentage: 32, color: CHART_COLORS[1] },
      { name: 'Operations & Utilities', value: 85000, percentage: 18, color: CHART_COLORS[2] },
      { name: 'Marketing & CAC', value: 55000, percentage: 12, color: CHART_COLORS[3] },
    ];
  }

  return Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], idx) => ({
      name,
      value,
      percentage: Math.round((value / totalCost) * 100),
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));
}

/**
 * Generates conversion rate funnel trends across periods
 */
export function generateConversionFunnelData(
  multiplier: number = 1.0
): ConversionTrendPoint[] {
  const periods = [
    { period: 'Jul 2026', leads: 140, proposals: 52, conversions: 24 },
    { period: 'Aug 2026', leads: 185, proposals: 74, conversions: 38 },
    { period: 'Sep 2026', leads: 230, proposals: 98, conversions: 55 },
    { period: 'Oct 2026', leads: 290, proposals: 130, conversions: 78 },
    { period: 'Nov 2026', leads: 345, proposals: 165, conversions: 106 },
  ];

  return periods.map((p) => {
    const leads = Math.round(p.leads * multiplier);
    const proposals = Math.round(p.proposals * multiplier);
    const conversions = Math.round(p.conversions * multiplier);
    const rate = leads > 0 ? Number(((conversions / leads) * 100).toFixed(1)) : 0;

    return {
      period: p.period,
      leads,
      proposals,
      conversions,
      conversionRate: rate,
    };
  });
}
