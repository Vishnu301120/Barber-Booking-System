import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Footer() {
  const { user } = useAuth();

  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-section">
          <h2>Barber<span>Book</span></h2>
          <p>
            Book your favorite barber and manage your
            appointments easily.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>

          {user?.role !== "admin" && <Link to="/">Home</Link>}
          <Link to="/services">Services</Link>
          <Link to="/barbers">Barbers</Link>
          {user?.role !== "admin" && <Link to="/booking">Booking</Link>}
          {user?.role === "admin" && <Link to="/admin">Admin Panel</Link>}
        </div>

        <div className="footer-section">
          <h3>Contact</h3>

          <p>📍 Madurai, Tamil Nadu</p>
          <p>📞 +91 98765 43210</p>
          <p>✉️ support@barberbook.com</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © 2026 BarberBook. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;