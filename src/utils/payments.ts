import { CurrencyCode, Invoice } from '../types';

export type PaymentProvider = 'paystack' | 'flutterwave' | 'stripe';

export interface PaymentGatewayConfig {
  provider: PaymentProvider;
  enabled: boolean;
  publicKey?: string;
  secretKey?: string;
  businessName?: string;
  isTestMode?: boolean;
}

export interface PaymentGatewaysState {
  paystack: PaymentGatewayConfig;
  flutterwave: PaymentGatewayConfig;
  stripe: PaymentGatewayConfig;
  activeProvider: PaymentProvider;
}

export const DEFAULT_PAYMENT_GATEWAYS: PaymentGatewaysState = {
  paystack: {
    provider: 'paystack',
    enabled: true,
    publicKey: 'pk_live_nexvora_paystack_demo',
    businessName: 'VoraTech Paystack Direct',
  },
  flutterwave: {
    provider: 'flutterwave',
    enabled: false,
    publicKey: 'FLWPUBK_TEST-nexvora_demo',
    businessName: 'VoraTech Flutterwave Rave',
  },
  stripe: {
    provider: 'stripe',
    enabled: false,
    publicKey: 'pk_live_nexvora_stripe_demo',
    businessName: 'VoraTech Global Stripe',
  },
  activeProvider: 'paystack',
};

/**
 * Validates which providers support the given currency
 */
export function getSupportedProvidersForCurrency(currency: CurrencyCode): PaymentProvider[] {
  switch (currency) {
    case 'NGN':
      return ['paystack', 'flutterwave'];
    case 'USD':
      return ['paystack', 'flutterwave', 'stripe'];
    case 'GBP':
    case 'EUR':
      return ['stripe', 'flutterwave'];
    default:
      return ['paystack'];
  }
}

/**
 * Generates a structured payment reference string
 */
export function generatePaymentReference(invoiceId: string, provider: PaymentProvider): string {
  const cleanId = invoiceId.replace(/[^a-zA-Z0-9]/g, '');
  const timestamp = Date.now().toString(36).toUpperCase();
  return `NEX-${provider.slice(0, 3).toUpperCase()}-${cleanId}-${timestamp}`;
}

/**
 * Builds an interactive direct checkout URL or webhook payload for an invoice
 */
export function generateCheckoutUrl(
  invoice: Invoice,
  provider: PaymentProvider = 'paystack'
): string {
  const ref = generatePaymentReference(invoice.id, provider);
  const baseUrl = 'https://checkout.nexvora.ai/pay';
  const params = new URLSearchParams({
    ref,
    inv: invoice.invoiceNumber,
    amount: invoice.total.toString(),
    currency: invoice.currency,
    email: invoice.clientEmail || 'billing@client.com',
    client: invoice.clientName || 'Valued Client',
    gateway: provider,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Storage helpers for payment gateways
 */
export function getStoredPaymentGateways(): PaymentGatewaysState {
  if (typeof localStorage === 'undefined') return DEFAULT_PAYMENT_GATEWAYS;
  try {
    const saved = localStorage.getItem('nexvora_payment_gateways');
    return saved ? { ...DEFAULT_PAYMENT_GATEWAYS, ...JSON.parse(saved) } : DEFAULT_PAYMENT_GATEWAYS;
  } catch {
    return DEFAULT_PAYMENT_GATEWAYS;
  }
}

export function saveStoredPaymentGateways(gateways: PaymentGatewaysState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('nexvora_payment_gateways', JSON.stringify(gateways));
}
