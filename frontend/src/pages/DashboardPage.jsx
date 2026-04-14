import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, MapPin, RefreshCcw, Shield, TrendingUp,
  Wallet as WalletIcon, FileText, History, BarChart3,
  BrainCircuit, ShieldAlert, Bell, Settings as SettingsIcon,
  ChevronRight, Package, Zap, User,
} from "lucide-react";

import Overview from "./dashboard/Overview";
import PolicyCenter from "./dashboard/PolicyCenter";
import ClaimsHistory from "./dashboard/ClaimsHistory";
import EnvironmentalAnalytics from "./dashboard/EnvironmentalAnalytics";
import AICoPilot from "./dashboard/AICoPilot";
import FraudDetection from "./dashboard/FraudDetection";
import WalletProtection from "./dashboard/WalletProtection";
import NotificationsCenter from "./dashboard/NotificationsCenter";
import Settings from "./dashboard/Settings";
import ProfilePage from "./ProfilePage";
import OrdersPage from "./OrdersPage";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";
import ThemeToggle from "../components/ThemeToggle";

const pageVariants = {
  initial: { opacity: 0, y: 16, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -8, filter: "blur(2px)", transition: { duration: 0.2 } },
};

function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("aegis_user") || "{}");
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navGroups = [
    {
      label: "Dashboard",
      items: [
        { id: "overview",   label: "Performance",         icon: <TrendingUp size={16} />,    badge: null },
        { id: "predictor",  label: "AI Co-Pilot",         icon: <BrainCircuit size={16} />,  badge: "AI" },
        { id: "analytics",  label: "Environment",         icon: <BarChart3 size={16} />,     badge: null },
      ],
    },
    {
      label: "Insurance",
      items: [
        { id: "policy",     label: "My Policies",         icon: <FileText size={16} />,      badge: null },
        { id: "claims",     label: "Claims History",      icon: <History size={16} />,       badge: null },
        { id: "wallet",     label: "Wallet & Balance",    icon: <WalletIcon size={16} />,    badge: null },
      ],
    },
    {
      label: "Safety",
      items: [
        { id: "fraud",         label: "Fraud Detection",  icon: <ShieldAlert size={16} />,   badge: null },
        { id: "notifications", label: "Alerts",           icon: <Bell size={16} />,           badge: "3" },
      ],
    },
    {
      label: "Account",
      items: [
        { id: "profile",    label: "My Profile",          icon: <User size={16} />,          badge: null },
        { id: "orders",     label: "My Orders",           icon: <Package size={16} />,       badge: null },
        { id: "settings",   label: "Settings",            icon: <SettingsIcon size={16} />,  badge: null },
      ],
    },
  ];

  // flat list for finding current label
  const allNavItems = navGroups.flatMap(g => g.items);

  const handleLogout = () => {
    localStorage.removeItem("aegis_token");
    localStorage.removeItem("aegis_user");
    navigate("/auth");
  };

  const Sidebar = () => (
    <aside
      className="hidden lg:flex flex-col w-64 fixed h-full z-50 transition-all duration-300"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Shield size={18} className="text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[--bg-surface] animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight" style={{ color: "var(--text-bright)" }}>
              GigShield
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>
              Aegis Network ✦
            </p>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="px-4 pb-4">
        <div
          className="p-3 rounded-2xl cursor-pointer group transition-all duration-300"
          style={{ background: "var(--bg-glass)", border: "1px solid var(--border)" }}
          onClick={() => setActiveTab("profile")}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center font-black text-sm" style={{ color: "var(--primary-bright)" }}>
              {user.name?.[0]?.toUpperCase() || "G"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate" style={{ color: "var(--text-bright)" }}>
                {user.name || "Gig Worker"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {user.platform || "Active Rider"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
              <MapPin size={9} />
              {user.city?.split(" ")[0] || "City"}
            </div>
          </div>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] px-3 mb-2" style={{ color: "var(--text-dim)" }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  active={activeTab === item.id}
                  onClick={() => setActiveTab(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 group"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(244,63,94,0.08)";
            e.currentTarget.style.color = "#f43f5e";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--bg-deep)" }}>
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="blob blob-blue" style={{ width: "500px", height: "500px", top: "-100px", right: "200px", opacity: 0.12 }} />
        <div className="blob blob-cyan"  style={{ width: "400px", height: "400px", bottom: "100px", left: "400px", opacity: 0.08 }} />
      </div>

      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <header
          className="h-16 sticky top-0 z-40 px-6 flex items-center justify-between transition-all duration-300"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base font-black tracking-tight" style={{ color: "var(--text-bright)" }}>
                {allNavItems.find(n => n.id === activeTab)?.label || "Dashboard"}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                GigShield Aegis Network
              </p>
            </div>
            <div className="badge-live ml-2">
              <div className="pulse-dot pulse-dot-green" />
              Live
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />
            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-xl transition-all duration-200"
              style={{ color: "var(--text-muted)", background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-glass)"; e.currentTarget.style.color = "var(--primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
              title="Refresh"
            >
              <RefreshCcw size={16} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {activeTab === "overview"       && <Overview />}
              {activeTab === "policy"         && <PolicyCenter />}
              {activeTab === "claims"         && <ClaimsHistory />}
              {activeTab === "analytics"      && <EnvironmentalAnalytics />}
              {activeTab === "predictor"      && <AICoPilot />}
              {activeTab === "fraud"          && <FraudDetection />}
              {activeTab === "wallet"         && <WalletProtection />}
              {activeTab === "notifications"  && <NotificationsCenter />}
              {activeTab === "profile"        && <ProfilePage isDashboard={true} />}
              {activeTab === "orders"         && <OrdersPage isDashboard={true} />}
              {activeTab === "settings"       && <Settings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function NavItem({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative group ${active ? "nav-item-active" : ""}`}
      style={!active ? { color: "var(--text-muted)" } : {}}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = "var(--bg-glass)";
          e.currentTarget.style.color = "var(--text-bright)";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-muted)";
        }
      }}
    >
      <span className={`shrink-0 transition-colors ${active ? "text-indigo-400" : ""}`}>
        {item.icon}
      </span>
      <span className="flex-1 text-left truncate">{item.label}</span>
      {item.badge && (
        <span
          className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
          style={{
            background: item.badge === "AI" ? "rgba(99,102,241,0.2)" : "rgba(244,63,94,0.15)",
            color:      item.badge === "AI" ? "#818cf8"              : "#f43f5e",
            border:     item.badge === "AI" ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(244,63,94,0.25)",
          }}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}

export default DashboardPage;
