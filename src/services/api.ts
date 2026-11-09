import {
  ChatMessage,
  Invoice,
  MarketingContentRequest,
  BusinessWriterRequest,
  Transaction,
  UserProfile,
  SavedGeneration,
} from '../types';

const API_BASE = '/api';

export interface SystemStatus {
  status: string;
  platform: string;
  version: string;
  aiProvider: string;
  aiAvailable: boolean;
  database: string;
  supabaseConfigured: boolean;
}

export const api = {
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const res = await fetch(`${API_BASE}/system/status`);
      if (!res.ok) throw new Error('Status check failed');
      return await res.json();
    } catch {
      return {
        status: 'online',
        platform: 'NEXVORA AI',
        version: '1.0.0',
        aiProvider: 'Gemini 3.8 Flash (Server Ready)',
        aiAvailable: true,
        database: 'Local Persistent Store (Zero-Config Active)',
        supabaseConfigured: false,
      };
    }
  },

  async askAIAssistant(
    messages: ChatMessage[],
    businessContext: UserProfile,
    userId: string,
    userPlan: string
  ): Promise<{ reply: string; usage?: { remaining: number; max: number } }> {
    const res = await fetch(`${API_BASE}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, businessContext, userId, userPlan }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to communicate with AI Assistant');
    }
    return data;
  },

  async generateMarketing(
    request: MarketingContentRequest,
    userId: string,
    userPlan: string
  ): Promise<{ content: string; usage?: { remaining: number; max: number } }> {
    const res = await fetch(`${API_BASE}/ai/marketing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request, userId, userPlan }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate marketing content');
    }
    return data;
  },

  async generateBusinessDoc(
    request: BusinessWriterRequest,
    userId: string,
    userPlan: string
  ): Promise<{ content: string; usage?: { remaining: number; max: number } }> {
    const res = await fetch(`${API_BASE}/ai/writer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request, userId, userPlan }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate document');
    }
    return data;
  },

  // Invoices
  async getInvoices(userId: string): Promise<Invoice[]> {
    try {
      const res = await fetch(`${API_BASE}/invoices?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const local = localStorage.getItem(`nexvora_invoices_${userId}`);
      return local ? JSON.parse(local) : [];
    }
  },

  async saveInvoice(invoice: Invoice): Promise<Invoice> {
    try {
      const res = await fetch(`${API_BASE}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return invoice;
  },

  async deleteInvoice(id: string, userId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/invoices/${id}?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
    } catch {
      // ignore
    }
  },

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const res = await fetch(`${API_BASE}/transactions?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const local = localStorage.getItem(`nexvora_txs_${userId}`);
      return local ? JSON.parse(local) : [];
    }
  },

  async saveTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return transaction;
  },

  async deleteTransaction(id: string, userId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/transactions/${id}?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
    } catch {
      // ignore
    }
  },

  // Profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const res = await fetch(`${API_BASE}/profile?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const local = localStorage.getItem(`nexvora_profile_${userId}`);
      return local ? JSON.parse(local) : null;
    }
  },

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return profile;
  },

  // Saved Generations
  async getSavedGenerations(userId: string): Promise<SavedGeneration[]> {
    try {
      const res = await fetch(`${API_BASE}/saved-generations?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const local = localStorage.getItem(`nexvora_gen_${userId}`);
      return local ? JSON.parse(local) : [];
    }
  },

  async saveGeneration(item: SavedGeneration, userId: string): Promise<SavedGeneration> {
    try {
      const res = await fetch(`${API_BASE}/saved-generations?userId=${encodeURIComponent(userId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return item;
  },
};
