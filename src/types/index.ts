export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR';
export type AppTheme = 'default' | 'midnight-forest' | 'ocean-deep';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  businessName: string;
  businessType: string; // e.g. "E-Commerce", "Tech Startup", "Freelance Design", "Retail", "Services"
  country: string;
  currency: CurrencyCode;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  theme?: AppTheme;
  createdAt: string;
  phone?: string;
  address?: string;
  cacNumber?: string; // Nigerian Corporate Affairs Commission registration or tax ID
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    swiftCode?: string;
  };
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  userId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  currency: CurrencyCode;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // percentage (e.g. 7.5% for Nigeria VAT)
  taxAmount: number;
  discountRate: number; // percentage
  discountAmount: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
  status: InvoiceStatus;
  createdAt: string;
}

export type TransactionType = 'sale' | 'expense';

export type TransactionCategory =
  | 'Direct Sales'
  | 'Consulting'
  | 'Services'
  | 'Subscription'
  | 'Marketing & Ads'
  | 'Salaries & Wages'
  | 'Office & Rent'
  | 'Inventory & Goods'
  | 'Software & Tech'
  | 'Logistics & Delivery'
  | 'Utilities'
  | 'Taxes & Levies'
  | 'Other';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  title: string;
  amount: number;
  currency: CurrencyCode;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: 'Bank Transfer' | 'Card' | 'Cash' | 'USSD/Mobile Money' | 'Other';
  clientOrVendor?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface MarketingContentRequest {
  toolType:
    | 'caption'
    | 'facebook_ad'
    | 'instagram_ad'
    | 'tiktok_ideas'
    | 'product_desc'
    | 'promo_message'
    | 'campaign'
    | 'hashtags'
    | 'slogan';
  businessName: string;
  productOrTopic: string;
  targetAudience: string;
  platform: string;
  tone: string;
  length: 'short' | 'medium' | 'detailed';
  currency?: CurrencyCode;
  specialInstructions?: string;
}

export interface BusinessWriterRequest {
  docType:
    | 'proposal'
    | 'email'
    | 'customer_response'
    | 'business_letter'
    | 'company_profile'
    | 'project_description'
    | 'report';
  title: string;
  senderName: string;
  recipientName: string;
  keyPoints: string;
  tone: string;
  additionalDetails?: string;
}

export interface SavedGeneration {
  id: string;
  type: 'marketing' | 'writer';
  category: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  details: string;
  category: 'invoice' | 'finance' | 'ai' | 'settings' | 'general';
  timestamp: string;
  linkView?: 'dashboard' | 'assistant' | 'marketing' | 'writer' | 'invoices' | 'finance' | 'analytics' | 'settings' | 'legal';
}

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  timestamp: number;
}


