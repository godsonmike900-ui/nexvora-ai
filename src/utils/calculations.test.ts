import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateInvoiceTotals,
  calculateNetProfit,
  calculateProfitMargin,
  calculateSalesTotals,
  calculateExpensesTotals,
  formatCurrency,
  filterTransactionsByPeriod,
} from './calculations';
import { Transaction } from '../types';

test('calculateInvoiceTotals computes subtotal, tax, discount, and grand total accurately', () => {
  const items = [
    { quantity: 2, unitPrice: 50000 }, // 100,000
    { quantity: 1, unitPrice: 25000 }, // 25,000 -> subtotal = 125,000
  ];
  // 10% discount on 125,000 = 12,500. Discounted subtotal = 112,500.
  // 7.5% Nigerian VAT on 112,500 = 8,437.50.
  // Grand total = 112,500 + 8,437.50 = 120,937.50.
  const result = calculateInvoiceTotals(items, 7.5, 10);

  assert.equal(result.subtotal, 125000);
  assert.equal(result.discountAmount, 12500);
  assert.equal(result.taxAmount, 8437.5);
  assert.equal(result.total, 120937.5);
});

test('calculateInvoiceTotals handles empty items and 0 rates gracefully', () => {
  const result = calculateInvoiceTotals([], 0, 0);
  assert.equal(result.subtotal, 0);
  assert.equal(result.discountAmount, 0);
  assert.equal(result.taxAmount, 0);
  assert.equal(result.total, 0);
});

test('formatCurrency formats NGN, USD, GBP, and EUR correctly', () => {
  assert.equal(formatCurrency(1500000, 'NGN'), '₦1,500,000.00');
  assert.equal(formatCurrency(2500.5, 'USD'), '$2,500.50');
  assert.equal(formatCurrency(1200, 'GBP'), '£1,200.00');
  assert.equal(formatCurrency(999.99, 'EUR'), '€999.99');
});

test('calculateNetProfit and calculateProfitMargin calculate correct figures', () => {
  const revenue = 100000;
  const expenses = 40000;

  const netProfit = calculateNetProfit(revenue, expenses);
  assert.equal(netProfit, 60000);

  const margin = calculateProfitMargin(revenue, expenses);
  assert.equal(margin, 60); // 60%
});

test('calculateSalesTotals and calculateExpensesTotals filter by currency', () => {
  const sampleTransactions: Transaction[] = [
    {
      id: '1',
      userId: 'u1',
      type: 'sale',
      title: 'Consulting',
      amount: 500000,
      currency: 'NGN',
      category: 'Consulting',
      date: '2026-11-05',
      paymentMethod: 'Bank Transfer',
      createdAt: '2026-11-05',
    },
    {
      id: '2',
      userId: 'u1',
      type: 'sale',
      title: 'US Client Project',
      amount: 1500,
      currency: 'USD',
      category: 'Services',
      date: '2026-11-06',
      paymentMethod: 'Card',
      createdAt: '2026-11-06',
    },
    {
      id: '3',
      userId: 'u1',
      type: 'expense',
      title: 'Office Generator Fuel & Servicing',
      amount: 75000,
      currency: 'NGN',
      category: 'Utilities',
      date: '2026-11-07',
      paymentMethod: 'Cash',
      createdAt: '2026-11-07',
    },
  ];

  const ngnSales = calculateSalesTotals(sampleTransactions, 'NGN');
  assert.equal(ngnSales, 500000);

  const usdSales = calculateSalesTotals(sampleTransactions, 'USD');
  assert.equal(usdSales, 1500);

  const ngnExpenses = calculateExpensesTotals(sampleTransactions, 'NGN');
  assert.equal(ngnExpenses, 75000);
});

test('filterTransactionsByPeriod filters transactions correctly', () => {
  const refDate = new Date('2026-11-07T12:00:00Z');
  const txs: Transaction[] = [
    {
      id: '1',
      userId: 'u1',
      type: 'sale',
      title: 'Today sale',
      amount: 100,
      currency: 'USD',
      category: 'Direct Sales',
      date: '2026-11-07',
      paymentMethod: 'Card',
      createdAt: '2026-11-07',
    },
    {
      id: '2',
      userId: 'u1',
      type: 'sale',
      title: '3 days ago',
      amount: 200,
      currency: 'USD',
      category: 'Direct Sales',
      date: '2026-11-04',
      paymentMethod: 'Card',
      createdAt: '2026-11-04',
    },
    {
      id: '3',
      userId: 'u1',
      type: 'sale',
      title: 'Last month',
      amount: 300,
      currency: 'USD',
      category: 'Direct Sales',
      date: '2026-10-15',
      paymentMethod: 'Card',
      createdAt: '2026-10-15',
    },
  ];

  const daily = filterTransactionsByPeriod(txs, 'daily', refDate);
  assert.equal(daily.length, 1);
  assert.equal(daily[0].id, '1');

  const weekly = filterTransactionsByPeriod(txs, 'weekly', refDate);
  assert.equal(weekly.length, 2);

  const monthly = filterTransactionsByPeriod(txs, 'monthly', refDate);
  assert.equal(monthly.length, 2); // 2026-11-07 and 2026-11-04
});
