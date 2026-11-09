import React from 'react';
import {
  X,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PricingModal: React.FC = () => {
  const { user, isPricingModalOpen, setIsPricingModalOpen, setPlan, currency } = useApp();

  if (!isPricingModalOpen) return null;

  const isNgn = currency === 'NGN';

  const plans = [
    {
      id: 'FREE',
      name: 'Free Starter',
      tagline: 'Essential AI for solo entrepreneurs and early setups.',
      price: isNgn ? '₦0' : '$0',
      period: 'forever',
      features: [
        '25 AI Assistant & Marketing actions/day',
        'Basic Social Media Captions & Slogans',
        'Standard PDF Invoicing Generator',
        'Sales & Expense Tracking (All currencies)',
        'Local encrypted business storage',
      ],
      cta: 'Current Plan',
      highlight: false,
    },
    {
      id: 'PRO',
      name: 'Professional',
      tagline: 'High-velocity intelligence for active startups & SMEs.',
      price: isNgn ? '₦15,000' : '$19',
      period: 'per month',
      features: [
        '200 AI actions/day (Gemini 3.8 Flash)',
        'Full AI Marketing Studio (FB/IG Ads, TikTok)',
        'Executive Business Proposals & Reports',
        'Custom Invoice branding & CAC registration stamp',
        'Comprehensive Sales & Expense Analytics',
        'Priority AI response speeds',
      ],
      cta: 'Activate PRO Plan',
      highlight: true,
    },
    {
      id: 'BUSINESS',
      name: 'Enterprise Growth',
      tagline: 'Maximum power and capacity for scaling commercial companies.',
      price: isNgn ? '₦45,000' : '$49',
      period: 'per month',
      features: [
        '1,000 AI actions/day with high token limits',
        'AI Financial Health Diagnostic & Strategy Audits',
        'Multi-currency cash flow forecasting',
        'Direct Supabase cloud database sync',
        'Dedicated VIP support & compliance advisor',
        'Team access and audit trail readiness',
      ],
      cta: 'Activate Business Tier',
      highlight: false,
    },
  ];

  const handleSelectPlan = async (planId: 'FREE' | 'PRO' | 'BUSINESS') => {
    await setPlan(planId);
    setIsPricingModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-800 bg-[#090f1f] p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setIsPricingModalOpen(false)}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-400">
            <Zap className="h-3.5 w-3.5" />
            <span>NEXVORA AI Subscription Tiers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Scale Your Business With High-Performance Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Choose the tier tailored to your operational velocity. (Pre-payment test stage: Switch tiers anytime for testing).
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = (user?.plan || 'FREE') === p.id;
            return (
              <div
                key={p.id}
                className={`relative flex flex-col justify-between rounded-2xl p-6 transition ${
                  p.highlight
                    ? 'border-2 border-cyan-400 bg-gradient-to-b from-[#0e1d38] to-[#0a1224] shadow-xl shadow-cyan-500/10'
                    : 'border border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <p className="mt-1 text-xs text-slate-400 min-h-[32px]">{p.tagline}</p>

                  <div className="mt-4 flex items-baseline space-x-1">
                    <span className="text-3xl font-black text-white">{p.price}</span>
                    <span className="text-xs text-slate-400">/{p.period}</span>
                  </div>

                  <div className="my-5 border-t border-slate-800" />

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(p.id as any)}
                    className={`flex w-full items-center justify-center space-x-2 rounded-xl py-3 text-xs font-bold transition ${
                      isCurrent
                        ? 'border border-slate-700 bg-slate-800 text-slate-300 cursor-default'
                        : p.highlight
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 text-slate-950 hover:from-blue-500 hover:to-cyan-300 shadow-lg shadow-cyan-500/20'
                        : 'border border-cyan-500/40 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-900/30'
                    }`}
                  >
                    <span>{isCurrent ? 'Current Tier Active' : p.cta}</span>
                    {!isCurrent && <ArrowRight className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-center text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Real card payments deactivated for sandbox validation. Select any tier to immediately test limits.</span>
        </div>
      </div>
    </div>
  );
};
