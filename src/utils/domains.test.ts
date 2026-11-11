import { test } from 'node:test';
import assert from 'node:assert';
import {
  isValidDomain,
  isSubdomain,
  generateDnsRecords,
  RENDER_DEFAULT_TARGET,
} from './domains';

test('isValidDomain identifies valid and invalid domains', () => {
  assert.strictEqual(isValidDomain('app.nexvora.ai'), true);
  assert.strictEqual(isValidDomain('billing.voratech.ng'), true);
  assert.strictEqual(isValidDomain('mycompany.com'), true);
  assert.strictEqual(isValidDomain('invalid_domain'), false);
  assert.strictEqual(isValidDomain('https://example.com'), false); // no protocols
  assert.strictEqual(isValidDomain(''), false);
});

test('isSubdomain distinguishes subdomains from apex domains', () => {
  assert.strictEqual(isSubdomain('app.nexvora.ai'), true);
  assert.strictEqual(isSubdomain('billing.voratech.ng'), true);
  assert.strictEqual(isSubdomain('nexvora.ai'), false);
  assert.strictEqual(isSubdomain('voratech.ng'), false);
});

test('generateDnsRecords outputs CNAME pointing to Render target', () => {
  const records = generateDnsRecords('app.voratech.ng');
  const cname = records.find((r) => r.type === 'CNAME');
  assert.ok(cname);
  assert.strictEqual(cname?.value, RENDER_DEFAULT_TARGET);
  assert.strictEqual(cname?.host, 'app');
});
