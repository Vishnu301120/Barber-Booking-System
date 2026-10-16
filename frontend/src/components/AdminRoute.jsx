import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== "admin") {
    return (
      <main className="page">
        <div className="container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🛡️</div>
          <h1 style={{ fontSize: "2.2rem", marginBottom: "0.8rem", color: "#111" }}>
            Restricted Admin Area
          </h1>
          <p style={{ color: "#666", maxWidth: "480px", margin: "0 auto 2rem" }}>
            Your account ({user.email}) is logged in as a <strong>{user.role}</strong>, which does not have administrative privileges.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/admin/login" className="btn btn-primary" style={{ background: "#d4af37", color: "#111" }}>
              Sign In as Admin
            </a>
            <a href="/" className="btn" style={{ background: "#eee", color: "#333" }}>
              Return to Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  return children;
}

export default AdminRoute;
