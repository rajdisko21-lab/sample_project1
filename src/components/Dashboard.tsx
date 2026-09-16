import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowUpDown,
  Star,
  ThumbsUp,
  MessageSquare,
  PlusCircle,
  EyeOff,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart3,
  HelpCircle,
  Bug,
  Layout,
  Gauge,
  DollarSign,
  Lightbulb,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  Zap,
  Activity,
  X,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  FeedbackItem,
  FeedbackCategory,
  FeedbackStatus,
  FeedbackPriority,
  User,
  AppPage,
} from '../types';
import { subscribeToFeedbackUpdates, updateFeedbackStatus } from '../lib/storage';
import { FeedbackForm } from './FeedbackForm';

interface DashboardProps {
  feedbacks: FeedbackItem[];
  currentUser: User | null;
  onSelectFeedback: (feedback: FeedbackItem) => void;
  onToggleUpvote: (id: string) => void;
  onNavigate: (page: AppPage) => void;
  onRefreshData?: () => void;
}

const CATEGORY_MAP: Record<FeedbackCategory, { label: string; icon: React.ReactNode; color: string }> = {
  feature: { label: 'Feature', icon: <Lightbulb className="w-3.5 h-3.5 text-amber-500" />, color: '#f59e0b' },
  bug: { label: 'Bug', icon: <Bug className="w-3.5 h-3.5 text-rose-500" />, color: '#f43f5e' },
  ui_ux: { label: 'UI/UX', icon: <Layout className="w-3.5 h-3.5 text-indigo-500" />, color: '#6366f1' },
  performance: { label: 'Performance', icon: <Gauge className="w-3.5 h-3.5 text-blue-500" />, color: '#3b82f6' },
  pricing: { label: 'Pricing', icon: <DollarSign className="w-3.5 h-3.5 text-emerald-500" />, color: '#10b981' },
  general: { label: 'General', icon: <HelpCircle className="w-3.5 h-3.5 text-slate-500" />, color: '#64748b' },
};

const STATUS_CONFIG: Record<
  FeedbackStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  new: { label: 'New', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  in_review: { label: 'In Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  resolved: { label: 'Resolved', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  closed: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

const PRIORITY_BADGES: Record<FeedbackPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Medium', color: 'bg-blue-50 text-blue-700' },
  high: { label: 'High', color: 'bg-amber-50 text-amber-700' },
  urgent: { label: 'Urgent', color: 'bg-rose-50 text-rose-700 font-bold' },
};

export const Dashboard: React.FC<DashboardProps> = ({
  feedbacks,
  currentUser,
  onSelectFeedback,
  onToggleUpvote,
  onNavigate,
  onRefreshData,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating-high' | 'rating-low' | 'upvotes'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showQuickDrawer, setShowQuickDrawer] = useState(false);
  const [lastRealtimeUpdate, setLastRealtimeUpdate] = useState<Date>(new Date());

  // Real-time synchronization subscription
  useEffect(() => {
    const unsubscribe = subscribeToFeedbackUpdates(() => {
      setLastRealtimeUpdate(new Date());
      if (onRefreshData) {
        onRefreshData();
      }
    });
    return () => unsubscribe();
  }, [onRefreshData]);

  // Aggregated Statistical Calculations
  const stats = useMemo(() => {
    const total = feedbacks.length;
    if (total === 0) {
      return {
        total: 0,
        avgRating: '0.0',
        resolvedRate: 0,
        pendingCount: 0,
        urgentCount: 0,
        positivePct: 0,
        neutralPct: 0,
        negativePct: 0,
        ratingsCount: [0, 0, 0, 0, 0],
        categoryBreakdown: {} as Record<string, number>,
      };
    }

    const ratingSum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    const avgRating = (ratingSum / total).toFixed(1);

    const resolvedOrClosed = feedbacks.filter(
      (f) => f.status === 'resolved' || f.status === 'closed'
    ).length;
    const resolvedRate = Math.round((resolvedOrClosed / total) * 100);

    const pendingCount = feedbacks.filter(
      (f) => f.status === 'new' || f.status === 'in_review' || f.status === 'in_progress'
    ).length;

    const urgentCount = feedbacks.filter(
      (f) => (f.priority === 'urgent' || f.priority === 'high') && f.status !== 'resolved' && f.status !== 'closed'
    ).length;

    const positiveCount = feedbacks.filter((f) => f.rating >= 4).length;
    const neutralCount = feedbacks.filter((f) => f.rating === 3).length;
    const negativeCount = feedbacks.filter((f) => f.rating <= 2).length;

    const positivePct = Math.round((positiveCount / total) * 100);
    const neutralPct = Math.round((neutralCount / total) * 100);
    const negativePct = Math.round((negativeCount / total) * 100);

    const ratingsCount = [5, 4, 3, 2, 1].map(
      (star) => feedbacks.filter((f) => f.rating === star).length
    );

    const categoryBreakdown: Record<string, number> = {};
    feedbacks.forEach((f) => {
      categoryBreakdown[f.category] = (categoryBreakdown[f.category] || 0) + 1;
    });

    return {
      total,
      avgRating,
      resolvedRate,
      pendingCount,
      urgentCount,
      positivePct,
      neutralPct,
      negativePct,
      ratingsCount,
      categoryBreakdown,
    };
  }, [feedbacks]);

  // Chart Data: Timeline Trend
  const timelineChartData = useMemo(() => {
    if (feedbacks.length === 0) return [];

    // Group items chronologically by date
    const dateMap = new Map<string, { count: number; ratingSum: number }>();

    // Sort chronologically ascending
    const sortedChronological = [...feedbacks].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedChronological.forEach((item) => {
      const d = new Date(item.createdAt);
      const dateKey = `${d.getMonth() + 1}/${d.getDate()}`;
      const existing = dateMap.get(dateKey) || { count: 0, ratingSum: 0 };
      existing.count += 1;
      existing.ratingSum += item.rating;
      dateMap.set(dateKey, existing);
    });

    return Array.from(dateMap.entries()).map(([date, val]) => ({
      date,
      submissions: val.count,
      avgRating: Number((val.ratingSum / val.count).toFixed(1)),
    }));
  }, [feedbacks]);

  // Chart Data: Category Bar Breakdown
  const categoryChartData = useMemo(() => {
    return (Object.keys(CATEGORY_MAP) as FeedbackCategory[]).map((cat) => {
      const items = feedbacks.filter((f) => f.category === cat);
      const count = items.length;
      const avg = count > 0 ? Number((items.reduce((s, i) => s + i.rating, 0) / count).toFixed(1)) : 0;
      return {
        category: CATEGORY_MAP[cat].label,
        count,
        avgRating: avg,
        color: CATEGORY_MAP[cat].color,
      };
    });
  }, [feedbacks]);

  // Filtering & Sorting
  const filteredFeedbacks = useMemo(() => {
    return feedbacks
      .filter((item) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesDesc = item.description.toLowerCase().includes(q);
          const matchesUser = item.userName.toLowerCase().includes(q);
          const matchesEmail = item.userEmail.toLowerCase().includes(q);
          const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesUser && !matchesEmail && !matchesTags) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'all' && item.status !== selectedStatus) {
          return false;
        }

        // Rating filter
        if (selectedRating !== 0 && item.rating !== selectedRating) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'rating-high') {
          return b.rating - a.rating;
        }
        if (sortBy === 'rating-low') {
          return a.rating - b.rating;
        }
        if (sortBy === 'upvotes') {
          return b.upvotes - a.upvotes;
        }
        return 0;
      });
  }, [feedbacks, search, selectedCategory, selectedStatus, selectedRating, sortBy]);

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    return {
      all: feedbacks.length,
      new: feedbacks.filter((f) => f.status === 'new').length,
      in_review: feedbacks.filter((f) => f.status === 'in_review').length,
      in_progress: feedbacks.filter((f) => f.status === 'in_progress').length,
      resolved: feedbacks.filter((f) => f.status === 'resolved').length,
      closed: feedbacks.filter((f) => f.status === 'closed').length,
    };
  }, [feedbacks]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Title',
      'Category',
      'Rating',
      'Status',
      'Priority',
      'Author',
      'Email',
      'Upvotes',
      'Date',
    ];
    const rows = filteredFeedbacks.map((f) => [
      f.id,
      `"${f.title.replace(/"/g, '""')}"`,
      f.category,
      f.rating,
      f.status,
      f.priority,
      `"${f.userName.replace(/"/g, '""')}"`,
      f.userEmail,
      f.upvotes,
      new Date(f.createdAt).toISOString().split('T')[0],
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredFeedbacks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `feedback_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const currentVoterId = currentUser?.id || 'guest-voter';

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedStatus !== 'all' ||
    selectedRating !== 0;

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedRating(0);
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Real-time sync badge and header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Feedback Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time Sync</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Live aggregated metrics, sentiment analysis, trend visualizations, and local persistence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="dashboard-quick-feedback-btn"
            type="button"
            onClick={() => setShowQuickDrawer(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Quick Submit Form</span>
          </button>

          <button
            id="dashboard-new-feedback-btn"
            type="button"
            onClick={() => onNavigate('form')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Full Form Page</span>
          </button>
        </div>
      </div>

      {/* Quick Slide-Over Form Drawer for real-time testing right on the dashboard */}
      {showQuickDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-slate-50 h-full shadow-2xl overflow-y-auto p-4 sm:p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="font-bold text-slate-900 text-base">Quick Feedback Submission</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FeedbackForm
                currentUser={currentUser}
                variant="drawer"
                compact
                onSubmitSuccess={() => {
                  setShowQuickDrawer(false);
                }}
                onCancel={() => setShowQuickDrawer(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* KPI Aggregated Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Feedback Volume */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Feedback</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total}</span>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
              <Activity className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all categories & sources</p>
        </div>

        {/* Avg Satisfaction Rating */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.avgRating}</span>
            <span className="text-xs text-slate-500">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
            <span className="text-emerald-700 font-semibold">{stats.positivePct}%</span>
            <span className="text-slate-400">positive sentiment (4-5★)</span>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {stats.resolvedRate}%
            </span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.resolvedRate}%` }}
            />
          </div>
        </div>

        {/* High & Urgent Issues */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Attention</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {stats.urgentCount}
            </span>
            <span className="text-xs text-rose-600 font-medium">urgent/high open</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.pendingCount} total tickets awaiting triage
          </p>
        </div>
      </div>

      {/* Dynamic Visualizations Grid: Trend Area Chart & Category Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Trends Chart (Area Chart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Feedback Submissions & Rating Trend</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Volume of incoming feedback and customer satisfaction over time
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              Updated {timeAgo(lastRealtimeUpdate.toISOString())}
            </span>
          </div>

          <div className="h-64 w-full">
            {timelineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-slate-800 space-y-1">
                            <p className="font-bold text-slate-200">Date: {label}</p>
                            <p className="text-indigo-300">
                              Submissions: <strong className="text-white">{data.submissions}</strong>
                            </p>
                            <p className="text-amber-300">
                              Avg Rating: <strong className="text-white">{data.avgRating} ★</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSubmissions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No submissions data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Categories Bar Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Volume by Category</span>
              </h2>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="text-[11px] text-slate-500 hover:text-slate-900 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-4">Click any bar to filter results</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryChartData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    tickLine={false}
                    axisLine={false}
                    width={75}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow border border-slate-800">
                            <span className="font-semibold block">{data.category}</span>
                            <span>{data.count} items</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 6, 6, 0]}
                    onClick={(data) => {
                      const foundKey = (Object.keys(CATEGORY_MAP) as FeedbackCategory[]).find(
                        (k) => CATEGORY_MAP[k].label === data.category
                      );
                      if (foundKey) {
                        setSelectedCategory(selectedCategory === foundKey ? 'all' : foundKey);
                      }
                    }}
                    cursor="pointer"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={
                          selectedCategory === 'all' ||
                          CATEGORY_MAP[selectedCategory as FeedbackCategory]?.label === entry.category
                            ? 1
                            : 0.35
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Filter items dynamically</span>
            <span className="font-medium text-slate-700">6 categories tracked</span>
          </div>
        </div>
      </div>

      {/* Interactive Rating Breakdown & Net Promoter Sentiment Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rating Score Distribution with Click-to-filter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Rating Breakdown</span>
            </h2>
            {selectedRating !== 0 && (
              <button
                type="button"
                onClick={() => setSelectedRating(0)}
                className="text-[11px] text-slate-500 hover:text-slate-900 font-medium"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star, idx) => {
              const count = stats.ratingsCount[idx] || 0;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              const isSelected = selectedRating === star;
              return (
                <div
                  key={star}
                  onClick={() => setSelectedRating(isSelected ? 0 : star)}
                  className={`flex items-center gap-2 p-1.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-amber-50 border border-amber-200' : 'hover:bg-slate-50'
                  }`}
                  title={`Filter by ${star} Stars`}
                >
                  <div className="flex items-center gap-1 w-14 text-xs font-semibold text-slate-700">
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-amber-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-mono text-slate-500">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sentiment Sentiment Breakdown (CSAT / NPS) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Customer Sentiment Health</span>
            </h2>

            {/* Visual multi-segment bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex mb-3">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${stats.positivePct}%` }}
                title={`Positive: ${stats.positivePct}%`}
              />
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${stats.neutralPct}%` }}
                title={`Neutral: ${stats.neutralPct}%`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${stats.negativePct}%` }}
                title={`Negative/Needs Attention: ${stats.negativePct}%`}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <span className="text-xs font-semibold text-emerald-800 block">Promoters (4-5★)</span>
                <span className="text-xl font-bold text-emerald-900">{stats.positivePct}%</span>
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
                <span className="text-xs font-semibold text-amber-800 block">Neutral (3★)</span>
                <span className="text-xl font-bold text-amber-900">{stats.neutralPct}%</span>
              </div>
              <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl">
                <span className="text-xs font-semibold text-rose-800 block">Critical (1-2★)</span>
                <span className="text-xl font-bold text-rose-900">{stats.negativePct}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Score: <strong className="text-slate-800">{stats.avgRating} / 5.0</strong></span>
            <span>Real-time feedback computation</span>
          </div>
        </div>
      </div>

      {/* Main Filter Toolbar & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none border-b border-slate-100">
          {(['all', 'new', 'in_review', 'in_progress', 'resolved', 'closed'] as const).map((st) => {
            const count = statusCounts[st];
            const isSelected = selectedStatus === st;
            return (
              <button
                key={st}
                type="button"
                id={`status-tab-${st}`}
                onClick={() => setSelectedStatus(st)}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="capitalize">{st.replace('_', ' ')}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Sort, View Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, name, email, or tags..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating-high">Highest Rating</option>
                <option value="rating-low">Lowest Rating</option>
                <option value="upvotes">Most Upvoted</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                id="view-mode-grid"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="view-mode-table"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export Menu */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                id="export-csv-btn"
                onClick={handleExportCSV}
                title="Export filtered list to CSV"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                id="export-json-btn"
                onClick={handleExportJSON}
                title="Export filtered list to JSON"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>JSON</span>
              </button>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                id="reset-filters-btn"
                onClick={resetFilters}
                className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredFeedbacks.length}</strong> of{' '}
          {feedbacks.length} items
        </span>
        {hasActiveFilters && (
          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Active filters applied
          </span>
        )}
      </div>

      {/* Empty State */}
      {filteredFeedbacks.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No feedback found matching criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            Try adjusting your search query, clearing the status/category filters, or submit a brand new review.
          </p>
          <div className="flex items-center justify-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('form')}
              className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredFeedbacks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFeedbacks.map((item) => {
            const hasUpvoted = item.upvotedBy.includes(currentVoterId);
            const statusConfig = STATUS_CONFIG[item.status];
            const priorityConfig = PRIORITY_BADGES[item.priority];

            return (
              <div
                key={item.id}
                id={`feedback-card-${item.id}`}
                onClick={() => onSelectFeedback(item)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Status & Priority */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                      >
                        {statusConfig.label}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityConfig.color}`}
                      >
                        {priorityConfig.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span className="text-xs font-bold text-amber-900">{item.rating}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Category & Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {CATEGORY_MAP[item.category]?.icon}
                      <span className="capitalize">{item.category.replace('_', ' ')}</span>
                    </span>

                    {item.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200"
                      >
                        #{t}
                      </span>
                    ))}
                    {item.tags.length > 2 && (
                      <span className="text-[10px] px-1 py-0.5 text-slate-400">
                        +{item.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                    {item.isAnonymous ? (
                      <div className="flex items-center gap-1 text-slate-400">
                        <EyeOff className="w-3 h-3" />
                        <span className="truncate">Anonymous</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 truncate">
                        <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                          {item.userName[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="truncate font-medium text-slate-700">
                          {item.userName}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      id={`upvote-btn-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleUpvote(item.id);
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        hasUpvoted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ThumbsUp
                        className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-emerald-700' : ''}`}
                      />
                      <span>{item.upvotes}</span>
                    </button>

                    <div className="flex items-center gap-1 text-slate-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{item.comments.length}</span>
                    </div>

                    <span className="text-[11px] text-slate-400">{timeAgo(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredFeedbacks.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Subject & Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Author</th>
                  <th className="py-3 px-3">Upvotes</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFeedbacks.map((item) => {
                  const hasUpvoted = item.upvotedBy.includes(currentVoterId);
                  const statusConfig = STATUS_CONFIG[item.status];
                  const priorityConfig = PRIORITY_BADGES[item.priority];

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectFeedback(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{item.title}</div>
                        <div className="text-slate-500 text-[11px] truncate">
                          {item.description}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-slate-700 capitalize">
                          {CATEGORY_MAP[item.category]?.icon}
                          <span>{item.category.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded w-fit">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{item.rating}.0</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityConfig.color}`}
                        >
                          {priorityConfig.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                        {item.isAnonymous ? 'Anonymous' : item.userName}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleUpvote(item.id);
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold cursor-pointer ${
                            hasUpvoted ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{item.upvotes}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">
                        {timeAgo(item.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
