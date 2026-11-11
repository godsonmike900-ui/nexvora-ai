import { test } from 'node:test';
import assert from 'node:assert';
import {
  createPaymentReceivedAlert,
  createInvoiceOverdueAlert,
  createMorningBriefingAlert,
  DEFAULT_PUSH_PREFERENCES,
} from './notifications';

test('createPaymentReceivedAlert formats payload correctly', () => {
  const alert = createPaymentReceivedAlert('Apex Capital', '₦1,889,312.50');
  assert.ok(alert.title.includes('Payment Received'));
  assert.ok(alert.body.includes('Apex Capital'));
  assert.ok(alert.body.includes('₦1,889,312.50'));
  assert.strictEqual(alert.tag, 'payment-received');
});

test('createInvoiceOverdueAlert formats payload correctly', () => {
  const alert = createInvoiceOverdueAlert('NEX-2026-0043', 'Horizon Global UK', '£4,200');
  assert.ok(alert.title.includes('Overdue'));
  assert.ok(alert.body.includes('NEX-2026-0043'));
  assert.ok(alert.body.includes('Horizon Global UK'));
  assert.strictEqual(alert.tag, 'invoice-overdue');
});

test('createMorningBriefingAlert formats payload correctly', () => {
  const alert = createMorningBriefingAlert('₦2,239,312', 3);
  assert.ok(alert.title.includes('NEXVORA AI Daily Briefing'));
  assert.ok(alert.body.includes('₦2,239,312'));
  assert.ok(alert.body.includes('3 invoices pending'));
  assert.strictEqual(alert.tag, 'daily-briefing');
});

test('DEFAULT_PUSH_PREFERENCES has all key business alerts enabled', () => {
  assert.strictEqual(DEFAULT_PUSH_PREFERENCES.paymentReceived, true);
  assert.strictEqual(DEFAULT_PUSH_PREFERENCES.invoiceOverdue, true);
  assert.strictEqual(DEFAULT_PUSH_PREFERENCES.dailyBriefing, true);
});
