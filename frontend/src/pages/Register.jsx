import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setRegisterData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check passwords
    if (
      registerData.password !==
      registerData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
      });

      console.log(
        "Register Response:",
        response.data
      );

      setSuccess("Account registered successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login", {
          state: {
            successMessage: "Account created successfully! Please login with your email and password.",
            email: registerData.email,
          },
        });
      }, 1200);

    } catch (error) {
      console.error(
        "Registration Error:",
        error
      );

      if (error.response) {
        setError(
          error.response.data.message ||
          "Registration failed."
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

          <p>JOIN BARBERBOOK</p>

          <h1>Create Account</h1>

          <span>
            Create an account to book your
            appointments.
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


        {/* Register Form */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* Name */}

          <div className="form-group">

            <label htmlFor="name">
              Full Name
            </label>

            <input
              type="text"
              id="name"
              name="name"
              value={registerData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

          </div>


          {/* Email */}

          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              type="email"
              id="email"
              name="email"
              value={registerData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

          </div>


          {/* Phone */}

          <div className="form-group">

            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              type="tel"
              id="phone"
              name="phone"
              value={registerData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
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
              value={registerData.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength="6"
              required
            />

          </div>


          {/* Confirm Password */}

          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={registerData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              minLength="6"
              required
            />

          </div>


          {/* Submit */}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading || Boolean(success)}
          >
            {loading
              ? "Creating Account..."
              : success
              ? "Redirecting to Login..."
              : "Create Account"}
          </button>

        </form>


        {/* Login */}

        <div className="auth-footer">

          <p>
            Already have an account?{" "}

            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

      </div>

    </main>
  );
}

export default Register;