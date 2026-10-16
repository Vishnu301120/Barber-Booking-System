import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createBooking, getServices, getBarbers } from "../services/api";

function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const [bookingData, setBookingData] = useState({
    barber: "",
    service: "",
    date: "",
    time: "",
    notes: "",
  });

  // Preselect from URL query parameters
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const preService = query.get("service");
    const preBarber = query.get("barber");

    if (preService || preBarber) {
      setBookingData((prev) => ({
        ...prev,
        ...(preService ? { service: preService } : {}),
        ...(preBarber ? { barber: preBarber } : {}),
      }));
    }
  }, [location.search]);

  const [servicesList, setServicesList] = useState([
    { name: "Hair Cut", price: 200 },
    { name: "Beard Trim", price: 100 },
    { name: "Hair & Beard", price: 250 },
    { name: "Hair Styling", price: 300 },
    { name: "Facial", price: 500 },
    { name: "Head Massage", price: 250 },
  ]);

  const [barbersList, setBarbersList] = useState([
    "Arun Kumar",
    "Karthik Raj",
    "Vijay Kumar",
    "Surya Prakash",
    "Rahul Kumar",
    "Ajay Raj",
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load barbers and services from API if available
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, barbersRes] = await Promise.all([
          getServices(),
          getBarbers(),
        ]);

        if (Array.isArray(servicesRes.data) && servicesRes.data.length > 0) {
          setServicesList(servicesRes.data);
        }
        if (Array.isArray(barbersRes.data) && barbersRes.data.length > 0) {
          setBarbersList(barbersRes.data.map((b) => b.name));
        }
      } catch (err) {
        // Fallback to static defaults
        console.log("Using default services & barbers list");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBookingData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Please login or create an account to book an appointment.");
      return;
    }

    setLoading(true);

    try {
      const response = await createBooking(bookingData, token);
      setSuccess("Booking confirmed successfully! Redirecting to your profile...");
      setTimeout(() => {
        navigate("/profile");
      }, 1200);
    } catch (err) {
      console.error("Booking Error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to complete booking. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page booking-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-title">
          <p>BOOK YOUR APPOINTMENT</p>
          <h1>Make a Booking</h1>
          <p>
            Choose your barber, service, date and preferred time.
          </p>
        </div>

        {/* Not Logged In Warning Banner */}
        {!user && (
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto 2rem auto",
              padding: "1rem 1.5rem",
              background: "rgba(234, 179, 8, 0.1)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <strong style={{ color: "#eab308" }}>Notice: </strong>
              <span>You need to be logged in to confirm your booking.</span>
            </div>
            <Link to="/login" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
              Login Now
            </Link>
          </div>
        )}

        {/* Booking Form */}
        <div className="booking-container">
          <form className="booking-form" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Success Message */}
            {success && (
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.15)",
                  color: "#22c55e",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  padding: "0.75rem 1rem",
                  borderRadius: "6px",
                  marginBottom: "1rem",
                  fontWeight: "500",
                }}
              >
                {success}
              </div>
            )}

            {/* Barber */}
            <div className="form-group">
              <label htmlFor="barber">Select Barber</label>
              <select
                id="barber"
                name="barber"
                value={bookingData.barber}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Barber --</option>
                {barbersList.map((barberName) => (
                  <option key={barberName} value={barberName}>
                    {barberName}
                  </option>
                ))}
              </select>
            </div>

            {/* Service */}
            <div className="form-group">
              <label htmlFor="service">Select Service</label>
              <select
                id="service"
                name="service"
                value={bookingData.service}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Service --</option>
                {servicesList.map((srv) => (
                  <option key={srv.name} value={srv.name}>
                    {srv.name} {srv.price ? `- ₹${srv.price}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="form-group">
              <label htmlFor="date">Select Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={bookingData.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {/* Time */}
            <div className="form-group">
              <label htmlFor="time">Select Time</label>
              <select
                id="time"
                name="time"
                value={bookingData.time}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Time --</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
                <option value="07:00 PM">07:00 PM</option>
              </select>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={bookingData.notes}
                onChange={handleChange}
                placeholder="Any special request?"
                rows="4"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary booking-submit"
              disabled={loading}
            >
              {loading ? "Confirming..." : "Confirm Booking"}
            </button>
          </form>

          {/* Booking Information */}
          <div className="booking-info">
            <h2>Booking Information</h2>

            <div className="booking-info-item">
              <span>📅</span>
              <div>
                <h3>Choose Your Date</h3>
                <p>Select a convenient date for your appointment.</p>
              </div>
            </div>

            <div className="booking-info-item">
              <span>⏰</span>
              <div>
                <h3>Choose Your Time</h3>
                <p>Select an available appointment time.</p>
              </div>
            </div>

            <div className="booking-info-item">
              <span>✂️</span>
              <div>
                <h3>Select Your Barber</h3>
                <p>Choose the barber you prefer.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Booking;