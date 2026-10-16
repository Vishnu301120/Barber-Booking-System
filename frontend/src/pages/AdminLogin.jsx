import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminLogin() {
  const navigate = useNavigate();
  const { user, token, login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoNotice, setInfoNotice] = useState("");

  // Redirect if already logged in as admin
  useEffect(() => {
    if (token && user?.role === "admin") {
      window.location.replace("/admin");
    }
  }, [token, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleFillDemo = () => {
    setFormData({
      email: "admin@barberbook.com",
      password: "adminpassword123",
    });
    setInfoNotice("Demo admin credentials loaded!");
    setError("");
    setTimeout(() => setInfoNotice(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoNotice("");
    setLoading(true);

    try {
      const response = await loginUser(formData);
      const { user: loggedInUser, token: authToken } = response.data;

      // Strict role verification for admin portal
      if (loggedInUser.role !== "admin") {
        setError(
          "Access Denied: This account does not have administrator privileges. Please use the Customer Login."
        );
        setLoading(false);
        return;
      }

      // Successful admin login
      login(loggedInUser, authToken);
      window.location.replace("/admin");
    } catch (err) {
      console.error("Admin Login Error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError("Invalid administrative email or password.");
      } else {
        setError("Unable to connect to the authentication server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-wrapper">
      <div className="admin-login-backdrop">
        <div className="admin-glow-circle circle-1"></div>
        <div className="admin-glow-circle circle-2"></div>
      </div>

      <div className="admin-login-card">
        {/* Top Executive Header */}
        <div className="admin-card-header">
          <div className="admin-badge-container">
            <span className="admin-badge-dot"></span>
            <span className="admin-badge-text">RESTRICTED EXECUTIVE ACCESS</span>
          </div>

          <div className="admin-portal-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <circle cx="12" cy="11" r="2" />
              <path d="M12 13v3" />
            </svg>
          </div>

          <h1 className="admin-portal-title">Admin Portal</h1>
          <p className="admin-portal-subtitle">
            BarberBook Management & System Operations
          </p>
        </div>

        {/* Demo Credentials Quick Fill Banner */}
        <div className="admin-demo-box">
          <div className="admin-demo-details">
            <div className="admin-demo-tag">Quick Demo Admin</div>
            <div className="admin-demo-creds">
              <code>admin@barberbook.com</code> / <code>adminpassword123</code>
            </div>
          </div>
          <button
            type="button"
            className="admin-fill-btn"
            onClick={handleFillDemo}
            title="Click to fill form with demo admin credentials"
          >
            Fill Demo
          </button>
        </div>

        {/* Notice Message */}
        {infoNotice && <div className="admin-info-banner">{infoNotice}</div>}

        {/* Error Alert */}
        {error && (
          <div className="admin-error-banner">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form className="admin-login-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="admin-input-group">
            <label htmlFor="admin-email">Admin Email Address</label>
            <div className="admin-input-field">
              <svg
                className="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="admin-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. admin@barberbook.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="admin-input-group">
            <div className="password-label-row">
              <label htmlFor="admin-password">Administrative Password</label>
            </div>
            <div className="admin-input-field">
              <svg
                className="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="admin-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="admin-btn-content">
                <span className="spinner-border"></span> Authenticating...
              </span>
            ) : (
              <span className="admin-btn-content">
                Authenticate & Enter Dashboard
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="admin-card-footer">
          <div className="admin-switch-links">
            <Link to="/login" className="admin-return-link">
              ← Switch to Customer Login
            </Link>
            <Link to="/" className="admin-return-link">
              Back to Home
            </Link>
          </div>

          <div className="admin-security-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>256-Bit SSL Encrypted Administrative Gateway</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminLogin;
