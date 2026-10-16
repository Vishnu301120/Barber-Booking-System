import { useState, useEffect } from "react";
import ServiceCard from "../components/ServiceCard";
import { getServices } from "../services/api";

const initialServices = [
  {
    id: 1,
    name: "Hair Cut",
    description: "Professional haircut with modern styling.",
    price: 200,
    duration: 30,
    icon: "✂️",
  },
  {
    id: 2,
    name: "Beard Trim",
    description: "Clean and stylish beard trimming.",
    price: 100,
    duration: 20,
    icon: "🧔",
  },
  {
    id: 3,
    name: "Hair & Beard",
    description: "Complete haircut and beard grooming.",
    price: 250,
    duration: 45,
    icon: "💇",
  },
  {
    id: 4,
    name: "Hair Styling",
    description: "Professional styling for your perfect look.",
    price: 300,
    duration: 40,
    icon: "💈",
  },
  {
    id: 5,
    name: "Facial",
    description: "Relaxing facial treatment for healthy skin.",
    price: 500,
    duration: 45,
    icon: "✨",
  },
  {
    id: 6,
    name: "Head Massage",
    description: "Relaxing head massage to reduce stress.",
    price: 250,
    duration: 30,
    icon: "💆",
  },
];

function Services() {
  const [services, setServices] = useState(initialServices);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await getServices();
        const data = Array.isArray(res.data) ? res.data : res.data.services;
        if (data && data.length > 0) {
          setServices(data);
        }
      } catch (error) {
        console.log("Using cached services list");
      }
    };

    fetchServices();
  }, []);

  return (
    <main className="page">
      <div className="container">
        <div className="page-title">
          <p>OUR SERVICES</p>
          <h1>Choose Your Service</h1>
          <p>
            Professional grooming services for your perfect look.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <ServiceCard
              key={service._id || service.id}
              service={service}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Services;