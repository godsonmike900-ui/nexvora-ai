import React, { useState } from 'react';
import {
  Megaphone,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Bookmark,
  Share2,
  Sliders,
  Send,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MarketingContentRequest, SavedGeneration } from '../../types';
import { api } from '../../services/api';

const TOOL_OPTIONS = [
  { id: 'caption', label: 'Social Media Caption', icon: '📱' },
  { id: 'facebook_ad', label: 'Facebook Ad Copy', icon: '🎯' },
  { id: 'instagram_ad', label: 'Instagram Ad Copy', icon: '📸' },
  { id: 'tiktok_ideas', label: 'TikTok Video Ideas & Scripts', icon: '🎵' },
  { id: 'product_desc', label: 'Product Description', icon: '🛍️' },
  { id: 'promo_message', label: 'WhatsApp & SMS Promo', icon: '💬' },
  { id: 'campaign', label: 'Multi-Channel Campaign Plan', icon: '🚀' },
  { id: 'hashtags', label: 'Strategic Hashtags Pack', icon: '#️⃣' },
  { id: 'slogan', label: 'Brand Slogans & Taglines', icon: '💡' },
];

const PLATFORMS = [
  'Multi-Platform',
  'Instagram',
  'Facebook',
  'TikTok',
  'LinkedIn',
  'Twitter / X',
  'WhatsApp / SMS',
];

const TONES = [
  'Professional & Authority',
  'Bold & High-Converting',
  'Persuasive & Value-Driven',
  'Luxury & Elite',
  'Casual & Friendly',
  'Afrocentric & Nigerian Street-Smart (Pidgin Nuance)',
  'Urgent & FOMO',
];

export const MarketingStudioView: React.FC = () => {
  const { user, saveGenerationItem } = useApp();

  const [toolType, setToolType] = useState<MarketingContentRequest['toolType']>('caption');
  const [productOrTopic, setProductOrTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Bold & High-Converting');
  const [length, setLength] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productOrTopic.trim()) {
      setError('Please provide a product, service, or topic to generate content for.');
      return;
    }

    setError(null);
    setLoading(true);
    setSaved(false);

    const request: MarketingContentRequest = {
      toolType,
      businessName: user?.businessName || 'NEXVORA Client',
      productOrTopic,
      targetAudience: targetAudience || 'Entrepreneurs and customers in Nigeria and globally',
      platform,
      tone,
      length,
      specialInstructions,
    };

    try {
      const res = await api.generateMarketing(
        request,
        user?.id || 'demo_user',
        user?.plan || 'PRO'
      );
      setGeneratedResult(res.content);
    } catch (err: any) {
      setError(err.message || 'Failed to generate marketing copy.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToVault = async () => {
    if (!generatedResult) return;
    const item: SavedGeneration = {
      id: `gen-${Date.now()}`,
      type: 'marketing',
      category: toolType,
      title: `${productOrTopic.slice(0, 30)} (${toolType})`,
      content: generatedResult,
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
          <Megaphone className="h-4 w-4" />
          <span>AI Growth Engine</span>
        </div>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
          NEXVORA AI Marketing Studio
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Craft high-converting ad copy, social captions, TikTok video scripts, slogans, and WhatsApp promo broadcasts.
        </p>
      </div>

      {/* Main Grid: Generator Form + Live Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tool Category Selector */}
          <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              1. Select Marketing Asset Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TOOL_OPTIONS.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setToolType(tool.id as any)}
                  className={`flex items-center space-x-2 rounded-xl p-2.5 text-left text-xs font-semibold transition ${
                    toolType === tool.id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-900/60 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-base">{tool.icon}</span>
                  <span className="truncate">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Form */}
          <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              2. Target Audience & Product Details
            </label>

            {/* Product / Offer / Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                What are you promoting or launching? *
              </label>
              <textarea
                rows={3}
                value={productOrTopic}
                onChange={(e) => setProductOrTopic(e.target.value)}
                placeholder="e.g. End of year 25% discount on custom web design packages for Nigerian SMEs with free .ng domain and payment integration."
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Audience & Location
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Boutique owners in Lagos, Nigerian tech founders, young professionals aged 24-40"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>

            {/* Platform & Tone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tone of Voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content Length */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Content Length
              </label>
              <div className="flex space-x-2">
                {(['short', 'medium', 'detailed'] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setLength(len)}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold uppercase tracking-wider transition ${
                      length === len
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Specific Call to Action (CTA) or Offer details
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Include WhatsApp link prompt, price: ₦150,000, emphasize 48-hour delivery"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-3.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Synthesizing High-Impact Marketing Copy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-slate-950" />
                  <span>Generate Content with NEXVORA AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output: 5 cols */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex-1 rounded-2xl border border-slate-800 bg-[#090f1f] p-5 flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Generated Marketing Asset
                </span>
              </div>

              {generatedResult && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                    title="Copy to clipboard"
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
                  <div className="relative">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                    <Sparkles className="absolute inset-0 m-auto h-4 w-4 text-cyan-400 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-400">Applying marketing psychology & regional framing...</p>
                </div>
              ) : generatedResult ? (
                <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-slate-200 font-sans">
                  {generatedResult}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center space-y-3 py-20 text-center text-slate-500">
                  <Megaphone className="h-8 w-8 text-slate-700" />
                  <p className="text-xs max-w-xs">
                    Configure your product details on the left and click Generate to produce high-performing marketing copy.
                  </p>
                </div>
              )}
            </div>

            {generatedResult && (
              <div className="mt-4 border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Platform: {platform} • Tone: {tone}</span>
                <button
                  onClick={handleGenerate}
                  className="flex items-center space-x-1 text-cyan-400 hover:underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Regenerate</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
