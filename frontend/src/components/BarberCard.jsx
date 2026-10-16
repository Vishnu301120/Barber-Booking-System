import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function BarberCard({ barber }) {
  const { user } = useAuth();

  return (
    <div className="barber-card">

      {/* Barber Image */}
      <div className="barber-image">
        {barber.image ? (
          <img
            src={barber.image}
            alt={barber.name}
          />
        ) : (
          <div className="barber-placeholder">
            💈
          </div>
        )}
      </div>

      {/* Barber Details */}
      <div className="barber-content">

        <h3>{barber.name}</h3>

        <p className="barber-specialization">
          {barber.specialization}
        </p>

        <div className="barber-details">
          <span>⭐ {barber.rating}</span>
          <span>{barber.experience} Years Exp.</span>
        </div>

        <p className="barber-location">
          📍 {barber.location}
        </p>

        <Link
          to={`/booking?barber=${encodeURIComponent(barber.name)}`}
          className="btn btn-primary barber-btn"
        >
          Book Now
        </Link>

      </div>

    </div>
  );
}

export default BarberCard;