import { CurrencyCode, InvoiceItem, Transaction } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

// Approximate exchange rates relative to USD for multi-currency normalized analytics if needed
export const FX_TO_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.28,
  NGN: 0.00067, // ~1500 NGN = 1 USD
};

/**
 * Calculates subtotal, tax amount, discount amount, and total for invoice line items.
 */
export function calculateInvoiceTotals(
  items: Array<Pick<InvoiceItem, 'quantity' | 'unitPrice'>>,
  taxRate: number = 0, // e.g. 7.5 for 7.5%
  discountRate: number = 0 // e.g. 5 for 5%
) {
  const subtotal = items.reduce((sum, item) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const price = Math.max(0, Number(item.unitPrice) || 0);
    return sum + qty * price;
  }, 0);

  const cleanDiscountRate = Math.max(0, Math.min(100, Number(discountRate) || 0));
  const discountAmount = Math.round((subtotal * (cleanDiscountRate / 100)) * 100) / 100;
  
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  const cleanTaxRate = Math.max(0, Math.min(100, Number(taxRate) || 0));
  const taxAmount = Math.round((discountedSubtotal * (cleanTaxRate / 100)) * 100) / 100;

  const total = Math.round((discountedSubtotal + taxAmount) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountRate: cleanDiscountRate,
    discountAmount,
    taxRate: cleanTaxRate,
    taxAmount,
    total,
  };
}

/**
 * Formats a numeric amount with proper commas, decimals, and currency symbol.
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'NGN'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '';
  const num = Number(amount) || 0;
  
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return `${symbol}${formattedNumber}`;
}

/**
 * Sums all transactions of type 'sale' matching the specified currency.
 */
export function calculateSalesTotals(
  transactions: Transaction[],
  currency?: CurrencyCode
): number {
  return transactions
    .filter((t) => t.type === 'sale' && (!currency || t.currency === currency))
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
}

/**
 * Sums all transactions of type 'expense' matching the specified currency.
 */
export function calculateExpensesTotals(
  transactions: Transaction[],
  currency?: CurrencyCode
): number {
  return transactions
    .filter((t) => t.type === 'expense' && (!currency || t.currency === currency))
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
}

/**
 * Net profit = Revenue - Expenses
 */
export function calculateNetProfit(revenue: number, expenses: number): number {
  return Math.round((revenue - expenses) * 100) / 100;
}

/**
 * Profit margin percentage = ((Revenue - Expenses) / Revenue) * 100
 */
export function calculateProfitMargin(revenue: number, expenses: number): number {
  if (revenue <= 0) return 0;
  const margin = ((revenue - expenses) / revenue) * 100;
  return Math.round(margin * 10) / 10;
}

/**
 * Filters transactions by time period (daily, weekly, monthly, all).
 */
export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: 'all' | 'daily' | 'weekly' | 'monthly',
  referenceDate: Date = new Date()
): Transaction[] {
  if (period === 'all') return transactions;

  const now = new Date(referenceDate);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return transactions.filter((t) => {
    const tDate = new Date(t.date);
    if (isNaN(tDate.getTime())) return false;

    if (period === 'daily') {
      const itemDay = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate()).getTime();
      return itemDay === startOfDay;
    }

    if (period === 'weekly') {
      // Past 7 days
      const sevenDaysAgo = new Date(startOfDay - 7 * 24 * 60 * 60 * 1000).getTime();
      const endOfToday = startOfDay + 24 * 60 * 60 * 1000;
      return tDate.getTime() >= sevenDaysAgo && tDate.getTime() < endOfToday;
    }

    if (period === 'monthly') {
      // Same month & year
      return tDate.getFullYear() === now.getFullYear() && tDate.getMonth() === now.getMonth();
    }

    return true;
  });
}
