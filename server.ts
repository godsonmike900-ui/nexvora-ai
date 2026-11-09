import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// In-memory + persistent fallback database
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'nexvora_db.json');

interface LocalDB {
  users: Record<string, any>;
  invoices: Record<string, any[]>;
  transactions: Record<string, any[]>;
  savedGenerations: Record<string, any[]>;
}

function loadLocalDB(): LocalDB {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local DB, initializing empty store:', err);
  }
  return {
    users: {},
    invoices: {},
    transactions: {},
    savedGenerations: {},
  };
}

function saveLocalDB(data: LocalDB) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to local DB:', err);
  }
}

let db = loadLocalDB();

// Simple in-memory rate limiting tracker (calls per day per user)
const usageTracker: Record<string, { count: number; date: string }> = {};

function checkRateLimit(userId: string, plan: string = 'FREE'): { allowed: boolean; remaining: number; max: number } {
  const today = new Date().toISOString().split('T')[0];
  if (!usageTracker[userId] || usageTracker[userId].date !== today) {
    usageTracker[userId] = { count: 0, date: today };
  }

  const limits: Record<string, number> = {
    FREE: 25,
    PRO: 200,
    BUSINESS: 1000,
  };

  const max = limits[plan] || 25;
  if (usageTracker[userId].count >= max) {
    return { allowed: false, remaining: 0, max };
  }

  usageTracker[userId].count += 1;
  return { allowed: true, remaining: max - usageTracker[userId].count, max };
}

// Gemini AI Client helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// ---------------- API ROUTES ----------------

// System Status Endpoint
app.get('/api/system/status', (req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  
  res.json({
    status: 'online',
    platform: 'NEXVORA AI',
    version: '1.0.0',
    aiProvider: hasGeminiKey ? 'Gemini 3.8 Flash (Active)' : 'Gemini 3.8 Flash (Key Required in .env)',
    aiAvailable: hasGeminiKey,
    database: hasSupabase ? 'Supabase Postgres (Connected)' : 'Local Persistent Store (Zero-Config Active)',
    supabaseConfigured: hasSupabase,
  });
});

// AI Business Assistant
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  try {
    const { messages, businessContext, userId = 'guest', userPlan = 'FREE' } = req.body;

    const rateCheck = checkRateLimit(userId, userPlan);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `Daily AI usage limit reached for your ${userPlan} plan (${rateCheck.max} requests/day). Upgrade to PRO or BUSINESS for higher limits.`,
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini AI API key not configured on the server. Please add GEMINI_API_KEY to your environment variables or Secrets panel.',
      });
    }

    const systemInstruction = `You are NEXVORA AI — an elite, knowledgeable international business and growth advisor. 
You empower entrepreneurs, freelancers, startups, and SMEs in Nigeria and globally to scale their revenues, optimize operations, improve cash flow, and master modern business strategies.
You are thoroughly versed in:
- Nigerian business ecosystem (CAC registration, FIRS taxes, 7.5% VAT, Lagos/Abuja markets, FX management, banking, payment rails like Paystack/Flutterwave/Moniepoint, export, e-commerce, logistics).
- Global startup methodologies (Lean Startup, Product-Market Fit, B2B SaaS, Unit Economics, CAC/LTV, international invoicing in USD/GBP/EUR).
- Marketing, customer retention, growth loops, and strategic pricing.

Current Business Context:
- Business Name: ${businessContext?.businessName || 'Entrepreneur Business'}
- Industry/Type: ${businessContext?.businessType || 'General Commerce / Services'}
- Primary Currency: ${businessContext?.currency || 'NGN'}
- Country: ${businessContext?.country || 'Nigeria / Global'}

Guidelines:
1. Provide actionable, concise, well-structured business advice with bullet points, numbered steps, or clear tables where appropriate.
2. Maintain a professional, visionary, yet pragmatic tone.
3. When discussing finances or prices, reference the user's primary currency (${businessContext?.currency || 'NGN'}).
4. Do not output generic fluff; deliver specific tactical execution steps.`;

    // Format message history
    const contents = (messages || []).map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // If contents is empty, provide default prompt
    if (contents.length === 0) {
      return res.status(400).json({ error: 'No messages provided.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const reply = response.text || 'I apologize, but I could not generate a response. Please try again.';

    res.json({
      reply,
      usage: {
        remaining: rateCheck.remaining,
        max: rateCheck.max,
      },
    });
  } catch (err: any) {
    console.error('AI Assistant Error:', err);
    res.status(500).json({
      error: err.message || 'An error occurred while communicating with NEXVORA AI engine.',
    });
  }
});

// AI Marketing Studio Endpoint
app.post('/api/ai/marketing', async (req: Request, res: Response) => {
  try {
    const { request, userId = 'guest', userPlan = 'FREE' } = req.body;

    const rateCheck = checkRateLimit(userId, userPlan);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `Daily AI usage limit reached for ${userPlan} plan. Upgrade to unlock more marketing generations.`,
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini AI API key not configured on server. Please add GEMINI_API_KEY to your environment.',
      });
    }

    const prompt = `Generate high-converting, professional marketing content for the following request:
- Tool / Format: ${request.toolType}
- Business Name: ${request.businessName || 'NEXVORA Business'}
- Product / Service / Topic: ${request.productOrTopic}
- Target Audience: ${request.targetAudience || 'Target customers and clients'}
- Platform: ${request.platform || 'General'}
- Tone of Voice: ${request.tone || 'Professional & Engaging'}
- Content Length: ${request.length || 'medium'}
- Special Instructions: ${request.specialInstructions || 'None'}

Formatting rules:
- Provide 2-3 distinct, ready-to-use variations or sections (e.g. Option A: High Energy, Option B: Value-First, Option C: Story-Driven).
- Include appropriate emojis, hooks, hashtags, and strong Calls-to-Action (CTA).
- If the tool is 'slogan', provide 6-8 memorable, brandable taglines.
- If the tool is 'tiktok_ideas', include visual hook, script line, and sound suggestion.
- If the tool is 'hashtags', organize into High Volume, Niche, and Local/Industry tags.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an award-winning Creative Marketing Director and Copywriter at NEXVORA AI. You craft persuasive, culturally resonant, high-ROI marketing copy for businesses in Nigeria and internationally.',
        temperature: 0.8,
      },
    });

    res.json({
      content: response.text || 'Marketing content generated.',
      usage: { remaining: rateCheck.remaining, max: rateCheck.max },
    });
  } catch (err: any) {
    console.error('Marketing Studio Error:', err);
    res.status(500).json({
      error: err.message || 'Marketing generation failed.',
    });
  }
});

// AI Business Writer Endpoint
app.post('/api/ai/writer', async (req: Request, res: Response) => {
  try {
    const { request, userId = 'guest', userPlan = 'FREE' } = req.body;

    const rateCheck = checkRateLimit(userId, userPlan);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `Daily AI usage limit reached for ${userPlan} plan. Upgrade to unlock more business writing documents.`,
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini AI API key not configured on server.',
      });
    }

    const prompt = `Write a polished, executive-grade business document:
- Document Type: ${request.docType}
- Title / Subject: ${request.title}
- Sender / Company Name: ${request.senderName}
- Recipient / Target Organization: ${request.recipientName}
- Core Points & Requirements: ${request.keyPoints}
- Tone: ${request.tone}
- Additional Details: ${request.additionalDetails || 'None'}

Formatting requirements:
- Use standard international business formatting (Headers, Salutation, Executive Summary, Scope of Work / Body, Milestones/Pricing if applicable, Sign-off).
- Ensure formal clarity, high professional elegance, and persuasive authority.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite corporate business strategist and executive communications writer at NEXVORA AI. You write impeccable business proposals, emails, letters, company profiles, and reports.',
        temperature: 0.6,
      },
    });

    res.json({
      content: response.text || 'Document generated.',
      usage: { remaining: rateCheck.remaining, max: rateCheck.max },
    });
  } catch (err: any) {
    console.error('Business Writer Error:', err);
    res.status(500).json({
      error: err.message || 'Business writing generation failed.',
    });
  }
});

// ---------------- DATA STORAGE (CRUD) ----------------

// Invoices CRUD
app.get('/api/invoices', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'default_user';
  res.json(db.invoices[userId] || []);
});

app.post('/api/invoices', (req: Request, res: Response) => {
  const invoice = req.body;
  const userId = invoice.userId || 'default_user';
  if (!db.invoices[userId]) db.invoices[userId] = [];

  const existingIdx = db.invoices[userId].findIndex((inv) => inv.id === invoice.id);
  if (existingIdx >= 0) {
    db.invoices[userId][existingIdx] = invoice;
  } else {
    db.invoices[userId].unshift(invoice);
  }
  saveLocalDB(db);
  res.json(invoice);
});

app.delete('/api/invoices/:id', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'default_user';
  const invoiceId = req.params.id;
  if (db.invoices[userId]) {
    db.invoices[userId] = db.invoices[userId].filter((inv) => inv.id !== invoiceId);
    saveLocalDB(db);
  }
  res.json({ success: true });
});

// Transactions (Sales & Expenses) CRUD
app.get('/api/transactions', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'default_user';
  res.json(db.transactions[userId] || []);
});

app.post('/api/transactions', (req: Request, res: Response) => {
  const transaction = req.body;
  const userId = transaction.userId || 'default_user';
  if (!db.transactions[userId]) db.transactions[userId] = [];

  const existingIdx = db.transactions[userId].findIndex((t) => t.id === transaction.id);
  if (existingIdx >= 0) {
    db.transactions[userId][existingIdx] = transaction;
  } else {
    db.transactions[userId].unshift(transaction);
  }
  saveLocalDB(db);
  res.json(transaction);
});

app.delete('/api/transactions/:id', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'default_user';
  const txId = req.params.id;
  if (db.transactions[userId]) {
    db.transactions[userId] = db.transactions[userId].filter((t) => t.id !== txId);
    saveLocalDB(db);
  }
  res.json({ success: true });
});

// User Profile CRUD
app.get('/api/profile', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'default_user';
  res.json(db.users[userId] || null);
});

app.post('/api/profile', (req: Request, res: Response) => {
  const profile = req.body;
  const userId = profile.id || 'default_user';
  db.users[userId] = profile;
  saveLocalDB(db);
  res.json(profile);
});

// Saved AI generations
app.get('/api/saved-generations', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'default_user';
  res.json(db.savedGenerations[userId] || []);
});

app.post('/api/saved-generations', (req: Request, res: Response) => {
  const item = req.body;
  const userId = (req.query.userId as string) || 'default_user';
  if (!db.savedGenerations[userId]) db.savedGenerations[userId] = [];
  db.savedGenerations[userId].unshift(item);
  saveLocalDB(db);
  res.json(item);
});

// Direct Source Code Download
app.get('/api/download/source-zip', (req: Request, res: Response) => {
  const zipPath = path.resolve(process.cwd(), 'public/nexvora-ai-source.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="nexvora-ai-source.zip"');
    res.sendFile(zipPath);
  } else {
    res.status(404).json({ error: 'Zip archive not found' });
  }
});

// ---------------- VITE / FRONTEND SERVING ----------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NEXVORA AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
