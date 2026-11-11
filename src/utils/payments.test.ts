import { test } from 'node:test';
import assert from 'node:assert';
import {
  getSupportedProvidersForCurrency,
  generatePaymentReference,
  generateCheckoutUrl,
  DEFAULT_PAYMENT_GATEWAYS,
} from './payments';
import { Invoice } from '../types';

test('getSupportedProvidersForCurrency returns correct gateway list', () => {
  const ngnGateways = getSupportedProvidersForCurrency('NGN');
  assert.ok(ngnGateways.includes('paystack'));
  assert.ok(ngnGateways.includes('flutterwave'));

  const usdGateways = getSupportedProvidersForCurrency('USD');
  assert.ok(usdGateways.includes('stripe'));
  assert.ok(usdGateways.includes('paystack'));

  const gbpGateways = getSupportedProvidersForCurrency('GBP');
  assert.ok(gbpGateways.includes('stripe'));
});

test('generatePaymentReference produces formatted reference', () => {
  const ref = generatePaymentReference('inv-101', 'paystack');
  assert.ok(ref.startsWith('NEX-PAY-'));
  assert.ok(ref.includes('inv101'));
});

test('generateCheckoutUrl produces valid checkout URL with params', () => {
  const invoice: Invoice = {
    id: 'inv-101',
    userId: 'user-1',
    invoiceNumber: 'NEX-2026-0042',
    clientName: 'Apex Capital',
    clientEmail: 'billing@apexcapital.ng',
    issueDate: '2026-11-01',
    dueDate: '2026-11-15',
    currency: 'NGN',
    items: [],
    subtotal: 100000,
    taxRate: 7.5,
    taxAmount: 7500,
    discountRate: 0,
    discountAmount: 0,
    total: 107500,
    status: 'pending',
    createdAt: '2026-11-01T10:00:00Z',
  };

  const url = generateCheckoutUrl(invoice, 'paystack');
  assert.ok(url.startsWith('https://checkout.nexvora.ai/pay?'));
  assert.ok(url.includes('inv=NEX-2026-0042'));
  assert.ok(url.includes('amount=107500'));
  assert.ok(url.includes('currency=NGN'));
  assert.ok(url.includes('gateway=paystack'));
});

test('DEFAULT_PAYMENT_GATEWAYS has paystack enabled by default', () => {
  assert.strictEqual(DEFAULT_PAYMENT_GATEWAYS.paystack.enabled, true);
  assert.strictEqual(DEFAULT_PAYMENT_GATEWAYS.activeProvider, 'paystack');
});
