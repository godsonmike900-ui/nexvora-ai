import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Trash2,
  Calendar,
  Filter,
  CheckCircle2,
  TrendingUp,
  X,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode, Transaction, TransactionCategory, TransactionType } from '../../types';
import {
  calculateExpensesTotals,
  calculateNetProfit,
  calculateProfitMargin,
  calculateSalesTotals,
  filterTransactionsByPeriod,
  formatCurrency,
} from '../../utils/calculations';

const CATEGORIES: TransactionCategory[] = [
  'Direct Sales',
  'Consulting',
  'Services',
  'Subscription',
  'Marketing & Ads',
  'Salaries & Wages',
  'Office & Rent',
  'Inventory & Goods',
  'Software & Tech',
  'Logistics & Delivery',
  'Utilities',
  'Taxes & Levies',
  'Other',
];

const PAYMENT_METHODS = [
  'Bank Transfer',
  'Card',
  'Cash',
  'USSD/Mobile Money',
  'Other',
] as const;

export const SalesExpenseView: React.FC = () => {
  const { user, transactions, saveTransaction, deleteTransaction, currency } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'sale' | 'expense'>('all');
  const [period, setPeriod] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('sale');

  // Form fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Direct Sales');
  const [txCurrency, setTxCurrency] = useState<CurrencyCode>(currency);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Card' | 'Cash' | 'USSD/Mobile Money' | 'Other'>('Bank Transfer');
  const [clientOrVendor, setClientOrVendor] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // 1. Filter by period
  const periodTransactions = filterTransactionsByPeriod(transactions, period);

  // 2. Filter by search & type
  const displayedTransactions = periodTransactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCurrency = !selectedCurrency || t.currency === selectedCurrency;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.clientOrVendor && t.clientOrVendor.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesCurrency && matchesSearch;
  });

  // KPI calculations for selected currency & period
  const totalSales = calculateSalesTotals(periodTransactions, selectedCurrency);
  const totalExpenses = calculateExpensesTotals(periodTransactions, selectedCurrency);
  const netProfit = calculateNetProfit(totalSales, totalExpenses);
  const margin = calculateProfitMargin(totalSales, totalExpenses);

  const handleOpenModal = (type: TransactionType) => {
    setModalType(type);
    setTitle('');
    setAmount('');
    setCategory(type === 'sale' ? 'Direct Sales' : 'Office & Rent');
    setTxCurrency(selectedCurrency);
    setDate(new Date().toISOString().split('T')[0]);
    setClientOrVendor('');
    setReference('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0 || !user) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: user.id,
      type: modalType,
      title,
      amount: Math.round(Number(amount) * 100) / 100,
      currency: txCurrency,
      category,
      date,
      paymentMethod,
      clientOrVendor,
      reference,
      notes,
      createdAt: new Date().toISOString(),
    };

    await saveTransaction(newTx);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <DollarSign className="h-4 w-4" />
            <span>Cash Flow Ledger</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
            Sales & Expense Manager
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Record revenue, track operational expenditures, and monitor daily/weekly/monthly profit margins.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => handleOpenModal('sale')}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:from-emerald-500 hover:to-teal-400"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Record Sale</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal('expense')}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:from-rose-500 hover:to-pink-500"
          >
            <ArrowDownRight className="h-4 w-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5">
          <span className="text-xs font-semibold text-slate-400">
            Total Revenue ({selectedCurrency})
          </span>
          <div className="mt-2 text-2xl font-black text-emerald-400">
            +{formatCurrency(totalSales, selectedCurrency)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Period: {period.toUpperCase()}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5">
          <span className="text-xs font-semibold text-slate-400">
            Total Expenses ({selectedCurrency})
          </span>
          <div className="mt-2 text-2xl font-black text-rose-400">
            -{formatCurrency(totalExpenses, selectedCurrency)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Operating overhead</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5">
          <span className="text-xs font-semibold text-slate-400">
            Estimated Net Profit
          </span>
          <div className={`mt-2 text-2xl font-black ${netProfit >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {formatCurrency(netProfit, selectedCurrency)}
          </div>
          <p className="mt-1 text-[11px] text-cyan-400">
            Net bottom line ({margin}% margin)
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Currency Ledger</span>
          <div className="mt-2 flex space-x-1">
            {(['NGN', 'USD', 'GBP', 'EUR'] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setSelectedCurrency(curr)}
                className={`flex-1 rounded-lg py-1 text-xs font-bold transition ${
                  selectedCurrency === curr
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Multi-currency accounting</p>
        </div>
      </div>

      {/* Filter and Period Selector Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between rounded-2xl border border-slate-800 bg-[#090f1f] p-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, client, vendor..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Period Filter (Daily, Weekly, Monthly, All) */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/80 p-0.5 text-xs">
            {(['all', 'daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-md px-2.5 py-1 font-semibold uppercase tracking-wider transition ${
                  period === p ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Type Filter (All, Sales, Expenses) */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/80 p-0.5 text-xs">
            {(['all', 'sale', 'expense'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`rounded-md px-2.5 py-1 font-semibold capitalize transition ${
                  filterType === t ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'all' ? 'All Transactions' : `${t}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#090f1f] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Type & Title</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Date & Method</th>
                <th className="px-5 py-3.5">Client / Vendor</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-xs text-slate-500">
                    No transactions recorded for this selection.
                  </td>
                </tr>
              ) : (
                displayedTransactions.map((tx) => (
                  <tr key={tx.id} className="transition hover:bg-slate-900/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
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
                          <div className="font-semibold text-white">{tx.title}</div>
                          {tx.notes && <div className="text-[11px] text-slate-400">{tx.notes}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300 border border-slate-700/60">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div>{tx.date}</div>
                      <div className="text-slate-400">{tx.paymentMethod}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-300">
                      {tx.clientOrVendor || '—'}
                      {tx.reference && (
                        <div className="text-[10px] font-mono text-slate-500">{tx.reference}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right font-bold">
                      <span className={tx.type === 'sale' ? 'text-emerald-400' : 'text-slate-200'}>
                        {tx.type === 'sale' ? '+' : '-'}
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => deleteTransaction(tx.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-950/30 hover:text-rose-400 transition"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#090f1f] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                {modalType === 'sale' ? (
                  <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-rose-400" />
                )}
                <h3 className="text-base font-bold text-white">
                  {modalType === 'sale' ? 'Record Revenue / Sale' : 'Record Operating Expense'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    modalType === 'sale'
                      ? 'e.g. Website design upfront deposit'
                      : 'e.g. Office Generator Fuel / Diesel'
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs sm:text-sm text-white outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={txCurrency}
                    onChange={(e) => setTxCurrency(e.target.value as CurrencyCode)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {modalType === 'sale' ? 'Client Name' : 'Vendor / Supplier'}
                  </label>
                  <input
                    type="text"
                    value={clientOrVendor}
                    onChange={(e) => setClientOrVendor(e.target.value)}
                    placeholder={modalType === 'sale' ? 'Client' : 'Supplier'}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reference or Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Bank NIP transfer ref #198273"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md ${
                    modalType === 'sale'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
