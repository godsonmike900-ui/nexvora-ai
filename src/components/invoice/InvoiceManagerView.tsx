import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Printer,
  ChevronRight,
  Eye,
  Building,
  DollarSign,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode, Invoice, InvoiceItem, InvoiceStatus } from '../../types';
import { calculateInvoiceTotals, formatCurrency } from '../../utils/calculations';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

export const InvoiceManagerView: React.FC = () => {
  const { user, invoices, saveInvoice, deleteInvoice, currency } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form State for New / Edit Invoice
  const [invoiceNumber, setInvoiceNumber] = useState(`NEX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [invCurrency, setInvCurrency] = useState<CurrencyCode>(currency);
  const [taxRate, setTaxRate] = useState(currency === 'NGN' ? 7.5 : 0);
  const [discountRate, setDiscountRate] = useState(0);
  const [notes, setNotes] = useState(
    user?.bankDetails?.bankName
      ? `Payment due within 14 days. Please transfer to ${user.bankDetails.bankName} Account: ${user.bankDetails.accountNumber} (${user.bankDetails.accountName}).`
      : 'Payment due within 14 days. Thank you for your business.'
  );
  const [status, setStatus] = useState<InvoiceStatus>('pending');

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Consulting & Strategy Services', quantity: 1, unitPrice: 250000, total: 250000 },
  ]);

  // Totals
  const totals = calculateInvoiceTotals(items, taxRate, discountRate);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          const qty = field === 'quantity' ? Number(value) : item.quantity;
          const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
          updated.total = Math.round(qty * price * 100) / 100;
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((i) => i.id !== id));
    }
  };

  const resetForm = () => {
    setInvoiceNumber(`NEX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setClientAddress('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setInvCurrency(currency);
    setTaxRate(currency === 'NGN' ? 7.5 : 0);
    setDiscountRate(0);
    setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !user) return;

    const newInvoice: Invoice = {
      id: selectedInvoice ? selectedInvoice.id : `inv-${Date.now()}`,
      userId: user.id,
      invoiceNumber,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      issueDate,
      dueDate,
      currency: invCurrency,
      items,
      subtotal: totals.subtotal,
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      discountRate: totals.discountRate,
      discountAmount: totals.discountAmount,
      total: totals.total,
      notes,
      status,
      createdAt: new Date().toISOString(),
    };

    await saveInvoice(newInvoice);
    setIsModalOpen(false);
    setSelectedInvoice(null);
    resetForm();
  };

  const openEditModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setInvoiceNumber(inv.invoiceNumber);
    setClientName(inv.clientName);
    setClientEmail(inv.clientEmail);
    setClientPhone(inv.clientPhone || '');
    setClientAddress(inv.clientAddress || '');
    setIssueDate(inv.issueDate);
    setDueDate(inv.dueDate);
    setInvCurrency(inv.currency);
    setTaxRate(inv.taxRate);
    setDiscountRate(inv.discountRate);
    setNotes(inv.notes || '');
    setStatus(inv.status);
    setItems(inv.items);
    setIsModalOpen(true);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <FileText className="h-4 w-4" />
            <span>Commercial Invoicing</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
            Invoice Generator & Manager
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create compliant invoices with automated VAT, discounts, bank details, and 1-click PDF download.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setSelectedInvoice(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-cyan-400"
        >
          <Plus className="h-4 w-4 text-slate-950" />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-slate-800 bg-[#090f1f] p-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client or invoice #..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'paid', 'overdue', 'draft'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table / List */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#090f1f] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Client</th>
                <th className="px-5 py-3.5">Issue / Due Date</th>
                <th className="px-5 py-3.5 text-right">Total Amount</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-xs text-slate-500">
                    No invoices matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="transition hover:bg-slate-900/50">
                    <td className="px-5 py-4 font-mono font-bold text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{inv.clientName}</div>
                      <div className="text-[11px] text-slate-400">{inv.clientEmail}</div>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div>Issued: {inv.issueDate}</div>
                      <div className="text-slate-400">Due: {inv.dueDate}</div>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-white">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : inv.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : inv.status === 'overdue'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => user && generateInvoicePDF(inv, user)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-600/20 hover:text-cyan-400 transition"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(inv)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                          title="Edit Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteInvoice(inv.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-[#090f1f] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {selectedInvoice ? 'Edit Invoice' : 'Create New Professional Invoice'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="mt-5 space-y-6">
              {/* Row 1: Invoice #, Currency, Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs font-mono text-white outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={invCurrency}
                    onChange={(e) => setInvCurrency(e.target.value as CurrencyCode)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white outline-none focus:border-cyan-400"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Row 2: Client Info */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                  Client Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Client Name / Business *</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Apex Capital Nigeria"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Client Email *</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="e.g. accounts@client.com"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Client Phone</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Client Address / City</label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="Victoria Island, Lagos"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Line Items
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center space-x-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 items-center rounded-xl border border-slate-800 bg-slate-900/40 p-2.5"
                    >
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          placeholder="Item description / service details"
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white outline-none focus:border-cyan-400"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white text-center outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                          placeholder="Unit Price"
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white text-right outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Tax, Discount, Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white outline-none focus:border-cyan-400"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="draft">Draft</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">VAT / Tax (%)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={discountRate}
                        onChange={(e) => setDiscountRate(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Payment Instructions & Notes</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal, invCurrency)}</span>
                  </div>
                  {totals.discountRate > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Discount ({totals.discountRate}%):</span>
                      <span>-{formatCurrency(totals.discountAmount, invCurrency)}</span>
                    </div>
                  )}
                  {totals.taxRate > 0 && (
                    <div className="flex justify-between text-cyan-400">
                      <span>Tax / VAT ({totals.taxRate}%):</span>
                      <span>+{formatCurrency(totals.taxAmount, invCurrency)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-700 pt-2 flex justify-between text-base font-black text-white">
                    <span>Grand Total:</span>
                    <span className="text-cyan-400">{formatCurrency(totals.total, invCurrency)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-2 text-xs font-bold text-slate-950 shadow-md hover:from-blue-500 hover:to-cyan-400"
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
