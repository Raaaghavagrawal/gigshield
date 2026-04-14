import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Zap, TrendingUp, Activity, Loader2, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCcw, Droplets, Wind, Thermometer, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../utils/api';

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    if (end === 0) return;
    const duration = 900;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * end);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return (
    <span>
      {prefix}{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="premium-card p-6 space-y-4">
    <div className="skeleton h-3 w-24 rounded" />
    <div className="skeleton h-8 w-36 rounded" />
    <div className="skeleton h-2 w-full rounded" />
    <div className="skeleton h-2 w-3/4 rounded" />
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, prefix, suffix, color, icon, trend, trendLabel, delay }) {
  const trendUp = trend >= 0;
  return (
    <motion.div variants={fadeUp} className="premium-card p-6 group cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color.bg}`}>
          <span className={color.icon}>{icon}</span>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-3xl font-black tracking-tight stat-value" style={{ color: "var(--text-bright)" }}>
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={0} />
      </p>
      {trendLabel && (
        <p className="text-[10px] mt-2" style={{ color: "var(--text-dim)" }}>{trendLabel}</p>
      )}
    </motion.div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-3 rounded-xl text-xs" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-bright)", boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>
      <p className="font-bold mb-2" style={{ color: "var(--text-muted)" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name}: <span style={{ color: "var(--text-bright)" }}>{Number(p.value).toFixed(1)}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Overview Component ───────────────────────────────────────────────────────
const Overview = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/api/dashboard/overview');
      setData({
        ...res.data,
        netProtected:       res.data.ai_metrics?.net_protected_forecast || 0,
        weeklyIncome:       res.data.ai_metrics?.weekly_income || 0,
        financialMomentum:  res.data.user?.wallet_balance || res.data.wallet_balance || 0,
        history:            res.data.history || [],
      });
    } catch (err) {
      setError("Could not reach Aegis servers. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const ai   = data?.ai_metrics || {};
  const env  = data?.environment || {};
  const user = data?.user || {};

  const pieData = useMemo(() => {
    const aq  = env.aqi || 0;
    const rf  = env.rainfall || 0;
    const rsk = ai.risk?.risk_score || 0;
    const wA  = 10 + (aq / 300) * 90;
    const wH  = 10 + Math.min(1, rf / 50) * 90;
    const wS  = 10 + (rsk / 100) * 90;
    const tot = wA + wH + wS;
    return [
      { name: "Atmospheric",  color: "#6366f1", value: Math.round((wA / tot) * 100) },
      { name: "Precipitation",color: "#06b6d4", value: Math.round((wH / tot) * 100) },
      { name: "Systemic",     color: "#10b981", value: Math.round((wS / tot) * 100) },
    ];
  }, [data]);

  const chartData = useMemo(() => {
    if (!data?.history?.length) return [];
    return data.history.map(item => ({
      time:        item.time,
      AQI:         Number(item.aqi),
      Rainfall:    Number(item.rainfall),
      Temperature: Number(item.temperature),
    }));
  }, [data?.history]);

  if (loading && !data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 skeleton rounded-2xl h-80" />
          <div className="skeleton rounded-2xl h-80" />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
          <AlertCircle size={28} className="text-rose-400" />
        </div>
        <h3 className="text-lg font-black mb-2" style={{ color: "var(--text-bright)" }}>Connection Lost</h3>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>{error}</p>
        <button onClick={fetchData} className="btn-primary">
          <RefreshCcw size={14} /> Reconnect
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">

      {/* Hero Greeting */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-bright)" }}>
            Your Performance Today 👋
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Real-time telemetry from {user.city || "your region"} · Aegis AI is watching
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="badge-live">
            <div className="pulse-dot pulse-dot-green" />
            Live Data
          </div>
          <button onClick={fetchData} className="p-2 rounded-xl transition-colors" style={{ color: "var(--text-muted)", background: "var(--bg-glass)" }}>
            <RefreshCcw size={14} />
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Net Income Protected"
          value={ai.net_protected_forecast || 0}
          prefix="₹"
          color={{ bg: "bg-indigo-500/10", icon: "text-indigo-400" }}
          icon={<Shield size={18} />}
          trend={12.4}
          trendLabel="vs last week"
        />
        <StatCard
          label="Weekly Earnings"
          value={ai.weekly_income || 0}
          prefix="₹"
          color={{ bg: "bg-emerald-500/10", icon: "text-emerald-400" }}
          icon={<TrendingUp size={18} />}
          trend={8.2}
          trendLabel="Earnings up this week"
        />
        <StatCard
          label="Potential Risk Exposure"
          value={ai.estimated_loss || 0}
          prefix="₹"
          color={{ bg: "bg-rose-500/10", icon: "text-rose-400" }}
          icon={<AlertCircle size={18} />}
          trend={-3.1}
          trendLabel="Reduced vs last week"
        />
        <StatCard
          label="AI Confidence Score"
          value={Math.round((ai.confidence || 0) * 100)}
          suffix="%"
          color={{ bg: "bg-cyan-500/10", icon: "text-cyan-400" }}
          icon={<Zap size={18} />}
          trendLabel="Model precision"
        />
      </div>

      {/* Main Chart + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area / Composed Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 premium-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider" style={{ color: "var(--text-bright)" }}>
                Environmental Telemetry
              </h3>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                AQI · Rainfall · Temperature over last cycle
              </p>
            </div>
            <div className="flex items-center gap-3">
              {[{ label: "AQI", color: "#6366f1" }, { label: "Rain", color: "#06b6d4" }, { label: "Temp", color: "#f59e0b" }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[280px]">
            {chartData.length >= 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ left: -10, right: 0 }}>
                  <defs>
                    <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="var(--chart-axis)"
                    fontSize={9}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--chart-axis)", fontWeight: 700 }}
                  />
                  <YAxis
                    stroke="var(--chart-axis)"
                    fontSize={9}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--chart-axis)", fontWeight: 700 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="AQI"      fill="url(#aqiGrad)"  radius={[4, 4, 0, 0]} barSize={16} stroke="#6366f1" strokeWidth={1} />
                  <Bar dataKey="Rainfall" fill="url(#rainGrad)" radius={[4, 4, 0, 0]} barSize={16} stroke="#06b6d4" strokeWidth={1} />
                  <Line type="monotone" dataKey="Temperature" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full rounded-2xl flex flex-col items-center justify-center" style={{ background: "var(--bg-glass)", border: "1px solid var(--border)" }}>
                <Activity size={32} style={{ color: "var(--text-dim)" }} className="mb-3" />
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
                  No telemetry data yet
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Risk Distribution Pie */}
        <motion.div variants={fadeUp} className="premium-card p-6 flex flex-col">
          <h3 className="font-black text-sm uppercase tracking-wider mb-1" style={{ color: "var(--text-bright)" }}>
            Risk Distribution
          </h3>
          <p className="text-[10px] mb-4" style={{ color: "var(--text-muted)" }}>
            Weighted environmental risk metrics
          </p>

          <div className="relative flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>AQI</p>
              <p className="text-2xl font-black" style={{ color: "var(--text-bright)" }}>{env.aqi || "--"}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[11px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>{d.name}</span>
                </div>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-lg" style={{ color: "var(--text-bright)", background: "var(--bg-glass)", border: "1px solid var(--border)" }}>
                  {d.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Environment Factors + Neural Pulse + Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Environment Factor Assessment */}
        <motion.div variants={fadeUp} className="premium-card p-6">
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>
            Factor Assessment
          </h4>
          <div className="space-y-4">
            {[
              { label: "Atmospheric Buffer", value: env.aqi != null ? Math.max(0, 100 - Math.round(env.aqi / 3)) : 0, color: "#6366f1", icon: <Wind size={14} /> },
              { label: "Hydric Load",         value: env.rainfall != null ? Math.min(100, env.rainfall * 2) : 0,        color: "#06b6d4", icon: <Droplets size={14} /> },
              { label: "Model Precision",      value: ai.confidence != null ? Math.round(ai.confidence * 100) : 0,      color: "#10b981", icon: <Zap size={14} /> },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ color: item.color }}>{item.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{item.label}</span>
                  </div>
                  <span className="text-[11px] font-black" style={{ color: "var(--text-bright)" }}>{item.value}%</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1.2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="progress-fill"
                    style={{ background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}88 100%)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Neural Pulse */}
        <motion.div variants={fadeUp} className="premium-card p-6 relative overflow-hidden">
          <div className="blob blob-blue absolute -top-20 -right-20 w-40 h-40" style={{ opacity: 0.2 }} />
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 relative z-10" style={{ color: "var(--text-muted)" }}>
            Neural Pulse
          </h4>
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <div className="badge-live"><div className="pulse-dot pulse-dot-green" />{user.city || "Region"}</div>
          </div>
          <p className="text-xs leading-relaxed mb-5 relative z-10" style={{ color: "var(--text-muted)" }}>
            Active localized triggers synced with Aegis cloud. Your region is being monitored in real-time.
          </p>
          <div className="p-4 rounded-2xl relative z-10 flex items-center gap-3" style={{ background: "var(--bg-glass)", border: "1px solid var(--border)" }}>
            <div className="p-2.5 rounded-xl bg-indigo-500/10">
              <TrendingUp size={18} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Stability Index
              </p>
              <p className="text-lg font-black gradient-text-green">+14.2% Stable</p>
            </div>
          </div>
        </motion.div>

        {/* Wallet Balance */}
        <motion.div variants={fadeUp} className="premium-card p-6 relative overflow-hidden">
          <div className="blob blob-green absolute -bottom-16 -right-16 w-36 h-36" style={{ opacity: 0.2 }} />
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 relative z-10" style={{ color: "var(--text-muted)" }}>
            Vault Balance
          </h4>
          <p className="text-4xl font-black tracking-tight stat-value relative z-10" style={{ color: "var(--text-bright)" }}>
            ₹<AnimatedNumber value={data?.financialMomentum || 0} decimals={0} />
          </p>
          <p className="text-[10px] font-bold mt-1 mb-5 relative z-10" style={{ color: "var(--text-dim)" }}>
            Managed Wallet · Protected
          </p>

          {/* Mini Sparkline */}
          <div className="h-16 -mx-2 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[380,420,405,470,450,510,490,560].map((v, i) => ({ v }))}>
                <defs>
                  <linearGradient id="walletGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2.5} fill="url(#walletGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <button onClick={fetchData} className="btn-secondary w-full mt-4 text-[10px] py-2 relative z-10">
            <RefreshCcw size={12} /> Sync
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Overview;
