import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateMonthlyTrend,
  generateExpensePieData,
  generateConversionFunnelData,
} from './analyticsCharts';
import { Transaction } from '../types';

test('generateMonthlyTrend produces accurate trajectory based on transactions', () => {
  const mockTxs: Transaction[] = [
    {
      id: 'tx-1',
      userId: 'u1',
      type: 'sale',
      title: 'Consulting',
      amount: 1000000,
      currency: 'NGN',
      category: 'Consulting',
      date: '2026-11-01',
      paymentMethod: 'Bank Transfer',
      createdAt: '2026-11-01',
    },
    {
      id: 'tx-2',
      userId: 'u1',
      type: 'expense',
      title: 'Hosting',
      amount: 200000,
      currency: 'NGN',
      category: 'Software & Tech',
      date: '2026-11-02',
      paymentMethod: 'Card',
      createdAt: '2026-11-02',
    },
  ];

  const trend = generateMonthlyTrend(mockTxs, 'NGN');
  assert.equal(trend.length, 5);
  // Last month is current
  const currentMonth = trend[trend.length - 1];
  assert.equal(currentMonth.revenue, 1000000);
  assert.equal(currentMonth.expenses, 200000);
  assert.equal(currentMonth.netProfit, 800000);
  assert.equal(currentMonth.margin, 80);
});

test('generateExpensePieData groups expenses by category with percentages and colors', () => {
  const mockTxs: Transaction[] = [
    {
      id: 'tx-1',
      userId: 'u1',
      type: 'expense',
      title: 'AWS Server',
      amount: 60000,
      currency: 'USD',
      category: 'Software & Tech',
      date: '2026-11-01',
      paymentMethod: 'Card',
      createdAt: '2026-11-01',
    },
    {
      id: 'tx-2',
      userId: 'u1',
      type: 'expense',
      title: 'Facebook Ads',
      amount: 40000,
      currency: 'USD',
      category: 'Marketing & Ads',
      date: '2026-11-02',
      paymentMethod: 'Card',
      createdAt: '2026-11-02',
    },
  ];

  const pieData = generateExpensePieData(mockTxs, 'USD');
  assert.equal(pieData.length, 2);
  assert.equal(pieData[0].name, 'Software & Tech');
  assert.equal(pieData[0].value, 60000);
  assert.equal(pieData[0].percentage, 60);
  assert.ok(pieData[0].color.startsWith('#'));

  assert.equal(pieData[1].name, 'Marketing & Ads');
  assert.equal(pieData[1].value, 40000);
  assert.equal(pieData[1].percentage, 40);
});

test('generateConversionFunnelData computes accurate conversion percentages', () => {
  const funnel = generateConversionFunnelData(1.0);
  assert.equal(funnel.length, 5);

  funnel.forEach((f) => {
    assert.ok(f.leads >= f.proposals);
    assert.ok(f.proposals >= f.conversions);
    assert.ok(f.conversionRate > 0 && f.conversionRate <= 100);
  });

  const last = funnel[funnel.length - 1];
  assert.equal(last.leads, 345);
  assert.equal(last.conversions, 106);
  assert.equal(last.conversionRate, 30.7); // 106 / 345 * 100 = 30.72% -> 30.7
});
