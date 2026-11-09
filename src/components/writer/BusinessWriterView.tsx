import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  Copy,
  Check,
  Download,
  Bookmark,
  RefreshCw,
  FileCheck,
  FileText,
  User,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BusinessWriterRequest, SavedGeneration } from '../../types';
import { api } from '../../services/api';

const DOC_TYPES = [
  { id: 'proposal', label: 'Business Proposal', desc: 'Commercial proposals with scope, pricing, and terms' },
  { id: 'email', label: 'Executive Email', desc: 'Investor pitch, follow-up, or partnership negotiation' },
  { id: 'customer_response', label: 'Customer Service Escalation', desc: 'De-escalation, refunds, or formal service replies' },
  { id: 'business_letter', label: 'Formal Business Letter', desc: 'Legal notices, partnership letters, or tender bids' },
  { id: 'company_profile', label: 'Company Profile & Bio', desc: 'Corporate overview, vision, capabilities, and CAC summary' },
  { id: 'project_description', label: 'Project Scope of Work', desc: 'Deliverables, milestones, timeline, and SLA definitions' },
  { id: 'report', label: 'Executive Management Report', desc: 'Monthly performance, operational review, or milestone audit' },
];

const WRITER_TONES = [
  'Formal & Executive',
  'Persuasive & Commercial',
  'Conciliatory & Professional (Customer Service)',
  'Technical & Rigorous',
  'Visionary & Investor-Focused',
];

export const BusinessWriterView: React.FC = () => {
  const { user, saveGenerationItem } = useApp();

  const [docType, setDocType] = useState<BusinessWriterRequest['docType']>('proposal');
  const [title, setTitle] = useState('');
  const [senderName, setSenderName] = useState(user?.businessName || 'VoraTech Solutions Ltd');
  const [recipientName, setRecipientName] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [tone, setTone] = useState('Formal & Executive');
  const [additionalDetails, setAdditionalDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDoc = async () => {
    if (!title.trim() || !keyPoints.trim()) {
      setError('Please provide a document title/subject and core points or requirements.');
      return;
    }

    setError(null);
    setLoading(true);
    setSaved(false);

    const request: BusinessWriterRequest = {
      docType,
      title,
      senderName: senderName || user?.businessName || 'Business Executive',
      recipientName: recipientName || 'Client / Partner',
      keyPoints,
      tone,
      additionalDetails,
    };

    try {
      const res = await api.generateBusinessDoc(
        request,
        user?.id || 'demo_user',
        user?.plan || 'PRO'
      );
      setGeneratedDoc(res.content);
    } catch (err: any) {
      setError(err.message || 'Failed to generate document.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!generatedDoc) return;
    const blob = new Blob([generatedDoc], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_') || 'NEXVORA_Document'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToVault = async () => {
    if (!generatedDoc) return;
    const item: SavedGeneration = {
      id: `doc-${Date.now()}`,
      type: 'writer',
      category: docType,
      title: title || `${docType} document`,
      content: generatedDoc,
      createdAt: new Date().toISOString(),
    };
    await saveGenerationItem(item);
    setSaved(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <PenTool className="h-4 w-4" />
          <span>Executive Document Suite</span>
        </div>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
          NEXVORA AI Business Writer
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Generate high-stakes business proposals, commercial emails, customer dispute resolutions, company profiles, and reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Doc Type Selector */}
          <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              1. Choose Document Archetype
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DOC_TYPES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDocType(d.id as any)}
                  className={`rounded-xl p-3 text-left transition ${
                    docType === d.id
                      ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border border-cyan-400/50 text-white'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className={`h-4 w-4 ${docType === d.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold text-white">{d.label}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form details */}
          <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              2. Document Parameters
            </label>

            {/* Title / Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Document Title / Subject Line *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Enterprise Cloud ERP Implementation Proposal for Zenith Manufacturing"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>

            {/* Sender & Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  From (Your Company / Name)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. VoraTech Solutions Ltd"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  To (Client / Organization / Recipient)
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Board of Directors, Apex Capital Nigeria"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Key Points */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Core Points, Deliverables, or Requirements *
              </label>
              <textarea
                rows={4}
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="e.g. 1. 30-day delivery timeline. 2. Implementation of biometric attendance system. 3. ₦4,500,000 total investment with 50% upfront. 4. 99.9% uptime SLA and 12-month maintenance."
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Executive Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
              >
                {WRITER_TONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerateDoc}
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-3.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Drafting Executive Document...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-slate-950" />
                  <span>Draft Document with NEXVORA AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output: 5 cols */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex-1 rounded-2xl border border-slate-800 bg-[#090f1f] p-5 flex flex-col min-h-[480px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Document Preview
                </span>
              </div>

              {generatedDoc && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                    title="Copy text"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                    title="Download as Markdown"
                  >
                    <Download className="h-3 w-3" />
                    <span>Export</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToVault}
                    className={`flex items-center space-x-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                      saved
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-400'
                        : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <Bookmark className="h-3 w-3" />
                    <span>{saved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto mt-4 pr-1">
              {loading ? (
                <div className="flex h-full flex-col items-center justify-center space-y-3 py-16 text-center text-slate-400">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  <p className="text-xs text-slate-400">Structuring corporate headers and strategic clauses...</p>
                </div>
              ) : generatedDoc ? (
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-200">
                  {generatedDoc}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center space-y-3 py-24 text-center text-slate-500">
                  <PenTool className="h-8 w-8 text-slate-700" />
                  <p className="text-xs max-w-xs">
                    Choose a document archetype and provide your parameters to produce an executive-ready business document.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
