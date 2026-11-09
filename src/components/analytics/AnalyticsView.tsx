import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  RefreshCw,
  Target,
  Zap,
  Users,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { CurrencyCode } from '../../types';
import {
  calculateExpensesTotals,
  calculateNetProfit,
  calculateProfitMargin,
  calculateSalesTotals,
  formatCurrency,
} from '../../utils/calculations';
import {
  generateMonthlyTrend,
  generateExpensePieData,
  generateConversionFunnelData,
  CHART_COLORS,
} from '../../utils/analyticsCharts';
import { api } from '../../services/api';

// Custom Recharts Dark Tooltip for Financial Trends
const CustomFinancialTooltip = ({
  active,
  payload,
  label,
  currency,
}: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-700/80 bg-[#0c1427]/95 p-3.5 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-bold text-white mb-2 pb-1.5 border-b border-slate-800">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-300 capitalize">{entry.name}:</span>
              </div>
              <span className="font-mono font-bold text-white">
                {entry.name === 'margin' || entry.name.toLowerCase().includes('rate')
                  ? `${entry.value}%`
                  : formatCurrency(entry.value, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Recharts Tooltip for Conversion Rates
const CustomConversionTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-700/80 bg-[#0c1427]/95 p-3.5 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-bold text-white mb-2 pb-1.5 border-b border-slate-800">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-300 capitalize">{entry.name}:</span>
              </div>
              <span className="font-mono font-bold text-white">
                {entry.name === 'conversionRate' ? `${entry.value}%` : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const AnalyticsView: React.FC = () => {
  const { user, transactions, currency } = useApp();

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency);
  const [revenueChartMode, setRevenueChartMode] = useState<'area' | 'line'>('area');
  const [conversionPeriod, setConversionPeriod] = useState<'all' | 'recent'>('all');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Filter transactions for selected currency
  const currTransactions = transactions.filter((t) => t.currency === selectedCurrency);

  const totalSales = calculateSalesTotals(currTransactions);
  const totalExpenses = calculateExpensesTotals(currTransactions);
  const netProfit = calculateNetProfit(totalSales, totalExpenses);
  const margin = calculateProfitMargin(totalSales, totalExpenses);

  // Dynamic Chart Data
  const monthlyTrendData = generateMonthlyTrend(transactions, selectedCurrency);
  const expensePieData = generateExpensePieData(transactions, selectedCurrency);
  const conversionData = generateConversionFunnelData(
    conversionPeriod === 'recent' ? 1.25 : 1.0
  );

  const handleGenerateAiHealthCheck = async () => {
    if (!user) return;
    setLoadingAi(true);

    const prompt = `As NEXVORA AI Financial Strategist, analyze this enterprise's performance metrics:
- Business: ${user.businessName} (${user.businessType})
- Primary Currency: ${selectedCurrency}
- Gross Revenue: ${formatCurrency(totalSales, selectedCurrency)}
- Operating Costs: ${formatCurrency(totalExpenses, selectedCurrency)}
- Net Profit: ${formatCurrency(netProfit, selectedCurrency)} (${margin}% profit margin)
- Top Expense Categories: ${expensePieData.map((s) => `${s.name}: ${formatCurrency(s.value, selectedCurrency)} (${s.percentage}%)`).join(', ')}
- Current Lead Conversion Rate: ${conversionData[conversionData.length - 1].conversionRate}%

Deliver an executive financial diagnostic:
1. Enterprise Growth Score (e.g. 88/100) & Margin Efficiency
2. Cost Optimization & Cash Flow Safeguards
3. 3 Strategic Levers to Accelerate Qualified Customer Conversion by 40% in 90 days. Keep it direct and tactical.`;

    try {
      const res = await api.askAIAssistant(
        [{ id: '1', sender: 'user', content: prompt, timestamp: '' }],
        user,
        user.id,
        user.plan
      );
      setAiInsight(res.reply);
    } catch {
      setAiInsight(
        `Executive Review: Current net profit stands at ${formatCurrency(netProfit, selectedCurrency)} with a ${margin}% operating margin. Key Levers: Maintain 3+ months liquid reserve runway, automate accounts receivable follow-ups, and double down on your highest converting acquisition channels to maximize ROI.`
      );
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <TrendingUp className="h-4 w-4" />
            <span>Interactive Business Intelligence</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
            Analytics & Growth Trends
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time Recharts visualizations of revenue trajectory, cost distribution, and conversion pipelines.
          </p>
        </div>

        {/* Currency Switcher for Analytics */}
        <div className="flex items-center space-x-1 rounded-xl border border-slate-800 bg-[#090f1f] p-1 self-start sm:self-auto">
          {(['NGN', 'USD', 'GBP', 'EUR'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCurrency(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                selectedCurrency === c
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Gross Revenue ({selectedCurrency})</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {formatCurrency(totalSales, selectedCurrency)}
          </div>
          <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Recorded customer income
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Operating Expenses ({selectedCurrency})</span>
            <ArrowDownRight className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {formatCurrency(totalExpenses, selectedCurrency)}
          </div>
          <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
            Overheads & operational costs
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Estimated Net Profit</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <div
            className={`mt-2 text-2xl font-black ${
              netProfit >= 0 ? 'text-white' : 'text-rose-400'
            }`}
          >
            {formatCurrency(netProfit, selectedCurrency)}
          </div>
          <p className="mt-1 text-[11px] text-cyan-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            {margin}% net margin rating
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Active Lead Conversion</span>
            <Target className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {conversionData[conversionData.length - 1].conversionRate}%
          </div>
          <p className="mt-1 text-[11px] text-purple-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
            {conversionData[conversionData.length - 1].conversions} closed deals this month
          </p>
        </div>
      </div>

      {/* ROW 1: Revenue vs Expenses Growth Trends (Area/Line Recharts) */}
      <div className="rounded-2xl border border-slate-800 bg-[#090f1f] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">
                Revenue & Expense Growth Trajectory
              </h3>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                Dynamic Recharts
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly historical revenue, operational expense outflow, and resulting net profit in {selectedCurrency}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/80 p-0.5">
              <button
                type="button"
                onClick={() => setRevenueChartMode('area')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  revenueChartMode === 'area'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Area Fill
              </button>
              <button
                type="button"
                onClick={() => setRevenueChartMode('line')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  revenueChartMode === 'line'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Line Only
              </button>
            </div>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
            <span className="text-slate-300">Revenue (Inflow)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
            <span className="text-slate-300">Expenses (Outflow)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
            <span className="text-slate-300">Net Profit</span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="mt-6 h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {revenueChartMode === 'area' ? (
              <AreaChart
                data={monthlyTrendData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                    return val;
                  }}
                />
                <Tooltip
                  content={<CustomFinancialTooltip currency={selectedCurrency} />}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="revenue"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="expenses"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="netProfit"
                  name="netProfit"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#profitGradient)"
                />
              </AreaChart>
            ) : (
              <LineChart
                data={monthlyTrendData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                    return val;
                  }}
                />
                <Tooltip
                  content={<CustomFinancialTooltip currency={selectedCurrency} />}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="revenue"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#06b6d4' }}
                  activeDot={{ r: 6, fill: '#fff', stroke: '#06b6d4', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="expenses"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f43f5e' }}
                  activeDot={{ r: 6, fill: '#fff', stroke: '#f43f5e', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="netProfit"
                  name="netProfit"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 2: Expense Categorization (Donut Recharts) & Conversion Funnel (Line Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Expense Categorization Pie/Donut (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#090f1f] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieIcon className="h-4 w-4 text-cyan-400" />
                  <span>Expense Categorization</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Operational distribution in {selectedCurrency}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400">
                {formatCurrency(totalExpenses, selectedCurrency)}
              </span>
            </div>

            {/* Donut Recharts */}
            <div className="mt-4 h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#090f1f"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      formatCurrency(Number(value), selectedCurrency),
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: '#0c1427',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total
                </span>
                <span className="text-xs font-bold text-white">
                  {expensePieData.length} Sectors
                </span>
              </div>
            </div>

            {/* Category Slices Legend */}
            <div className="mt-4 space-y-2">
              {expensePieData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg transition hover:bg-slate-900/50"
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-300 font-medium truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="font-mono text-slate-200">
                      {formatCurrency(item.value, selectedCurrency)}
                    </span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Conversion Rates & Pipeline Performance (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#090f1f] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  <span>Lead & Customer Conversion Rates</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pipeline efficiency from discovery leads to converted deals
                </p>
              </div>

              <div className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 p-0.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setConversionPeriod('all')}
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    conversionPeriod === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setConversionPeriod('recent')}
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    conversionPeriod === 'recent'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Accelerated (+25%)
                </button>
              </div>
            </div>

            {/* Quick Conversion Rate Highlights */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                <div className="text-[11px] text-slate-400">Total Leads</div>
                <div className="text-lg font-black text-white mt-0.5">
                  {conversionData.reduce((acc, c) => acc + c.leads, 0).toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                <div className="text-[11px] text-slate-400">Proposals Sent</div>
                <div className="text-lg font-black text-cyan-400 mt-0.5">
                  {conversionData.reduce((acc, c) => acc + c.proposals, 0).toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                <div className="text-[11px] text-slate-400">Avg Win Rate</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5">
                  {(
                    conversionData.reduce((acc, c) => acc + c.conversionRate, 0) /
                    conversionData.length
                  ).toFixed(1)}
                  %
                </div>
              </div>
            </div>

            {/* Dual-Axis Line Chart: Leads Volume vs Conversion Rate % */}
            <div className="mt-5 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={conversionData}
                  margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis
                    dataKey="period"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  {/* Left Axis: Volume */}
                  <YAxis
                    yAxisId="left"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  {/* Right Axis: Percentage % */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#a855f7"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#a855f7' }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomConversionTooltip />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="leads"
                    name="leads"
                    stroke="#64748b"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#64748b' }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="conversions"
                    name="conversions"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#06b6d4' }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="conversionRate"
                    name="conversionRate"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#a855f7' }}
                    activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
              Purple curve: Conversion Success Rate (%)
            </span>
            <span className="text-cyan-400 font-medium">
              Peak: {Math.max(...conversionData.map((c) => c.conversionRate))}%
            </span>
          </div>
        </div>
      </div>

      {/* AI Business Health Diagnostic */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#09152e] via-[#0a1124] to-[#070c18] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                NEXVORA AI Financial Health Diagnostic
              </h3>
              <p className="text-xs text-slate-400">
                Automated executive analysis grounded in your actual cash flow and profit margins.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateAiHealthCheck}
            disabled={loadingAi}
            className="flex items-center space-x-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
          >
            {loadingAi ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Auditing Financials...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Run AI Health Diagnostic</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4">
          {aiInsight ? (
            <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-slate-200 font-sans">
              {aiInsight}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              Click &quot;Run AI Health Diagnostic&quot; to synthesize an executive audit of your business revenue, costs, and profit drivers.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
