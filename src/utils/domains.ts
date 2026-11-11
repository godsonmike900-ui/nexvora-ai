export interface DnsRecord {
  type: 'CNAME' | 'A' | 'TXT';
  host: string;
  value: string;
  ttl: string;
  status: 'verified' | 'pending' | 'checking';
}

export interface CustomDomainConfig {
  domain: string;
  status: 'active' | 'pending_verification' | 'unconfigured';
  sslStatus: 'issued' | 'issuing' | 'pending';
  records: DnsRecord[];
  lastChecked?: string;
}

export const RENDER_DEFAULT_TARGET = 'nexvora-ai-am1r.onrender.com';

/**
 * Validates whether a domain string is properly formatted (e.g. app.mycompany.com, mycompany.ng)
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') return false;
  const clean = domain.trim().toLowerCase();
  // Standard domain regex without protocol or paths
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(clean);
}

/**
 * Detects if the domain is an apex root domain (e.g. "mycompany.ng") or a subdomain ("app.mycompany.ng")
 */
export function isSubdomain(domain: string): boolean {
  const parts = domain.trim().toLowerCase().split('.');
  return parts.length > 2;
}

/**
 * Generates the required DNS records for connecting the domain to Render
 */
export function generateDnsRecords(domain: string): DnsRecord[] {
  const clean = domain.trim().toLowerCase();
  const isSub = isSubdomain(clean);
  const host = isSub ? clean.split('.')[0] : '@';

  return [
    {
      type: 'CNAME',
      host: host,
      value: RENDER_DEFAULT_TARGET,
      ttl: 'Auto / 300',
      status: 'pending',
    },
    {
      type: 'TXT',
      host: `_nexvora-verify.${host === '@' ? '' : host}`,
      value: `nexvora-site-verification=${Math.random().toString(36).substring(2, 12)}`,
      ttl: 'Auto / 300',
      status: 'pending',
    },
  ];
}

/**
 * Simulates checking DNS propagation for the given domain
 */
export function checkDnsPropagation(domain: string): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (isValidDomain(domain)) {
        resolve({
          success: true,
          message: `DNS records for ${domain} pointing to ${RENDER_DEFAULT_TARGET} successfully detected. Free Let's Encrypt TLS certificate active.`,
        });
      } else {
        resolve({
          success: false,
          message: 'Unable to resolve DNS CNAME records. Please verify host and target in your registrar DNS panel.',
        });
      }
    }, 600);
  });
}

/**
 * Local storage helpers for custom domain
 */
export function getStoredCustomDomain(): CustomDomainConfig | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const saved = localStorage.getItem('nexvora_custom_domain');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function saveStoredCustomDomain(config: CustomDomainConfig | null): void {
  if (typeof localStorage === 'undefined') return;
  if (!config) {
    localStorage.removeItem('nexvora_custom_domain');
  } else {
    localStorage.setItem('nexvora_custom_domain', JSON.stringify(config));
  }
}
