import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [loginData, setLoginData] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.successMessage || "");

  useEffect(() => {
    if (location.state?.email) {
      setLoginData((previousData) => ({
        ...previousData,
        email: location.state.email,
      }));
    }
    if (location.state?.successMessage) {
      setSuccess(location.state.successMessage);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLoginData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await loginUser(loginData);

      console.log("Login Response:", response.data);

      const { user, token } = response.data;

      login(user, token);

      if (user.role === "admin") {
        window.location.replace("/admin");
      } else {
        navigate("/profile");
      }

    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        setError(
          error.response.data.message ||
          "Invalid email or password."
        );
      } else {
        setError(
          "Unable to connect to the server."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      <div className="auth-container">

        {/* Header */}

        <div className="auth-header">
          <p>WELCOME BACK</p>

          <h1>Login</h1>

          <span>
            Login to manage your appointments.
          </span>
        </div>


        {/* Success */}

        {success && (
          <div className="success-message">
            <span>✅</span> {success}
          </div>
        )}

        {/* Error */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* Login Form */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* Email */}

          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              type="email"
              id="email"
              name="email"
              value={loginData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

          </div>


          {/* Password */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              type="password"
              id="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

          </div>


          {/* Submit */}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>


        {/* Register */}

        <div className="auth-footer">

          <p>
            Don't have an account?{" "}

            <Link to="/register">
              Create Account
            </Link>
          </p>

          <div style={{ marginTop: "18px", paddingTop: "15px", borderTop: "1px solid #eee" }}>
            <Link
              to="/admin/login"
              style={{
                color: "#b48c26",
                fontWeight: 600,
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span>🛡️</span> Staff or Administrator? Access Admin Portal →
            </Link>
          </div>

        </div>

      </div>

    </main>
  );
}

export default Login;