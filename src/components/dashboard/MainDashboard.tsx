import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Megaphone,
  PenTool,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Database,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  calculateExpensesTotals,
  calculateNetProfit,
  calculateSalesTotals,
  formatCurrency,
} from '../../utils/calculations';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { ActivityLog } from './ActivityLog';

export const MainDashboard: React.FC = () => {
  const {
    user,
    currency,
    invoices,
    transactions,
    setActiveView,
    setIsPricingModalOpen,
    setIsDownloadModalOpen,
    systemStatus,
  } = useApp();

  const [quickAiPrompt, setQuickAiPrompt] = useState('');

  // Financial calculations
  const totalRevenue = calculateSalesTotals(transactions, currency);
  const totalExpenses = calculateExpensesTotals(transactions, currency);
  const netProfit = calculateNetProfit(totalRevenue, totalExpenses);
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Recent Invoices (sorted newest first)
  const recentInvoices = invoices.slice(0, 4);
  // Recent Transactions
  const recentTransactions = transactions.slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAiPrompt.trim()) return;
    // Store in sessionStorage for the assistant to pick up
    sessionStorage.setItem('nexvora_initial_ai_query', quickAiPrompt);
    setActiveView('assistant');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-400 border border-rose-500/20">
            <AlertCircle className="mr-1 h-3 w-3" /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-slate-400 border border-slate-500/20">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header & Personalized Welcome */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-[#0d172e] via-[#091224] to-[#070b14] p-6 shadow-xl lg:p-8">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Enterprise Command Center</span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Founder'} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {user?.businessName || 'Your Business'} •{' '}
              <span className="text-cyan-400 font-medium">NEXVORA AI</span> is active and ready to scale your revenue.
            </p>

            {/* Connection Health & Readiness Badges */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              {/* Database Connection */}
              <div
                className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300 shadow-sm transition hover:border-slate-600"
                title={systemStatus?.database || 'Database connected and active'}
              >
                <Database className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-200">Database:</span>
                <span className="flex items-center space-x-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-400 font-medium">
                    {systemStatus?.supabaseConfigured ? 'Supabase Postgres' : 'Active (Local Sync)'}
                  </span>
                </span>
              </div>

              {/* AI API Engine */}
              <div
                className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300 shadow-sm transition hover:border-slate-600"
                title={systemStatus?.aiProvider || 'Gemini 3.8 Flash Online'}
              >
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                <span className="font-semibold text-slate-200">AI Engine:</span>
                <span className="flex items-center space-x-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
                  </span>
                  <span className="text-cyan-300 font-medium">
                    {systemStatus?.aiAvailable ? 'Gemini 3.8 Online' : 'Key Ready'}
                  </span>
                </span>
              </div>

              {/* RLS Security Guard */}
              <div
                className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300 shadow-sm"
                title="Row Level Security active on all multi-tenant tables"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-200">Security:</span>
                <span className="text-indigo-300 font-medium">RLS Isolated</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveView('invoices')}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-500 hover:to-indigo-500"
            >
              <Plus className="h-4 w-4" />
              <span>Create Invoice</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('finance')}
              className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>Log Transaction</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              className="hidden sm:flex items-center space-x-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-4 py-2.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-900/40 hover:border-cyan-400"
            >
              <Download className="h-4 w-4 text-cyan-400" />
              <span>Download App</span>
            </button>
          </div>
        </div>

        {/* Quick Strategic AI Launcher */}
        <div className="mt-6 border-t border-slate-800/80 pt-6">
          <form onSubmit={handleQuickPromptSubmit} className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 flex items-center text-cyan-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={quickAiPrompt}
              onChange={(e) => setQuickAiPrompt(e.target.value)}
              placeholder="Ask NEXVORA AI anything (e.g. 'How can I double sales this month in Lagos?', 'Write a customer recovery email')..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-3 pl-10 pr-24 text-xs sm:text-sm text-white placeholder-slate-400 shadow-inner outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 flex items-center space-x-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              <span>Ask AI</span>
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-800 bg-[#0a1020] p-5 shadow-sm transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Revenue ({currency})</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">
            {formatCurrency(totalRevenue, currency)}
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-400">
            <span>Logged sales across this currency</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="rounded-2xl border border-slate-800 bg-[#0a1020] p-5 shadow-sm transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Expenses ({currency})</span>
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">
            {formatCurrency(totalExpenses, currency)}
          </div>
          <div className="mt-2 flex items-center text-xs text-rose-400">
            <span>Operational & inventory costs</span>
          </div>
        </div>

        {/* Estimated Net Profit */}
        <div className="rounded-2xl border border-slate-800 bg-[#0a1020] p-5 shadow-sm transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Estimated Net Profit</span>
            <div className={`rounded-lg p-2 ${netProfit >= 0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className={`mt-3 text-2xl font-black ${netProfit >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {formatCurrency(netProfit, currency)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-400">
            <span className="font-semibold text-cyan-400 mr-1">{profitMargin}%</span> profit margin
          </div>
        </div>

        {/* AI Actions & Tier */}
        <div className="rounded-2xl border border-slate-800 bg-[#0a1020] p-5 shadow-sm transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">AI Intelligence Tier</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <Bot className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{user?.plan || 'PRO'}</span>
            <span className="text-xs text-cyan-400">Unlimited Models</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Gemini 3.8 Flash Engine</span>
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="text-cyan-400 hover:underline font-medium"
            >
              View limits
            </button>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Shortcuts Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Platform Modules & Shortcuts</h2>
            <p className="text-xs text-slate-400">Launch any NEXVORA AI business tool directly</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {/* AI Assistant */}
          <button
            type="button"
            onClick={() => setActiveView('assistant')}
            className="group flex flex-col items-start rounded-2xl border border-slate-800 bg-[#090f1e] p-4 text-left transition hover:border-cyan-500/50 hover:bg-[#0c152a] hover:shadow-lg hover:shadow-cyan-500/5"
          >
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-cyan-300">
              <Bot className="h-5 w-5" />
            </div>
            <div className="mt-3 text-xs font-bold text-white group-hover:text-cyan-300">AI Assistant</div>
            <div className="text-[11px] text-slate-400">Strategy & Advice</div>
          </button>

          {/* Marketing Studio */}
          <button
            type="button"
            onClick={() => setActiveView('marketing')}
            className="group flex flex-col items-start rounded-2xl border border-slate-800 bg-[#090f1e] p-4 text-left transition hover:border-cyan-500/50 hover:bg-[#0c152a] hover:shadow-lg hover:shadow-cyan-500/5"
          >
            <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="mt-3 text-xs font-bold text-white group-hover:text-purple-300">Marketing Studio</div>
            <div className="text-[11px] text-slate-400">Ads, Captions, TikTok</div>
          </button>

          {/* Business Writer */}
          <button
            type="button"
            onClick={() => setActiveView('writer')}
            className="group flex flex-col items-start rounded-2xl border border-slate-800 bg-[#090f1e] p-4 text-left transition hover:border-cyan-500/50 hover:bg-[#0c152a] hover:shadow-lg hover:shadow-cyan-500/5"
          >
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300">
              <PenTool className="h-5 w-5" />
            </div>
            <div className="mt-3 text-xs font-bold text-white group-hover:text-emerald-300">Business Writer</div>
            <div className="text-[11px] text-slate-400">Proposals & Letters</div>
          </button>

          {/* Invoice Generator */}
          <button
            type="button"
            onClick={() => setActiveView('invoices')}
            className="group flex flex-col items-start rounded-2xl border border-slate-800 bg-[#090f1e] p-4 text-left transition hover:border-cyan-500/50 hover:bg-[#0c152a] hover:shadow-lg hover:shadow-cyan-500/5"
          >
            <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300">
              <FileText className="h-5 w-5" />
            </div>
            <div className="mt-3 text-xs font-bold text-white group-hover:text-cyan-300">Invoice Gen</div>
            <div className="text-[11px] text-slate-400">PDF & Bank Billing</div>
          </button>

          {/* Sales & Expenses */}
          <button
            type="button"
            onClick={() => setActiveView('finance')}
            className="group flex flex-col items-start rounded-2xl border border-slate-800 bg-[#090f1e] p-4 text-left transition hover:border-cyan-500/50 hover:bg-[#0c152a] hover:shadow-lg hover:shadow-cyan-500/5"
          >
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-300">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="mt-3 text-xs font-bold text-white group-hover:text-amber-300">Sales & Expenses</div>
            <div className="text-[11px] text-slate-400">Cash Flow Records</div>
          </button>

          {/* Business Analytics */}
          <button
            type="button"
            onClick={() => setActiveView('analytics')}
            className="group flex flex-col items-start rounded-2xl border border-slate-800 bg-[#090f1e] p-4 text-left transition hover:border-cyan-500/50 hover:bg-[#0c152a] hover:shadow-lg hover:shadow-cyan-500/5"
          >
            <div className="rounded-xl bg-pink-500/10 p-2.5 text-pink-400 group-hover:bg-pink-500/20 group-hover:text-pink-300">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="mt-3 text-xs font-bold text-white group-hover:text-pink-300">Analytics</div>
            <div className="text-[11px] text-slate-400">Financial Growth</div>
          </button>
        </div>
      </div>

      {/* 4. Split Section: Recent Invoices & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Invoices with Instant PDF Download */}
        <div className="rounded-2xl border border-slate-800 bg-[#090f1e] p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Recent Invoices</h3>
            </div>
            <button
              onClick={() => setActiveView('invoices')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              View all ({invoices.length})
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-800/60">
            {recentInvoices.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No invoices created yet. Generate your first invoice in seconds.
              </div>
            ) : (
              recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-3 transition hover:bg-slate-900/40 px-2 rounded-lg"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {inv.invoiceNumber}
                      </span>
                      {getStatusBadge(inv.status)}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {inv.clientName} • Due {inv.dueDate}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-white">
                      {formatCurrency(inv.total, inv.currency)}
                    </span>
                    <button
                      type="button"
                      onClick={() => user && generateInvoicePDF(inv, user)}
                      title="Download PDF"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-600/20 hover:text-cyan-400 transition"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Cash Flow & Transactions */}
        <div className="rounded-2xl border border-slate-800 bg-[#090f1e] p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Recent Cash Inflow & Outflow</h3>
            </div>
            <button
              onClick={() => setActiveView('finance')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              View all ({transactions.length})
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-800/60">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No transactions recorded yet.
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 transition hover:bg-slate-900/40 px-2 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        tx.type === 'sale'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {tx.type === 'sale' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{tx.title}</div>
                      <div className="text-[11px] text-slate-400">
                        {tx.category} • {tx.date} • {tx.paymentMethod}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-bold ${
                        tx.type === 'sale' ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {tx.type === 'sale' ? '+' : '-'}
                      {formatCurrency(tx.amount, tx.currency)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Live Activity Log */}
      <ActivityLog />
    </div>
  );
};
