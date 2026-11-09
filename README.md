# NEXVORA AI

> **Your Business. Your Intelligence. Your Growth.**

NEXVORA AI is a modern, AI-powered business management platform tailored for entrepreneurs, freelancers, startups, and small-to-medium enterprises in Nigeria and internationally.

---

## 🌟 Key Features

1. **Enterprise Dashboard**:
   - Executive financial snapshot (Revenue, Operating Costs, Estimated Net Profit, Margin %).
   - Multi-currency switcher with live support for **NGN (₦)**, **USD ($)**, **GBP (£)**, and **EUR (€)**.
   - Quick launch shortcuts for all platform tools.
   - Recent invoices and real-time cash flow inflows/outflows.

2. **AI Business Assistant**:
   - Conversational business advisor powered by **Gemini 3.8 Flash**.
   - Strategic prompt accelerators for Nigerian CAC compliance, 7.5% VAT, international invoicing, pricing models, and 90-day growth plans.
   - Formatted markdown output with 1-click copy and history clearing.

3. **AI Marketing Studio**:
   - High-converting generators for Social Media Captions, Facebook/Instagram Ad Copy, TikTok video scripts, Product Descriptions, WhatsApp/SMS Broadcasts, Multi-Channel Campaign plans, Hashtag packs, and Brand Slogans.
   - Fine-grained controls: Tone (including Nigerian Street-Smart / Afrocentric nuance, Luxury, Bold, Professional), Target Audience, Platform, and Length.

4. **AI Business Writer**:
   - Commercial proposals with scope, pricing, and SLA terms.
   - Executive pitch and follow-up emails.
   - Customer service escalation responses.
   - Formal business letters, Company profiles with CAC registration info, and Management reports.
   - Export as Markdown (`.md`) and copy to clipboard.

5. **Professional Invoice Generator**:
   - Full business entity details (CAC registration, phone, email, registered address).
   - Dynamic line items with automated subtotal calculation.
   - Configurable VAT / Tax rates (e.g. 7.5% Nigerian VAT) and client discounts.
   - Bank settlement information (Zenith Bank, GTBank, SWIFT/IBAN wire codes).
   - Client-side 1-click PDF download via `jspdf` and status lifecycle (Draft, Pending, Paid, Overdue).

6. **Sales and Expense Manager**:
   - Categorized revenue and expense logging.
   - Payment method tracking (Bank Transfer, Card, Cash, USSD / Mobile Money).
   - Time-period filtering: All Time, Daily, Weekly, and Monthly.

7. **Business Analytics & AI Diagnostic**:
   - Interactive monthly sales vs expenses trajectory charts.
   - Operational expense distribution breakdown.
   - AI Business Health Diagnostic generating tailored financial audits and margin-expansion levers.

8. **Enterprise Subscriptions (Free, Pro, Business)**:
   - Built-in tier switcher with usage limits and feature matrix.

---

## 🚀 Beginner Setup Guide (Zero-Budget Free Tier)

NEXVORA AI is built to run on eligible free developer tiers with zero paid templates or upfront payments required.

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 2. Environment Variables Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your variables:
```env
# Gemini AI API Key (Get a free key from https://aistudio.google.com)
GEMINI_API_KEY="YOUR_FREE_GEMINI_API_KEY"

# Optional: Supabase configuration (Free tier at https://supabase.com)
# If omitted, NEXVORA AI automatically runs on its built-in local persistent store.
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

PORT=3000
```

### 3. Installation
```bash
npm install
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Instructions

### 1. Automated Fast Unit Tests (node:test)
NEXVORA AI includes pure calculation and currency unit tests:
```bash
npx --yes tsx --test src/utils/calculations.test.ts
```
*Expected result:* 6 tests pass verifying invoice calculations, VAT, discounts, multi-currency formatting, net profit, and period filtering.

### 2. Building for Production
```bash
npm run build
npm run lint
```

---

## 🗄️ Database & Supabase Deployment

NEXVORA AI provides a complete production PostgreSQL schema in `supabase-schema.sql` featuring:
- `profiles` table with CAC number and banking information.
- `invoices` table with line items, tax, discount, and status.
- `transactions` table with sales and expense categorization.
- `ai_generations` table for saved copy and documents.
- **Row Level Security (RLS)** policies ensuring users can only read and write their own data.
- Optimized B-tree indexes for fast querying.

To deploy on Supabase:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab in the Supabase Dashboard.
3. Paste the contents of `supabase-schema.sql` and click **Run**.
4. Copy your Project URL and Anon Key into your `.env` file.

---

## 📱 Android & Mobile Compatibility
NEXVORA AI is designed mobile-first:
- Fully responsive across 390px (mobile) to 1440px+ (desktop).
- PWA-ready meta headers and viewport tags for home screen installation on Android and iOS.
- Clean API contract (`/api/*`) compatible with React Native / Expo clients.
