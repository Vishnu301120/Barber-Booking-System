import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Barbers from "./pages/Barbers";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith("/admin");
  const hideNavAndFooter = isAdminDashboard;

  return (
    <>
      {/* Navigation */}
      {!hideNavAndFooter && <Navbar />}

      {/* Page Routes */}
      <Routes>

        {/* Home - Always loads User Page on startup */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Services */}
        <Route
          path="/services"
          element={<Services />}
        />

        {/* Barbers */}
        <Route
          path="/barbers"
          element={<Barbers />}
        />

        {/* Booking */}
        <Route
          path="/booking"
          element={<Booking />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />
        <Route
          path="/admin-login"
          element={<Navigate to="/admin/login" replace />}
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="page">
              <div className="container">
                <div className="page-title">
                  <h1>404</h1>
                  <p>Page not found.</p>
                </div>
              </div>
            </div>
          }
        />

      </Routes>

      {/* Footer */}
      {!hideNavAndFooter && <Footer />}
    </>
  );
}

export default App;