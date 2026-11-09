import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Printer,
  Scale,
  Building,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LegalView: React.FC = () => {
  const { setActiveView } = useApp();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'security'>('privacy');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Legal, Privacy & Compliance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            NEXVORA AI policies, data protection guarantees, and terms of service.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5 text-cyan-400" />
            <span>Print or Save PDF</span>
          </button>
          <span className="inline-flex items-center rounded-xl bg-cyan-950/70 border border-cyan-800/60 px-3 py-2 text-[11px] font-semibold text-cyan-300">
            Version 1.0 (Nov 2026)
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${
            activeTab === 'privacy'
              ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Privacy Policy (NDPR & GDPR)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('terms')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${
            activeTab === 'terms'
              ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Terms of Service</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${
            activeTab === 'security'
              ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Data Security & RLS</span>
        </button>
      </div>

      {/* Content Container */}
      <div className="rounded-3xl border border-slate-800 bg-[#090f1f] p-6 sm:p-10 shadow-xl text-slate-300 space-y-8 leading-relaxed">
        {/* ================= PRIVACY POLICY ================= */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Data Protection & Privacy
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                NEXVORA AI Privacy Policy
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Last modified: November 7, 2026 • Compliant with Nigeria Data Protection Act (NDPA/NDPR) & General Data Protection Regulation (GDPR)
              </p>
            </div>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                1. Introduction & Overview
              </h3>
              <p className="text-xs sm:text-sm">
                NEXVORA AI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Platform&rdquo;) provides business intelligence, financial management, invoicing, and artificial intelligence solutions for entrepreneurs, startups, and SMEs in Nigeria and globally. We respect your privacy and are committed to protecting the confidential financial data, client invoices, and business trade secrets entrusted to us.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                2. Information We Collect
              </h3>
              <p className="text-xs sm:text-sm">
                To operate your business management workspace, we collect and store:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-300">
                <li>
                  <strong className="text-white">Account Information:</strong> Name, business name, Corporate Affairs Commission (CAC) registration number, business address, phone number, and email.
                </li>
                <li>
                  <strong className="text-white">Financial & Billing Records:</strong> Invoices issued, client contact information, items, pricing, tax rates (including 7.5% Nigerian VAT), recorded revenue, and expense transactions.
                </li>
                <li>
                  <strong className="text-white">Banking Details for Invoicing:</strong> Bank name, account number, account holder name, and SWIFT/BIC codes used solely to populate payment instructions on your customer invoices.
                </li>
                <li>
                  <strong className="text-white">AI Prompts & Generated Content:</strong> Queries sent to the AI Business Assistant, Marketing Studio, and Business Writer.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                3. Zero AI Model Training on Private Business Data
              </h3>
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>Our Foundational Commitment: Your Data Is Never Used to Train AI</span>
                </div>
                <p className="text-xs text-slate-300">
                  Prompts and business parameters submitted to NEXVORA AI are processed through enterprise-grade server endpoints utilizing Google Gemini 3.8 Flash. Your private invoices, client names, banking details, and commercial strategies are <strong>never</strong> used to train public foundation models or shared with third-party advertisers.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                4. Data Protection & Row Level Security (RLS)
              </h3>
              <p className="text-xs sm:text-sm">
                All records stored in our PostgreSQL database infrastructure are protected by cryptographic token authentication and <strong>Row Level Security (RLS)</strong>. Each record is strictly bound to the authenticated user ID (`auth.uid() = user_id`). No other business owner, freelancer, or unauthorized third party can read, update, or query your invoices, cash flow, or private drafts.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                5. User Rights Under NDPA & GDPR
              </h3>
              <p className="text-xs sm:text-sm">
                Under the Nigeria Data Protection Act (NDPA) and international GDPR guidelines, you have the following irrevocable rights:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li><strong className="text-white">Right of Access:</strong> You can view all stored invoices, transactions, and profile data at any time.</li>
                <li><strong className="text-white">Right of Data Portability:</strong> You can export and download your business records in PDF and JSON formats.</li>
                <li><strong className="text-white">Right to Rectification:</strong> You can edit or correct business data directly in the Settings view.</li>
                <li><strong className="text-white">Right to Erasure:</strong> You can request full deletion of your account and all associated invoices and records.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                6. Contact the Data Protection Officer
              </h3>
              <p className="text-xs sm:text-sm">
                If you have inquiries regarding privacy or wish to exercise data subject rights, contact our Data Protection Team at <code className="text-cyan-400">privacy@nexvora.ai</code> or <code className="text-cyan-400">support@nexvora.ai</code>.
              </p>
            </section>
          </div>
        )}

        {/* ================= TERMS OF SERVICE ================= */}
        {activeTab === 'terms' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Legal Agreement
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                NEXVORA AI Terms of Service
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Effective Date: November 7, 2026 • Please read carefully before utilizing NEXVORA AI tools and services.
              </p>
            </div>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                1. Acceptance of Terms
              </h3>
              <p className="text-xs sm:text-sm">
                By registering, creating an account, or accessing the NEXVORA AI web platform or Android mobile application, you agree to be bound by these Terms of Service and all applicable laws and regulations in the Federal Republic of Nigeria and your local jurisdiction.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                2. Nature of the Service & Non-Legal / Non-Tax Advisory Disclaimer
              </h3>
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs sm:text-sm">
                  <Scale className="h-4 w-4 text-amber-400" />
                  <span>Important Professional Services Disclaimer</span>
                </div>
                <p className="text-xs text-slate-300">
                  NEXVORA AI provides computational business management tools, invoice calculation utilities, and artificial intelligence-generated drafts. <strong>NEXVORA AI is not a law firm, chartered accountancy practice, or registered tax advisory firm.</strong> The AI suggestions, marketing copy, tax calculations (e.g. 7.5% VAT), and legal contract drafts are intended for operational assistance and do not constitute formal legal counsel, audit certifications, or tax filings. You are advised to consult a certified legal practitioner or chartered tax accountant (CITN/ICAN) for statutory corporate filings with the CAC or FIRS.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                3. Ownership of Generated Content & Invoices
              </h3>
              <p className="text-xs sm:text-sm">
                You retain <strong className="text-white">100% full commercial ownership</strong> of all invoices created, business proposals generated, social media marketing campaigns, and transaction records produced via NEXVORA AI. NEXVORA AI claims no intellectual property rights or royalties over your customer relationships, commercial contracts, or sales deliverables.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                4. User Conduct & Prohibited Uses
              </h3>
              <p className="text-xs sm:text-sm">
                You agree not to use NEXVORA AI for:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Issuing fraudulent invoices, fictitious billing, or money laundering activities.</li>
                <li>Generating deceptive, defamatory, or unlawful promotional material.</li>
                <li>Attempting to reverse-engineer, probe, or bypass Row Level Security or API rate limits.</li>
                <li>Impersonating businesses or registering Corporate Affairs Commission (CAC) numbers belonging to third parties.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                5. Subscription Plans & AI Quotas
              </h3>
              <p className="text-xs sm:text-sm">
                NEXVORA AI provides Free, Pro, and Business tiers. Daily AI generation limits (e.g., 25 requests/day for Free, 200/day for Pro, 1,000/day for Business) are allocated per user account. Unused quotas do not roll over. We reserve the right to prevent abusive or automated script-based spamming of the AI infrastructure.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                6. Governing Law & Dispute Resolution
              </h3>
              <p className="text-xs sm:text-sm">
                These terms shall be governed and interpreted in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising out of or in connection with these terms shall first be subject to good-faith mediation prior to formal arbitration.
              </p>
            </section>
          </div>
        )}

        {/* ================= SECURITY & RLS ================= */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Technical Architecture
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Data Security & Tenant Isolation
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                How NEXVORA AI protects financial ledgers, corporate records, and AI prompts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs sm:text-sm">
                  <Lock className="h-4 w-4" />
                  <span>Row Level Security (RLS)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every SQL table (`profiles`, `invoices`, `transactions`, `ai_generations`) enforces cryptographic isolation via `auth.uid() = user_id`. No tenant can query or tamper with another enterprise&apos;s data.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs sm:text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Zero Key Exposure</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All artificial intelligence interactions are proxied through an Express server backend. Machine learning API keys (`GEMINI_API_KEY`) are stored in secure cloud environment variables and never shipped to client browsers.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs sm:text-sm">
                  <FileText className="h-4 w-4" />
                  <span>Client-Side PDF Compilation</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Customer invoices are rendered and compiled directly within your device&apos;s browser using vectorized HTML5 Canvas and `jspdf`. Your confidential pricing sheets never traverse unencrypted third-party document parsers.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
                <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs sm:text-sm">
                  <Building className="h-4 w-4" />
                  <span>Multi-Currency Auditing</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time mathematical validation guarantees that currency conversions (NGN, USD, GBP, EUR) and statutory 7.5% Nigerian VAT calculations match verified balance sheet accounting rules.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4 text-xs text-slate-400 flex items-start space-x-3">
              <HelpCircle className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                Need a signed Data Processing Addendum (DPA) or Enterprise Security Questionnaire for your organization? Contact our enterprise compliance division at <code className="text-cyan-400">compliance@nexvora.ai</code>.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
