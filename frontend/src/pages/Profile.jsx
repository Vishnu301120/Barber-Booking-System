import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getMyBookings, updateBookingStatus, deleteBooking } from "../services/api";


function Profile() {
  const navigate = useNavigate();

  const { user, token, logout } = useAuth();

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || user?.role === "admin") {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {

      try {
        const response = await getMyBookings(token);

        setBookings(response.data.bookings || []);

      } catch (error) {
        console.error(
          "Bookings Error:",
          error
        );

        if (error.response) {
          setError(
            error.response.data.message ||
            "Unable to load bookings."
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

    fetchBookings();
  }, [token, user]);

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await updateBookingStatus(bookingId, "cancelled", token);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b))
      );
      if (res.data?.emailSent) {
        alert("Appointment cancelled. A cancellation email has been sent to your inbox. ✉️");
      } else if (res.data?.emailError) {
        alert(`Appointment cancelled, but email could not be delivered: ${res.data.emailError}`);
      } else {
        alert("Appointment cancelled successfully.");
      }
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert(err.response?.data?.message || "Failed to cancel appointment");
    }
  };



  // User is not logged in
  if (!user) {
    return (
      <main className="page">

        <div className="container">

          <div className="profile-login-message">

            <h1>Please Login</h1>

            <p>
              You need to login to view your profile.
            </p>

            <Link
              to="/login"
              className="btn btn-primary"
            >
              Go to Login
            </Link>

          </div>

        </div>

      </main>
    );
  }

  return (
    <main className="page profile-page">

      <div className="container">

        {/* Page Header */}

        <div className="page-title">

          <p>{user.role === "admin" ? "ADMINISTRATOR" : "MY ACCOUNT"}</p>

          <h1>My Profile</h1>

          <p>
            {user.role === "admin"
              ? "Manage your administrator account."
              : "Manage your account and appointments."}
          </p>

        </div>


        {/* Profile Layout */}

        {user.role === "admin" ? (
          <div style={{ maxWidth: "480px", margin: "0 auto" }}>

            <div className="profile-card">

              <div className="profile-avatar">
                {user.name
                  ? user.name.charAt(0).toUpperCase()
                  : "A"}
              </div>

              <h2>{user.name}</h2>

              <p className="profile-role">
                👑 Administrator
              </p>

              <div className="profile-details" style={{ marginBottom: "20px" }}>

                <div>
                  <strong>Email</strong>
                  <span>{user.email}</span>
                </div>

                <div>
                  <strong>Phone</strong>
                  <span>
                    {user.phone || "Not provided"}
                  </span>
                </div>

                <div>
                  <strong>Role</strong>
                  <span>System Administrator</span>
                </div>

              </div>

              <Link
                to="/admin"
                className="btn btn-primary"
                style={{ width: "100%", marginBottom: "12px", textAlign: "center", display: "block" }}
              >
                ⚡ Open Admin Panel
              </Link>

              <button
                type="button"
                className="btn logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>

          </div>
        ) : (
          <div className="profile-grid">

            {/* User Information */}

            <div className="profile-card">

              <div className="profile-avatar">
                {user.name
                  ? user.name.charAt(0).toUpperCase()
                  : "U"}
              </div>

              <h2>{user.name}</h2>

              <p className="profile-role">
                Customer
              </p>

              <div className="profile-details">

                <div>
                  <strong>Email</strong>
                  <span>{user.email}</span>
                </div>

                <div>
                  <strong>Phone</strong>
                  <span>
                    {user.phone || "Not provided"}
                  </span>
                </div>

              </div>

              <button
                type="button"
                className="btn logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>


            {/* Bookings */}

            <div className="bookings-card">

              <div className="bookings-header">

                <div>
                  <p>APPOINTMENTS</p>
                  <h2>My Bookings</h2>
                </div>

                <Link
                  to="/booking"
                  className="btn btn-primary"
                >
                  New Booking
                </Link>

              </div>


              {/* Loading */}

              {loading && (
                <div className="booking-state">
                  Loading bookings...
                </div>
              )}


              {/* Error */}

              {!loading && error && (
                <div className="error-message">
                  {error}
                </div>
              )}


              {/* Empty */}

              {!loading &&
                !error &&
                bookings.length === 0 && (
                  <div className="booking-state">

                    <div className="empty-icon">
                      📅
                    </div>

                    <h3>No Bookings Yet</h3>

                    <p>
                      You haven't made any appointments yet.
                    </p>

                    <Link
                      to="/booking"
                      className="btn btn-primary"
                    >
                      Book an Appointment
                    </Link>

                  </div>
                )}


              {/* Booking List */}

              {!loading &&
                !error &&
                bookings.length > 0 && (

                  <div className="booking-list">

                    {bookings.map((booking) => (

                      <div
                        className="booking-item"
                        key={booking._id}
                      >

                        <div className="booking-main">

                          <h3>
                            {booking.service}
                          </h3>

                          <p>
                            Barber:{" "}
                            {booking.barber}
                          </p>

                        </div>

                        <div className="booking-date">

                          <strong>
                            {booking.date}
                          </strong>

                          <span>
                            {booking.time}
                          </span>

                        </div>

                        <span
                          className={`booking-status ${
                            booking.status || "pending"
                          }`}
                        >
                          {booking.status || "Pending"}
                        </span>

                        {booking.status !== "cancelled" && booking.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(booking._id)}
                            style={{
                              background: "transparent",
                              border: "1px solid #fee2e2",
                              borderRadius: "4px",
                              color: "#dc2626",
                              fontSize: "0.85rem",
                              cursor: "pointer",
                              padding: "4px 8px",
                              fontWeight: "bold",
                            }}
                            title="Cancel this appointment"
                          >
                            ✕ Cancel
                          </button>
                        )}

                      </div>

                    ))}

                  </div>

                )}

            </div>

          </div>
        )}

      </div>

    </main>
  );
}

export default Profile;