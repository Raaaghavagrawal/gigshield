import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CloudRain,
  Gauge,
  IndianRupee,
  LineChart as LineIcon,
  LogOut,
  MapPin,
  Newspaper,
  Search,
  RefreshCcw,
  Shield,
  TrendingUp,
  Wallet as WalletIcon,
  Wind,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, getAuthHeaders } from "../utils/api";
import { buildExplainableInsights } from "../utils/insights";

const chartTemplate = [
  { t: "09:00", risk: 18 },
  { t: "10:00", risk: 24 },
  { t: "11:00", risk: 33 },
  { t: "12:00", risk: 48 },
  { t: "13:00", risk: 61 },
  { t: "14:00", risk: 56 },
];

function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("gigshield_user") || "{}");
  const [city, setCity] = useState(user.city || "Delhi");
  const [income, setIncome] = useState(user.weekly_income || 5000);
  const [sideQuery, setSideQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const chartData = useMemo(() => {
    if (!analysis) return chartTemplate;
    return chartTemplate.map((x, i) => ({
      ...x,
      risk: Math.max(8, Math.min(100, analysis.risk.risk_score - 20 + i * 7)),
    }));
  }, [analysis]);

  const explainableInsights = useMemo(
    () => buildExplainableInsights(analysis),
    [analysis]
  );

  const loadWallet = async () => {
    try {
      const res = await api.get("/api/payouts/wallet", {
        headers: getAuthHeaders(),
      });
      setWallet(res.data);
    } catch {
      setWallet(null);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/analyze", {
        city,
        weekly_income: Number(income),
      });
      setAnalysis(res.data);
      await loadWallet();
      setLastUpdatedAt(new Date());
    } catch (err) {
      setError(err?.response?.data?.message || "Risk analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("gigshield_token");
    localStorage.removeItem("gigshield_user");
    navigate("/auth");
  };

  const runQuickAnalyze = async () => {
    await handleAnalyze();
    setActiveTab("risk");
  };

  return (
    <div className="dash3-shell">
      <aside className="dash3-sidebar">
        <div className="dash3-brand">
          <Shield size={18} />
          <div>
            <div className="dash3-brand-name">GigShield.AI</div>
            <div className="dash3-brand-sub">AI-powered analysis</div>
          </div>
        </div>

        <div className="dash3-search">
          <Search size={16} />
          <input
            value={sideQuery}
            onChange={(e) => setSideQuery(e.target.value)}
            placeholder="Search city (e.g. Delhi)"
          />
        </div>

        <nav className="dash3-nav">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            <TrendingUp size={16} /> Overview
          </button>
          <button
            className={activeTab === "risk" ? "active" : ""}
            onClick={() => setActiveTab("risk")}
          >
            <Gauge size={16} /> AI & Risk
          </button>
          <button
            className={activeTab === "wallet" ? "active" : ""}
            onClick={() => setActiveTab("wallet")}
          >
            <WalletIcon size={16} /> Wallet
          </button>
          <button
            className={activeTab === "news" ? "active" : ""}
            onClick={() => setActiveTab("news")}
          >
            <Newspaper size={16} /> Updates
          </button>
        </nav>

        <div className="dash3-sidecard">
          <div className="dash3-sidecard-title">Profile</div>
          <div className="dash3-sidecard-sub">
            {user.name || "Gig Worker"} • {user.platform || "Platform User"}
          </div>
          <div className="dash3-sidecard-meta">
            <MapPin size={14} /> {user.city || city}
          </div>
        </div>
      </aside>

      <div className="dash3-main">
        <header className="dash3-topbar">
          <div className="dash3-topbar-title">
            {activeTab === "overview"
              ? "Overview"
              : activeTab === "risk"
                ? "AI & Risk"
                : activeTab === "wallet"
                  ? "Wallet"
                  : "Updates"}
          </div>
          <div className="dash3-topbar-actions">
            {lastUpdatedAt && (
              <span className="dash3-muted">
                Updated {lastUpdatedAt.toLocaleTimeString()}
              </span>
            )}
            <button className="dash3-iconbtn" onClick={loadWallet} title="Refresh">
              <RefreshCcw size={16} />
            </button>
            <button className="dash3-logout" onClick={logout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        {activeTab === "overview" && (
          <section className="dash3-content">
            <div className="dash3-hero panel">
              <div className="dash3-hero-center">
                <div className="dash3-hero-icon">
                  <Search size={18} />
                </div>
                <h2>Welcome to GigShield</h2>
                <p>
                  Your personal income protection terminal with real-time signals,
                  AI insights, and parametric triggers.
                </p>

                <div className="dash3-hero-search">
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Delhi"
                  />
                  <button onClick={runQuickAnalyze} disabled={loading}>
                    {loading ? "Searching..." : "Analyze"}
                  </button>
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button className="dash3-hero-cta" type="button" onClick={() => setActiveTab("risk")}>
                  Open Risk Dashboard
                </button>
              </div>
            </div>

            <div className="dash3-tiles">
              <button className="dash3-tile" onClick={() => setActiveTab("overview")}>
                <div className="dash3-tile-icon">📊</div>
                <div className="dash3-tile-title">Overview</div>
                <div className="dash3-tile-sub">Signals at a glance</div>
              </button>
              <button className="dash3-tile" onClick={() => setActiveTab("risk")}>
                <div className="dash3-tile-icon">🧠</div>
                <div className="dash3-tile-title">AI & Risk</div>
                <div className="dash3-tile-sub">Forecast + triggers</div>
              </button>
              <button className="dash3-tile" onClick={() => setActiveTab("wallet")}>
                <div className="dash3-tile-icon">💳</div>
                <div className="dash3-tile-title">Wallet</div>
                <div className="dash3-tile-sub">Payout ledger</div>
              </button>
              <button className="dash3-tile" onClick={() => setActiveTab("news")}>
                <div className="dash3-tile-icon">🛰️</div>
                <div className="dash3-tile-title">Updates</div>
                <div className="dash3-tile-sub">System status</div>
              </button>
            </div>
          </section>
        )}

        {activeTab === "risk" && (
          <section className="dash3-content">
            <section className="dash-layout">
              <aside className="dash-col dash-col--left">
                <div className="panel panel--tight">
                  <div className="panel-head">
                    <div className="panel-title">Risk Scanner</div>
                    <div className="panel-subtitle">Configure the analysis target</div>
                  </div>

                  <div className="dash-form">
                    <label>City</label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Delhi"
                    />
                    <label>Weekly income (INR)</label>
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                    />
                    <button onClick={handleAnalyze} disabled={loading}>
                      {loading ? "Analyzing..." : "Run analysis"}
                    </button>
                    {error && <p className="auth-error">{error}</p>}
                  </div>
                </div>

                <div className="panel panel--tight">
                  <div className="panel-head">
                    <div className="panel-title">Quick signals</div>
                    <div className="panel-subtitle">What matters right now</div>
                  </div>
                  <div className="dash-signal-list">
                    <div className="dash-signal">
                      <span className="dash-signal-k">Risk</span>
                      <span className="dash-signal-v">
                        {analysis?.risk?.risk_level || "—"}
                      </span>
                    </div>
                    <div className="dash-signal">
                      <span className="dash-signal-k">Score</span>
                      <span className="dash-signal-v">
                        {analysis?.risk?.risk_score ?? "—"}
                      </span>
                    </div>
                    <div className="dash-signal">
                      <span className="dash-signal-k">Auto payout</span>
                      <span className="dash-signal-v">
                        {analysis?.risk?.auto_payout ? "Enabled" : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>

              <main className="dash-col dash-col--center">
                <div className="panel">
                  <div className="panel-head panel-head--row">
                    <div>
                      <div className="panel-title">
                        <LineIcon size={16} /> Intraday risk movement
                      </div>
                      <div className="panel-subtitle">
                        Synthetic terminal chart (demo)
                      </div>
                    </div>
                    <div className="dash-chip">
                      <TrendingUp size={14} /> Signal:{" "}
                      {analysis?.risk?.risk_level || "—"}
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="rgba(148,163,184,0.18)"
                        strokeDasharray="3 3"
                      />
                      <XAxis dataKey="t" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="risk"
                        stroke="#10b981"
                        fill="url(#riskFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="dash-metrics">
                  <div className="panel panel--metric">
                    <div className="metric-head">
                      <Activity size={16} /> Risk
                    </div>
                    <div className="metric-value">
                      {analysis?.risk?.risk_level || "—"}
                    </div>
                    <div className="metric-sub">
                      Score: {analysis?.risk?.risk_score ?? "--"}
                    </div>
                  </div>
                  <div className="panel panel--metric">
                    <div className="metric-head">
                      <CloudRain size={16} /> Rainfall
                    </div>
                    <div className="metric-value">
                      {analysis?.weather?.rainfall ?? "--"} mm
                    </div>
                    <div className="metric-sub">
                      {analysis?.weather?.condition || "Awaiting data"}
                    </div>
                  </div>
                  <div className="panel panel--metric">
                    <div className="metric-head">
                      <Wind size={16} /> AQI
                    </div>
                    <div className="metric-value">
                      {analysis?.weather?.aqi ?? "--"}
                    </div>
                    <div className="metric-sub">
                      {analysis?.fraud?.fraud_risk
                        ? `Fraud risk: ${analysis.fraud.fraud_risk}`
                        : "—"}
                    </div>
                  </div>
                  <div className="panel panel--metric">
                    <div className="metric-head">
                      <IndianRupee size={16} /> Predicted payout
                    </div>
                    <div className="metric-value">
                      ₹{analysis?.risk?.suggested_payout?.toLocaleString?.() ?? "--"}
                    </div>
                    <div className="metric-sub">
                      Wallet: ₹{wallet?.wallet_balance?.toLocaleString?.() ?? "0"}
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <div className="panel-title">Explainable AI insights</div>
                    <div className="panel-subtitle">
                      Human-readable summary of why this risk score/payout was produced
                    </div>
                  </div>
                  <div className="dash-insights">
                    {explainableInsights.map((line, idx) => (
                      <div className="dash-insight" key={idx}>
                        <span className="dash-insight-dot" aria-hidden="true" />
                        <span>{line}</span>
                      </div>
                    ))}
                    {!analysis && (
                      <div className="dash-empty">
                        Run an analysis to generate explainable insights.
                      </div>
                    )}
                  </div>
                </div>
              </main>

              <aside className="dash-col dash-col--right">
                <div className="panel panel--tight">
                  <div className="panel-head">
                    <div className="panel-title">Latest snapshot</div>
                    <div className="panel-subtitle">From the last analysis run</div>
                  </div>
                  <div className="dash-snapshot">
                    <div className="dash-snap-row">
                      <span>City</span>
                      <span>{analysis?.city || city}</span>
                    </div>
                    <div className="dash-snap-row">
                      <span>Trigger</span>
                      <span>{analysis?.risk?.trigger_met ? "Triggered" : "—"}</span>
                    </div>
                    <div className="dash-snap-row">
                      <span>Payout %</span>
                      <span>{analysis?.risk?.payout_percentage ?? "—"}%</span>
                    </div>
                    <div className="dash-snap-row">
                      <span>Condition</span>
                      <span>{analysis?.weather?.condition || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="panel panel--tight">
                  <div className="panel-head">
                    <div className="panel-title">Wallet</div>
                    <div className="panel-subtitle">Total credited amount</div>
                  </div>
                  <div className="dash-wallet">
                    <div className="dash-wallet-amt">
                      ₹{wallet?.wallet_balance?.toLocaleString?.() ?? "0"}
                    </div>
                    <div className="dash-wallet-sub">
                      {wallet?.payouts?.length || 0} payout entries
                    </div>
                  </div>
                </div>
              </aside>
            </section>
          </section>
        )}

        {activeTab === "wallet" && (
          <section className="dash3-content">
            <div className="panel">
              <div className="panel-head panel-head--row">
                <div>
                  <div className="panel-title">
                    <WalletIcon size={16} /> Wallet & payouts
                  </div>
                  <div className="panel-subtitle">Ledger of credited payouts</div>
                </div>
                <div className="dash-chip">
                  Balance: ₹{wallet?.wallet_balance?.toLocaleString?.() ?? "0"}
                </div>
              </div>

              <div className="dash-table">
                <div className="dash-table-head">
                  <span>Date</span>
                  <span>City</span>
                  <span>Status</span>
                  <span className="right">Amount</span>
                </div>
                {(wallet?.payouts || []).map((p) => (
                  <div className="dash-table-row" key={p.id}>
                    <span>{String(p.event_date || "").slice(0, 10) || "—"}</span>
                    <span>{p.city || "—"}</span>
                    <span className={p.flagged ? "pill pill--warn" : "pill pill--ok"}>
                      {p.flagged ? "Flagged" : "Credited"}
                    </span>
                    <span className="right">₹{Number(p.amount).toFixed(2)}</span>
                  </div>
                ))}
                {(!wallet?.payouts || wallet.payouts.length === 0) && (
                  <div className="dash-empty">
                    No payouts yet. Trigger an event to see credits here.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "news" && (
          <section className="dash3-content">
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">System updates</div>
                <div className="panel-subtitle">
                  External Data Engine runs hourly. Use events to trigger payouts.
                </div>
              </div>
              <div className="dash-empty">
                Tip: Call <code>/api/events/fetch-environment/:city</code> to store
                real data, then run payouts from backend if triggered.
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
