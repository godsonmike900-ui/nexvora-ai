import React, { useState } from 'react';
import {
  Activity,
  FileText,
  DollarSign,
  Sparkles,
  Settings,
  ArrowRight,
  Filter,
  Trash2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivityLogItem } from '../../types';

export const ActivityLog: React.FC = () => {
  const { activities, setActiveView, clearActivities } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredActivities = activities.filter((act) => {
    if (selectedCategory === 'all') return true;
    return act.category === selectedCategory;
  });

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const getCategoryIcon = (category: ActivityLogItem['category']) => {
    switch (category) {
      case 'invoice':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'finance':
        return <DollarSign className="h-4 w-4 text-emerald-400" />;
      case 'ai':
        return <Sparkles className="h-4 w-4 text-cyan-400" />;
      case 'settings':
        return <Settings className="h-4 w-4 text-amber-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getCategoryBadge = (category: ActivityLogItem['category']) => {
    switch (category) {
      case 'invoice':
        return (
          <span className="inline-flex items-center rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-blue-300">
            Invoice
          </span>
        );
      case 'finance':
        return (
          <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-300">
            Cash Flow
          </span>
        );
      case 'ai':
        return (
          <span className="inline-flex items-center rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-cyan-300">
            AI Studio
          </span>
        );
      case 'settings':
        return (
          <span className="inline-flex items-center rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-300">
            Settings
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-300">
            System
          </span>
        );
    }
  };

  const categories = [
    { id: 'all', label: 'All Activities' },
    { id: 'invoice', label: 'Invoices' },
    { id: 'finance', label: 'Cash Flow' },
    { id: 'ai', label: 'AI Studio' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090f1e] p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">Recent Activity</h3>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                {activities.length}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time audit log of business creations, financial entries, and AI generations
            </p>
          </div>
        </div>

        {/* Clear Log Button */}
        {activities.length > 0 && (
          <button
            type="button"
            onClick={clearActivities}
            className="self-start sm:self-auto inline-flex items-center space-x-1.5 rounded-lg border border-slate-800 px-2.5 py-1 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition"
            title="Clear activity history"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 pb-2">
        <Filter className="h-3.5 w-3.5 text-slate-500 mr-1 hidden sm:inline" />
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count =
            cat.id === 'all'
              ? activities.length
              : activities.filter((a) => a.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center space-x-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Activity List */}
      <div className="mt-3 divide-y divide-slate-800/60">
        {filteredActivities.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <div className="text-xs font-semibold text-slate-400">No activities recorded</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Actions like generating invoices, logging expenses, or creating AI documents will appear here.
            </p>
          </div>
        ) : (
          filteredActivities.slice(0, 8).map((act) => (
            <div
              key={act.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 px-2 rounded-lg transition hover:bg-slate-900/40"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
                  {getCategoryIcon(act.category)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                      {act.action}
                    </span>
                    {getCategoryBadge(act.category)}
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-300 truncate max-w-xl">
                    {act.details}
                  </div>
                </div>
              </div>

              {/* Direct View Action Link */}
              {act.linkView && (
                <button
                  type="button"
                  onClick={() => setActiveView(act.linkView!)}
                  className="self-end sm:self-auto inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition px-2 py-1 rounded hover:bg-cyan-500/10"
                >
                  <span className="capitalize">Open {act.linkView}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
