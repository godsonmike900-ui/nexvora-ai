import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CurrencyCode,
  AppTheme,
  Invoice,
  SavedGeneration,
  Transaction,
  UserProfile,
  ActivityLogItem,
  ToastNotification,
} from '../types';
import { api, SystemStatus } from '../services/api';
import { addToast, removeToast } from '../utils/toastManager';
import { buildUserProfile, CreateAccountPayload } from '../utils/auth';

export type AppView =
  | 'dashboard'
  | 'assistant'
  | 'marketing'
  | 'writer'
  | 'invoices'
  | 'finance'
  | 'analytics'
  | 'settings'
  | 'legal';

interface AppContextType {
  user: UserProfile | null;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  invoices: Invoice[];
  transactions: Transaction[];
  savedGenerations: SavedGeneration[];
  activities: ActivityLogItem[];
  toasts: ToastNotification[];
  systemStatus: SystemStatus | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (val: boolean) => void;
  isPricingModalOpen: boolean;
  setIsPricingModalOpen: (val: boolean) => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (val: boolean) => void;
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: (val: boolean) => void;
  isDownloadModalOpen: boolean;
  setIsDownloadModalOpen: (val: boolean) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  // Actions
  saveInvoice: (inv: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  saveTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  saveGenerationItem: (item: SavedGeneration) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  setPlan: (plan: 'FREE' | 'PRO' | 'BUSINESS') => Promise<void>;
  logActivity: (item: Omit<ActivityLogItem, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
  showToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;
  loginAsDemo: () => void;
  loginWithGoogle: (email?: string, name?: string) => void;
  loginWithPhone: (phone: string, fullName?: string, businessName?: string) => void;
  loginWithEmail: (email: string, fullName?: string, businessName?: string) => void;
  registerNewUser: (payload: CreateAccountPayload) => void;
  loginWithUser: (user: UserProfile) => void;
  logout: () => void;
  refreshStatus: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Demo Founder Profile
const DEFAULT_DEMO_USER: UserProfile = {
  id: 'founder_demo_01',
  email: 'founder@nexvora.ai',
  fullName: 'Godson Mike',
  businessName: 'VoraTech Solutions Ltd',
  businessType: 'B2B Software & Digital Commerce',
  country: 'Nigeria',
  currency: 'NGN',
  plan: 'PRO',
  theme: 'default',
  phone: '+234 803 892 4110',
  address: 'Plot 14, Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
  cacNumber: 'RC-1849204',
  bankDetails: {
    bankName: 'Zenith Bank PLC',
    accountName: 'VoraTech Solutions Ltd',
    accountNumber: '1018274920',
    swiftCode: 'ZEIBNGLA',
  },
  createdAt: '2026-01-15T09:00:00Z',
};

// Realistic Seed Invoices
const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    userId: 'founder_demo_01',
    invoiceNumber: 'NEX-2026-0042',
    clientName: 'Apex Capital Nigeria',
    clientEmail: 'billing@apexcapital.ng',
    clientPhone: '+234 812 345 6789',
    clientAddress: 'Victoria Island, Lagos',
    issueDate: '2026-11-01',
    dueDate: '2026-11-15',
    currency: 'NGN',
    items: [
      { id: 'item-1', description: 'Enterprise AI Strategy Consulting & Audit', quantity: 1, unitPrice: 1200000, total: 1200000 },
      { id: 'item-2', description: 'Cloud Infrastructure & Security Optimization', quantity: 1, unitPrice: 650000, total: 650000 },
    ],
    subtotal: 1850000,
    discountRate: 5,
    discountAmount: 92500,
    taxRate: 7.5,
    taxAmount: 131812.5,
    total: 1889312.5,
    status: 'paid',
    notes: 'Payment received via Zenith Bank NIP Transfer. Thank you for partnering with VoraTech.',
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'inv-102',
    userId: 'founder_demo_01',
    invoiceNumber: 'NEX-2026-0043',
    clientName: 'Horizon Global UK',
    clientEmail: 'accounts@horizonglobal.co.uk',
    clientPhone: '+44 20 7946 0912',
    clientAddress: '10 Finsbury Square, London, UK',
    issueDate: '2026-11-04',
    dueDate: '2026-11-20',
    currency: 'GBP',
    items: [
      { id: 'item-3', description: 'Cross-Border Fintech API Integration', quantity: 2, unitPrice: 1500, total: 3000 },
      { id: 'item-4', description: 'Monthly Retainer - Technical Architecture', quantity: 1, unitPrice: 1200, total: 1200 },
    ],
    subtotal: 4200,
    discountRate: 0,
    discountAmount: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 4200,
    status: 'pending',
    notes: 'Please process payment via UK Faster Payments or international wire transfer within 14 days.',
    createdAt: '2026-11-04T12:00:00Z',
  },
  {
    id: 'inv-103',
    userId: 'founder_demo_01',
    invoiceNumber: 'NEX-2026-0044',
    clientName: 'Korede Logistics Ltd',
    clientEmail: 'finance@koredelogistics.com',
    clientPhone: '+234 809 111 2233',
    clientAddress: 'Ikeja Industrial Estate, Lagos',
    issueDate: '2026-11-06',
    dueDate: '2026-11-13',
    currency: 'NGN',
    items: [
      { id: 'item-5', description: 'Automated Dispatch & Waybill Tracking Software License', quantity: 1, unitPrice: 450000, total: 450000 },
    ],
    subtotal: 450000,
    discountRate: 0,
    discountAmount: 0,
    taxRate: 7.5,
    taxAmount: 33750,
    total: 483750,
    status: 'pending',
    notes: 'Strict net 7 payment terms.',
    createdAt: '2026-11-06T08:30:00Z',
  },
];

// Realistic Seed Transactions
const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    userId: 'founder_demo_01',
    type: 'sale',
    title: 'Consulting Retainer - Apex Capital',
    amount: 1889312,
    currency: 'NGN',
    category: 'Consulting',
    date: '2026-11-02',
    paymentMethod: 'Bank Transfer',
    clientOrVendor: 'Apex Capital Nigeria',
    reference: 'REF-NIP-99281',
    createdAt: '2026-11-02T10:00:00Z',
  },
  {
    id: 'tx-002',
    userId: 'founder_demo_01',
    type: 'sale',
    title: 'Software Setup Fee - Paystack Integration',
    amount: 350000,
    currency: 'NGN',
    category: 'Services',
    date: '2026-11-05',
    paymentMethod: 'Card',
    clientOrVendor: 'SleekStore Retail',
    reference: 'PAY-882190',
    createdAt: '2026-11-05T14:20:00Z',
  },
  {
    id: 'tx-003',
    userId: 'founder_demo_01',
    type: 'sale',
    title: 'Offshore Technical Advisory',
    amount: 2500,
    currency: 'USD',
    category: 'Consulting',
    date: '2026-11-06',
    paymentMethod: 'Bank Transfer',
    clientOrVendor: 'Elevate Ventures US',
    reference: 'WIRE-US-4411',
    createdAt: '2026-11-06T16:00:00Z',
  },
  {
    id: 'tx-004',
    userId: 'founder_demo_01',
    type: 'expense',
    title: 'Office Generator Diesel & Facility Servicing',
    amount: 185000,
    currency: 'NGN',
    category: 'Utilities',
    date: '2026-11-03',
    paymentMethod: 'Bank Transfer',
    clientOrVendor: 'TotalEnergies Lekki',
    notes: '200 Litres diesel delivery for backup power',
    createdAt: '2026-11-03T11:00:00Z',
  },
  {
    id: 'tx-005',
    userId: 'founder_demo_01',
    type: 'expense',
    title: 'AWS Cloud Hosting & AI Infrastructure',
    amount: 180,
    currency: 'USD',
    category: 'Software & Tech',
    date: '2026-11-04',
    paymentMethod: 'Card',
    clientOrVendor: 'Amazon Web Services',
    reference: 'AWS-INV-77319',
    createdAt: '2026-11-04T09:00:00Z',
  },
  {
    id: 'tx-006',
    userId: 'founder_demo_01',
    type: 'expense',
    title: 'Google Workspace & Productivity Tools',
    amount: 45000,
    currency: 'NGN',
    category: 'Software & Tech',
    date: '2026-11-05',
    paymentMethod: 'Card',
    clientOrVendor: 'Google Cloud',
    createdAt: '2026-11-05T08:00:00Z',
  },
  {
    id: 'tx-007',
    userId: 'founder_demo_01',
    type: 'expense',
    title: 'Contract Frontend Developer Payout',
    amount: 300000,
    currency: 'NGN',
    category: 'Salaries & Wages',
    date: '2026-11-06',
    paymentMethod: 'Bank Transfer',
    clientOrVendor: 'Tunde Adebayo',
    notes: 'Sprint 3 completion milestone payout',
    createdAt: '2026-11-06T17:00:00Z',
  },
];

const SEED_ACTIVITIES: ActivityLogItem[] = [
  {
    id: 'act-101',
    action: 'Invoice Created',
    details: 'Generated invoice NEX-2026-0045 for Zenith Holdings Ltd (₦1,850,000)',
    category: 'invoice',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    linkView: 'invoices',
  },
  {
    id: 'act-102',
    action: 'Business Plan Generated',
    details: 'AI Writer generated "Enterprise Cloud Architecture & SLA Proposal"',
    category: 'ai',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    linkView: 'writer',
  },
  {
    id: 'act-103',
    action: 'Transaction Logged',
    details: 'Recorded expense: AWS Cloud Hosting Infrastructure (₦125,000)',
    category: 'finance',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    linkView: 'finance',
  },
  {
    id: 'act-104',
    action: 'Marketing Campaign Drafted',
    details: 'AI Marketing Assistant crafted 3-channel Q4 Growth Sprint copy',
    category: 'ai',
    timestamp: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    linkView: 'marketing',
  },
  {
    id: 'act-105',
    action: 'Security & Profile Updated',
    details: 'Configured CAC business verification & corporate bank details',
    category: 'settings',
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    linkView: 'settings',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  // Check if previous session was timed out or inactive for > 30 minutes
  const isInitialTimedOut = (() => {
    if (localStorage.getItem('nexvora_timed_out') === 'true') return true;
    const lastActiveStr = localStorage.getItem('nexvora_last_active');
    if (lastActiveStr) {
      const elapsed = Date.now() - parseInt(lastActiveStr, 10);
      if (elapsed >= IDLE_TIMEOUT_MS) return true;
    }
    return false;
  })();

  const [user, setUser] = useState<UserProfile | null>(() => {
    if (isInitialTimedOut) {
      localStorage.removeItem('nexvora_active_user');
      localStorage.removeItem('nexvora_last_active');
      sessionStorage.setItem(
        'nexvora_session_timeout',
        'Your session was closed after 30 minutes of inactivity to protect your private records.'
      );
      return null;
    }
    const saved = localStorage.getItem('nexvora_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return user?.currency || 'NGN';
  });

  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('nexvora_app_theme') as AppTheme;
    if (saved === 'midnight-forest') return 'midnight-forest';
    return 'default';
  });

  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>(() => (isInitialTimedOut ? [] : SEED_INVOICES));
  const [transactions, setTransactions] = useState<Transaction[]>(() => (isInitialTimedOut ? [] : SEED_TRANSACTIONS));
  const [savedGenerations, setSavedGenerations] = useState<SavedGeneration[]>([]);
  const [activities, setActivities] = useState<ActivityLogItem[]>(() => {
    if (isInitialTimedOut) return [];
    try {
      const saved = localStorage.getItem('nexvora_activities');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SEED_ACTIVITIES;
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(isInitialTimedOut);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Sync activities to storage
  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem('nexvora_activities', JSON.stringify(activities));
    }
  }, [activities]);

  // Sync theme to DOM & storage
  useEffect(() => {
    const activeTheme = theme === 'midnight-forest' ? 'midnight-forest' : 'default';
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('nexvora_app_theme', activeTheme);
  }, [theme]);

  // Sync user to storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('nexvora_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexvora_active_user');
    }
  }, [user]);

  // Idle timeout detector & automatic session purge
  useEffect(() => {
    if (!user) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleIdleTimeout = () => {
      console.warn('NEXVORA Security: User idle for 30 minutes. Purging session & private records.');
      // 1. Clear session from React state
      setUser(null);
      setInvoices([]);
      setTransactions([]);
      setSavedGenerations([]);
      setActivities([]);
      setToasts([]);

      // 2. Clear local storage authentication and cached records
      localStorage.removeItem('nexvora_active_user');
      localStorage.removeItem('nexvora_last_active');
      localStorage.removeItem('nexvora_activities');

      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.startsWith('nexvora_invoices_') ||
              key.startsWith('nexvora_txs_') ||
              key.startsWith('nexvora_profile_') ||
              key.startsWith('nexvora_gen_'))
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // ignore storage errors
      }

      // 3. Set security notice for the AuthModal
      sessionStorage.setItem(
        'nexvora_session_timeout',
        'Your session was closed after 30 minutes of inactivity to protect your private records.'
      );

      // 4. Redirect user to AuthModal
      setIsAuthModalOpen(true);
      setActiveView('dashboard');
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      localStorage.setItem('nexvora_last_active', Date.now().toString());
      timeoutId = setTimeout(handleIdleTimeout, IDLE_TIMEOUT_MS);
    };

    // Check if session already expired while device was sleeping or tab was backgrounded
    const lastActiveStr = localStorage.getItem('nexvora_last_active');
    if (lastActiveStr) {
      const elapsed = Date.now() - parseInt(lastActiveStr, 10);
      if (elapsed >= IDLE_TIMEOUT_MS) {
        handleIdleTimeout();
        return;
      }
    }

    // Initialize timer
    resetTimer();

    // Throttled activity event listener (prevents CPU churn on mouse moves)
    let lastEventTime = 0;
    const onUserActivity = () => {
      const now = Date.now();
      if (now - lastEventTime > 2000) {
        lastEventTime = now;
        resetTimer();
      }
    };

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, onUserActivity, { passive: true });
    });

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, onUserActivity);
      });
    };
  }, [user]);

  // Initial load
  useEffect(() => {
    refreshStatus();
    if (user) {
      loadUserData(user.id);
    }
  }, [user?.id]);

  const refreshStatus = async () => {
    const status = await api.getSystemStatus();
    setSystemStatus(status);
  };

  const loadUserData = async (userId: string) => {
    try {
      const [invs, txs, gens] = await Promise.all([
        api.getInvoices(userId),
        api.getTransactions(userId),
        api.getSavedGenerations(userId),
      ]);
      if (invs && invs.length > 0) setInvoices(invs);
      if (txs && txs.length > 0) setTransactions(txs);
      if (gens && gens.length > 0) setSavedGenerations(gens);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    if (user) {
      const updated = { ...user, currency: c };
      setUser(updated);
      api.saveProfile(updated);
    }
  };

  const setTheme = (t: AppTheme) => {
    const normalized: AppTheme = t === 'midnight-forest' ? 'midnight-forest' : 'default';
    setThemeState(normalized);
    if (user) {
      const updated: UserProfile = { ...user, theme: normalized };
      setUser(updated);
      api.saveProfile(updated);
    }
  };

  const logActivity = (item: Omit<ActivityLogItem, 'id' | 'timestamp'>) => {
    const newAct: ActivityLogItem = {
      ...item,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newAct, ...prev].slice(0, 50));
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem('nexvora_activities');
  };

  const showToast = (toastParams: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    setToasts((prev) => addToast(prev, toastParams));
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => removeToast(prev, id));
  };

  const saveInvoice = async (inv: Invoice) => {
    setInvoices((prev) => {
      const exists = prev.findIndex((i) => i.id === inv.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = inv;
        return copy;
      }
      return [inv, ...prev];
    });
    logActivity({
      action: 'Invoice Created',
      details: `${inv.invoiceNumber} for ${inv.clientName} (${inv.currency} ${inv.total.toLocaleString()})`,
      category: 'invoice',
      linkView: 'invoices',
    });
    showToast({
      type: 'success',
      title: 'Invoice Created',
      message: `${inv.invoiceNumber} for ${inv.clientName} (${inv.currency} ${inv.total.toLocaleString()})`,
      actionLabel: 'View Invoice',
      onAction: () => setActiveView('invoices'),
    });
    await api.saveInvoice(inv);
  };

  const deleteInvoice = async (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    logActivity({
      action: 'Invoice Deleted',
      details: `Removed invoice record #${id}`,
      category: 'invoice',
      linkView: 'invoices',
    });
    showToast({
      type: 'info',
      title: 'Invoice Removed',
      message: `Invoice record #${id} was deleted from database.`,
    });
    if (user) {
      await api.deleteInvoice(id, user.id);
    }
  };

  const saveTransaction = async (t: Transaction) => {
    setTransactions((prev) => {
      const exists = prev.findIndex((item) => item.id === t.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = t;
        return copy;
      }
      return [t, ...prev];
    });
    const actionLabel = t.type === 'sale' ? 'Income Logged' : 'Expense Logged';
    logActivity({
      action: actionLabel,
      details: `${t.title} (${t.currency} ${t.amount.toLocaleString()}) • ${t.category}`,
      category: 'finance',
      linkView: 'finance',
    });
    showToast({
      type: 'success',
      title: actionLabel,
      message: `${t.title} (${t.currency} ${t.amount.toLocaleString()})`,
      actionLabel: 'View Cash Flow',
      onAction: () => setActiveView('finance'),
    });
    await api.saveTransaction(t);
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    logActivity({
      action: 'Transaction Deleted',
      details: `Removed transaction entry #${id}`,
      category: 'finance',
      linkView: 'finance',
    });
    showToast({
      type: 'info',
      title: 'Transaction Deleted',
      message: `Transaction record #${id} removed.`,
    });
    if (user) {
      await api.deleteTransaction(id, user.id);
    }
  };

  const saveGenerationItem = async (item: SavedGeneration) => {
    setSavedGenerations((prev) => [item, ...prev]);
    const actionTitle = item.type === 'writer' ? 'Business Plan Generated' : 'Marketing Copy Generated';
    logActivity({
      action: actionTitle,
      details: item.title,
      category: 'ai',
      linkView: item.type === 'writer' ? 'writer' : 'marketing',
    });
    showToast({
      type: 'success',
      title: actionTitle,
      message: `"${item.title}" successfully crafted and saved.`,
      actionLabel: item.type === 'writer' ? 'Open Writer' : 'Open Marketing',
      onAction: () => setActiveView(item.type === 'writer' ? 'writer' : 'marketing'),
    });
    if (user) {
      await api.saveGeneration(item, user.id);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...profileData };
    setUser(updated);
    logActivity({
      action: 'Settings Updated',
      details: `Updated enterprise profile for ${updated.businessName}`,
      category: 'settings',
      linkView: 'settings',
    });
    showToast({
      type: 'success',
      title: 'Settings Saved',
      message: `Business profile for ${updated.businessName} updated.`,
    });
    await api.saveProfile(updated);
  };

  const setPlan = async (plan: 'FREE' | 'PRO' | 'BUSINESS') => {
    if (!user) return;
    const updated = { ...user, plan };
    setUser(updated);
    logActivity({
      action: 'Subscription Plan Changed',
      details: `Account upgraded to ${plan} tier`,
      category: 'settings',
      linkView: 'settings',
    });
    showToast({
      type: 'info',
      title: 'Subscription Changed',
      message: `Your account is now on the ${plan} tier.`,
    });
    await api.saveProfile(updated);
  };

  const loginAsDemo = () => {
    setUser(DEFAULT_DEMO_USER);
    setCurrencyState(DEFAULT_DEMO_USER.currency);
    setThemeState(DEFAULT_DEMO_USER.theme || 'default');
    setInvoices(SEED_INVOICES);
    setTransactions(SEED_TRANSACTIONS);
    setActivities(SEED_ACTIVITIES);
    localStorage.removeItem('nexvora_timed_out');
    localStorage.setItem('nexvora_last_active', Date.now().toString());
    setIsAuthModalOpen(false);
    showToast({
      type: 'info',
      title: 'Demo Session Active',
      message: `Welcome back, ${DEFAULT_DEMO_USER.fullName}!`,
    });
  };

  const loginWithUser = (targetUser: UserProfile) => {
    setUser(targetUser);
    if (targetUser.currency) setCurrency(targetUser.currency);
    localStorage.setItem('nexvora_active_user', JSON.stringify(targetUser));
    localStorage.removeItem('nexvora_timed_out');
    localStorage.setItem('nexvora_last_active', Date.now().toString());
    setIsAuthModalOpen(false);
    showToast({
      type: 'success',
      title: 'Biometric Authenticated',
      message: `Welcome back, ${targetUser.fullName || targetUser.businessName || 'Founder'}!`,
    });
  };

  const loginWithGoogle = (email = 'godsonmike900@gmail.com', name = 'Godson Mike') => {
    const newUser: UserProfile = {
      id: `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      fullName: name,
      businessName: `${name.split(' ')[0]} Technologies`,
      businessType: 'B2B Software & Digital Commerce',
      country: 'Nigeria',
      currency: 'NGN',
      plan: 'PRO',
      theme: 'default',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setCurrencyState(newUser.currency);
    localStorage.setItem('nexvora_active_user', JSON.stringify(newUser));
    localStorage.removeItem('nexvora_timed_out');
    localStorage.setItem('nexvora_last_active', Date.now().toString());
    setIsAuthModalOpen(false);
    showToast({
      type: 'success',
      title: 'Google Sign-In Successful',
      message: `Welcome to NEXVORA AI, ${newUser.fullName}!`,
    });
  };

  const loginWithPhone = (phone: string, fullName = 'Founder', businessName?: string) => {
    const newUser: UserProfile = {
      id: `phone_${phone.replace(/[^0-9]/g, '')}`,
      email: `${phone.replace(/[^0-9]/g, '')}@phone.nexvora.ai`,
      fullName,
      phone,
      businessName: businessName || `${fullName} Ventures Ltd`,
      businessType: 'Commercial Enterprise',
      country: 'Nigeria',
      currency: 'NGN',
      plan: 'PRO',
      theme: 'default',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setCurrencyState(newUser.currency);
    localStorage.setItem('nexvora_active_user', JSON.stringify(newUser));
    localStorage.removeItem('nexvora_timed_out');
    localStorage.setItem('nexvora_last_active', Date.now().toString());
    setIsAuthModalOpen(false);
    showToast({
      type: 'success',
      title: 'Mobile Verified',
      message: `Welcome to NEXVORA AI! Signed in via ${phone}.`,
    });
  };

  const loginWithEmail = (email: string, fullName?: string, businessName?: string) => {
    const computedName = fullName || email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Founder';
    const newUser: UserProfile = {
      id: `email_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      fullName: computedName,
      businessName: businessName || `${computedName.split(' ')[0]} Enterprise`,
      businessType: 'Digital Commerce',
      country: 'Nigeria',
      currency: 'NGN',
      plan: 'PRO',
      theme: 'default',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setCurrencyState(newUser.currency);
    localStorage.setItem('nexvora_active_user', JSON.stringify(newUser));
    localStorage.removeItem('nexvora_timed_out');
    localStorage.setItem('nexvora_last_active', Date.now().toString());
    setIsAuthModalOpen(false);
    showToast({
      type: 'success',
      title: 'Signed In',
      message: `Welcome back, ${newUser.fullName}!`,
    });
  };

  const registerNewUser = (payload: CreateAccountPayload) => {
    const profile = buildUserProfile(payload);
    setUser(profile);
    if (profile.currency) setCurrencyState(profile.currency);
    localStorage.setItem('nexvora_active_user', JSON.stringify(profile));
    localStorage.removeItem('nexvora_timed_out');
    localStorage.setItem('nexvora_last_active', Date.now().toString());
    setIsAuthModalOpen(false);
    showToast({
      type: 'success',
      title: 'Account Created',
      message: `Welcome to NEXVORA AI, ${profile.fullName}! Your enterprise workspace is ready.`,
    });
  };

  const logout = () => {
    setUser(null);
    setInvoices([]);
    setTransactions([]);
    setSavedGenerations([]);
    setActivities([]);
    setToasts([]);
    localStorage.removeItem('nexvora_active_user');
    localStorage.removeItem('nexvora_last_active');
    localStorage.removeItem('nexvora_activities');
    setIsAuthModalOpen(false);
    showToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been safely signed out of NEXVORA AI.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        currency,
        setCurrency,
        theme,
        setTheme,
        activeView,
        setActiveView,
        invoices,
        transactions,
        savedGenerations,
        activities,
        toasts,
        systemStatus,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isPricingModalOpen,
        setIsPricingModalOpen,
        isMobileNavOpen,
        setIsMobileNavOpen,
        isShortcutsModalOpen,
        setIsShortcutsModalOpen,
        isDownloadModalOpen,
        setIsDownloadModalOpen,
        saveInvoice,
        deleteInvoice,
        saveTransaction,
        deleteTransaction,
        saveGenerationItem,
        updateProfile,
        setPlan,
        logActivity,
        clearActivities,
        showToast,
        dismissToast,
        loginAsDemo,
        loginWithGoogle,
        loginWithPhone,
        loginWithEmail,
        registerNewUser,
        loginWithUser,
        logout,
        refreshStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
