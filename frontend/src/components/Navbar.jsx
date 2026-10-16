import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();

    window.location.replace("/login");
  };

  return (
    <nav className="navbar">

      <div className="nav-container">

        {/* Logo */}

        <Link to="/" className="logo">
          Barber<span>Book</span>
        </Link>


        {/* Navigation */}

        <div className="nav-links">

          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/services">
            Services
          </NavLink>

          <NavLink to="/barbers">
            Barbers
          </NavLink>

          <NavLink to="/booking">
            Booking
          </NavLink>


          {/* Authentication */}

          {user ? (
            <>
              {user.role === "admin" && (
                <NavLink
                  to="/admin"
                  className="nav-admin-link"
                >
                  ⚡ Admin Panel
                </NavLink>
              )}

              <NavLink to="/profile">
                Profile
              </NavLink>

              <button
                type="button"
                className="nav-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="register-btn"
              >
                Register
              </NavLink>

              <NavLink
                to="/admin/login"
                className="nav-admin-portal-link"
                title="Admin Portal Access"
              >
                🛡️ Admin
              </NavLink>
            </>
          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar;