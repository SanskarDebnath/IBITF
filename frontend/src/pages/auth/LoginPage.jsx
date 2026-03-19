import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChartColumnBig,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Package,
  ShieldCheck,
  ShoppingBag,
  Store
} from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import "./LoginPage.css";

const accessHighlights = [
  {
    icon: ShoppingBag,
    title: "Buyer Access",
    description: "Track orders, save wishlists, and move through checkout faster."
  },
  {
    icon: Store,
    title: "Seller Access",
    description: "Open your seller portal, manage products, and monitor store activity."
  }
];

const trustPoints = [
  {
    icon: ShieldCheck,
    label: "Protected login with token-based sessions"
  },
  {
    icon: Package,
    label: "Manage orders, products, and category workflows"
  },
  {
    icon: ChartColumnBig,
    label: "Jump into seller KPI and dashboard tools after sign in"
  }
];

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData);
      const redirectTo = location.state?.from || "/";
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-showcase">
          <div className="login-showcase__badge">Tripureswari Access Portal</div>
          <h1>Sign in once and switch between shopping and selling.</h1>
          <p className="login-showcase__subtitle">
            Buyers can track orders and save products. Sellers can move straight into dashboard,
            KPIs, orders, settings, and catalog management.
          </p>

          <div className="login-showcase__cards">
            {accessHighlights.map(({ icon: Icon, title, description }) => (
              <article key={title} className="login-showcase__card">
                <div className="login-showcase__icon">
                  <Icon size={20} />
                </div>
                <div>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="login-showcase__trust">
            {trustPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="login-showcase__trust-item">
                <Icon size={18} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="login-panel">
          <div className="login-card">
            <div className="login-card__eyebrow">
              <ShieldCheck size={16} />
              <span>Secure Sign In</span>
            </div>
            <h2>Welcome back</h2>
            <p className="login-card__subtitle">
              Use your email and password to continue to your account.
            </p>

            <form onSubmit={handleSubmit} className="login-form">
              <label className="login-field">
                <span className="login-field__label">Email address</span>
                <div className="login-input">
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="login-field">
                <span className="login-field__label">Password</span>
                <div className="login-input">
                  <Lock size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="login-input__toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {error && <div className="login-alert">{error}</div>}

              <div className="login-form__meta">
                <span>Seller and buyer accounts use the same login.</span>
                <Link to="/auth/forgot-password">Forgot password?</Link>
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="login-card__footer">
              <span>New here?</span>
              <Link to="/auth/signup">Create an account</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
