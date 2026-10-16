import { useState, useEffect } from "react";
import BarberCard from "../components/BarberCard";
import { getBarbers } from "../services/api";

const initialBarbers = [
  {
    id: 1,
    name: "Arun Kumar",
    specialization: "Senior Hair Stylist",
    rating: 4.8,
    experience: 8,
    location: "Madurai",
    image: "",
  },
  {
    id: 2,
    name: "Karthik Raj",
    specialization: "Hair & Beard Specialist",
    rating: 4.7,
    experience: 6,
    location: "Madurai",
    image: "",
  },
  {
    id: 3,
    name: "Vijay Kumar",
    specialization: "Modern Hair Stylist",
    rating: 4.9,
    experience: 7,
    location: "Madurai",
    image: "",
  },
  {
    id: 4,
    name: "Surya Prakash",
    specialization: "Beard Specialist",
    rating: 4.6,
    experience: 5,
    location: "Madurai",
    image: "",
  },
  {
    id: 5,
    name: "Rahul Kumar",
    specialization: "Hair Styling Expert",
    rating: 4.8,
    experience: 9,
    location: "Madurai",
    image: "",
  },
  {
    id: 6,
    name: "Ajay Raj",
    specialization: "Grooming Specialist",
    rating: 4.7,
    experience: 6,
    location: "Madurai",
    image: "",
  },
];

function Barbers() {
  const [barbers, setBarbers] = useState(initialBarbers);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const res = await getBarbers();
        const data = Array.isArray(res.data) ? res.data : res.data.barbers;
        if (data && data.length > 0) {
          setBarbers(data);
        }
      } catch (error) {
        console.log("Using cached barbers list");
      }
    };

    fetchBarbers();
  }, []);

  return (
    <main className="page">
      <div className="container">
        {/* Page Header */}
        <div className="page-title">
          <p>OUR PROFESSIONALS</p>
          <h1>Meet Our Barbers</h1>
          <p>
            Choose your preferred barber and book your appointment.
          </p>
        </div>

        {/* Barber List */}
        <div className="barbers-grid">
          {barbers.map((barber) => (
            <BarberCard
              key={barber._id || barber.id}
              barber={barber}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Barbers;