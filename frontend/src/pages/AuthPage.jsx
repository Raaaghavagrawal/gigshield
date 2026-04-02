import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LiveBackground from "../components/LiveBackground";
import {
  Briefcase,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Monitor,
  Shield,
  User,
} from "lucide-react";
import { api } from "../utils/api";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    platform: "Swiggy",
    weekly_income: "",
  });

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        const signupRes = await api.post("/api/auth/signup", {
          ...form,
          weekly_income: Number(form.weekly_income),
        });
        localStorage.setItem("gigshield_token", signupRes.data.token);
        localStorage.setItem("gigshield_user", JSON.stringify(signupRes.data.user));
      } else {
        const loginRes = await api.post("/api/auth/login", {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem("gigshield_token", loginRes.data.token);
        localStorage.setItem("gigshield_user", JSON.stringify(loginRes.data.user));
      }

      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Authentication failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell auth-shell--split" style={{ position: 'relative', overflow: 'hidden' }}>
      <LiveBackground />
      <aside className="auth-left" style={{ position: 'relative', zIndex: 1 }}>
        <div className="auth-left-top">
          <Link to="/" className="auth-left-brand" aria-label="Back to home">
            <span className="auth-left-mark">
              <Shield size={18} />
            </span>
            <span className="auth-left-name">GigShield AI</span>
          </Link>
        </div>

        <div className="auth-left-hero">
          <div className="auth-left-kicker">WELCOME</div>
          <h1 className="auth-left-title">back</h1>
          <p className="auth-left-desc">
            Secure access to your personal dashboard for parametric protection insights.
          </p>
        </div>

        <div className="auth-left-options">
          <div className="auth-left-option">
            <span className="auth-left-option-icon">
              <Shield size={18} />
            </span>
            <div>
              <div className="auth-left-option-title">Dashboard Access</div>
              <div className="auth-left-option-sub">
                View risk signals, events, and wallet payouts.
              </div>
            </div>
          </div>

          <div className="auth-left-option">
            <span className="auth-left-option-icon">
              <Monitor size={18} />
            </span>
            <div>
              <div className="auth-left-option-title">Demo Terminal</div>
              <div className="auth-left-option-sub">
                Simulate event triggers for pitch-ready demos.
              </div>
            </div>
          </div>
        </div>

        <div className="auth-left-footer">
          <span className="auth-left-help">Need help? Contact support</span>
        </div>
      </aside>

      <main className="auth-right" style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
        <div className="auth-right-header">
          <div className="auth-right-kicker">SECURE ACCESS</div>
          <h2 className="auth-right-title">
            {mode === "login" ? "Log in to GigShield" : "Create your GigShield account"}
          </h2>
          <p className="auth-right-sub">
            Choose your access method below to continue.
          </p>
        </div>

        <section className="auth-right-stack">
          <div className="auth-access-card">
            <div className="auth-access-card-head">
              <span className="auth-access-icon">
                <Shield size={18} />
              </span>
              <div>
                <div className="auth-access-title">
                  {mode === "login" ? "Gig Worker Login" : "Gig Worker Signup"}
                </div>
                <div className="auth-access-sub">
                  Access your dashboard, policies, and payout wallet.
                </div>
              </div>
            </div>

            <div className="auth-toggle auth-toggle--dark">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => setMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={mode === "signup" ? "active" : ""}
                onClick={() => setMode("signup")}
                type="button"
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form auth-form--tight">
              {mode === "signup" && (
                <div className="auth-grid">
                  <div className="auth-field">
                    <span className="auth-input-icon" aria-hidden="true">
                      <User size={16} />
                    </span>
                    <input
                      name="name"
                      placeholder="Full name"
                      value={form.name}
                      onChange={onChange}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <span className="auth-input-icon" aria-hidden="true">
                      <MapPin size={16} />
                    </span>
                    <input
                      name="city"
                      placeholder="City (e.g. Delhi)"
                      value={form.city}
                      onChange={onChange}
                      autoComplete="address-level2"
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <span className="auth-input-icon" aria-hidden="true">
                      <Briefcase size={16} />
                    </span>
                    <select
                      name="platform"
                      value={form.platform}
                      onChange={onChange}
                    >
                      <option>Swiggy</option>
                      <option>Zomato</option>
                      <option>Rapido</option>
                      <option>Uber</option>
                    </select>
                  </div>
                  <div className="auth-field">
                    <span className="auth-input-icon" aria-hidden="true">
                      ₹
                    </span>
                    <input
                      name="weekly_income"
                      type="number"
                      inputMode="numeric"
                      placeholder="Weekly income (INR)"
                      value={form.weekly_income}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <span className="auth-input-icon" aria-hidden="true">
                  <Mail size={16} />
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={onChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <span className="auth-input-icon" aria-hidden="true">
                  <Lock size={16} />
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={onChange}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  required
                />
                <button
                  className="auth-icon-button"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="auth-row">
                <span className="auth-mini">
                  {mode === "login" ? "" : "You can edit details later in dashboard."}
                </span>
                <button className="auth-link" type="button" disabled>
                  Forgot password?
                </button>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button disabled={loading} type="submit" className="auth-submit auth-submit--solid">
                {loading
                  ? "Please wait..."
                  : mode === "signup"
                    ? "Create account"
                    : "Login"}
              </button>
            </form>
          </div>

          {mode === "login" && (
            <div className="auth-access-card auth-access-card--secondary">
              <div className="auth-access-card-head">
                <span className="auth-access-icon auth-access-icon--dim">
                  <Monitor size={18} />
                </span>
                <div>
                  <div className="auth-access-title">Demo Terminal</div>
                  <div className="auth-access-sub">
                    Use simulated events to demonstrate triggered payouts.
                  </div>
                </div>
              </div>
              <div className="auth-secondary-actions">
                <span className="auth-footnote">
                  By continuing, you agree to the demo terms. No real insurance is issued.
                </span>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AuthPage;
