import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Zap,
  Lightbulb,
  Building,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import { api } from '../../services/api';

const STARTER_PROMPTS = [
  'Help me formulate a 90-day growth strategy to double revenue in Nigeria.',
  'What are the mandatory CAC registration and tax requirements for a new SME?',
  'Draft a high-converting customer service response for a delayed shipment.',
  'How do I price my software or services for both NGN and USD clients?',
  'Give me a lean 1-page business plan outline for an e-commerce brand.',
  'Suggest 5 creative marketing strategies for low-budget startup launch.',
];

export const AIAssistantView: React.FC = () => {
  const { user } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('nexvora_assistant_chat');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'welcome-msg',
        sender: 'assistant',
        content: `**Welcome to NEXVORA AI Business Advisor.**\n\nI am your strategic partner for entrepreneurship, scaling revenue, customer service excellence, and operational mastery across Nigeria and international markets.\n\nHow can I help accelerate your business today? Select a prompt below or ask me anything.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pick up any initial query from the Main Dashboard quick launcher
  useEffect(() => {
    const pendingQuery = sessionStorage.getItem('nexvora_initial_ai_query');
    if (pendingQuery) {
      sessionStorage.removeItem('nexvora_initial_ai_query');
      handleSendPrompt(pendingQuery);
    }
  }, []);

  // Save conversation locally
  useEffect(() => {
    localStorage.setItem('nexvora_assistant_chat', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendPrompt = async (textToSend?: string) => {
    const promptText = (textToSend !== undefined ? textToSend : input).trim();
    if (!promptText || loading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      if (!user) throw new Error('User context missing');
      const response = await api.askAIAssistant(
        updatedMessages,
        user,
        user.id,
        user.plan
      );

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to AI engine.');
      const errReply: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: `⚠️ **Request Notice:** ${err.message || 'An error occurred while generating a response. If your server is running in a local environment, ensure GEMINI_API_KEY is configured.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errReply]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const fresh: ChatMessage[] = [
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        content: `Chat history cleared. I am ready to advise you on your next business milestone. What would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(fresh);
    localStorage.removeItem('nexvora_assistant_chat');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to render markdown bold, bullet points, headers simply
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Check heading ###
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="mt-3 mb-1 text-sm font-bold text-cyan-300">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="mt-4 mb-1 text-base font-bold text-white">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h2 key={idx} className="mt-4 mb-2 text-lg font-extrabold text-white">
            {line.replace('# ', '')}
          </h2>
        );
      }
      // Bullet point
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const clean = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-slate-200 my-0.5">
            <span dangerouslySetInnerHTML={{ __html: formatInline(clean) }} />
          </li>
        );
      }
      // Numbered item
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="ml-2 flex items-start space-x-2 my-1 text-xs sm:text-sm text-slate-200">
            <span className="font-bold text-cyan-400">{numMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} />
          </div>
        );
      }
      // Regular line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs sm:text-sm leading-relaxed text-slate-200 my-1" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    });
  };

  const formatInline = (str: string) => {
    // Replace **bold** with <strong>
    let formatted = str.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    // Replace `code` with styled span
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-cyan-300 px-1 py-0.5 rounded text-xs">$1</code>');
    return formatted;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#070b14]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#090f1f]/80 px-4 py-3 sm:px-6 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">NEXVORA AI Business Advisor</h2>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Strategy, Pricing, Marketing, Compliance & Scaling
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={clearChat}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title="Clear Chat History"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Starter Prompts chips if chat has <= 2 messages */}
        {messages.length <= 2 && (
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800/80 bg-[#0a1224]/70 p-4 backdrop-blur">
            <div className="flex items-center space-x-2 mb-3 text-xs font-bold text-cyan-400">
              <Lightbulb className="h-4 w-4" />
              <span>Recommended Strategic Prompts:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STARTER_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendPrompt(prompt)}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-left text-xs text-slate-300 transition hover:border-cyan-500/40 hover:bg-slate-800/80 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                }`}
              >
                {isUser ? 'ME' : <Sparkles className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative rounded-2xl p-4 text-sm shadow-sm ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-[#0d162d] border border-slate-800/80 text-slate-100 rounded-tl-none'
                }`}
              >
                <div className="prose prose-invert max-w-none text-xs sm:text-sm">
                  {renderFormattedText(msg.content)}
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/40">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="ml-2 flex items-center space-x-1 text-slate-400 hover:text-cyan-400 transition"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
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
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-3 max-w-xl mr-auto">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 animate-pulse">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-slate-800 bg-[#0d162d] p-4 text-xs text-cyan-400 flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>NEXVORA AI is formulating strategic business advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="border-t border-slate-800/80 bg-[#090f1f] p-4 sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="mx-auto max-w-3xl"
        >
          <div className="relative flex items-center">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              placeholder="Ask about marketing strategy, sales funnels, CAC registration, pricing, customer retention..."
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/90 py-3 pl-4 pr-24 text-xs sm:text-sm text-white placeholder-slate-400 shadow-inner outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Powered by Gemini 3.8 Flash • Shift + Enter for new line</span>
            <span className="text-cyan-400/80">Tailored to {user?.businessName || 'Your Business'}</span>
          </div>
        </form>
      </div>
    </div>
  );
};
