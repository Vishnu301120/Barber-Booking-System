import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ServiceCard({ service }) {
  const { user } = useAuth();

  return (
    <div className="service-card">

      <div className="service-icon">
        {service.icon}
      </div>

      <div className="service-content">
        <h3>{service.name}</h3>

        <p>{service.description}</p>

        <div className="service-info">
          <span>⏱ {service.duration} min</span>
          <strong>₹{service.price}</strong>
        </div>

        <Link
          to={`/booking?service=${encodeURIComponent(service.name)}`}
          className="btn btn-primary service-btn"
        >
          Book Now
        </Link>
      </div>

    </div>
  );
}

export default ServiceCard;