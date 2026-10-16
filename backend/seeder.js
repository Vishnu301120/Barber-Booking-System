import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Service from "./models/Service.js";
import Barber from "./models/Barber.js";
import Booking from "./models/Booking.js";

dotenv.config();

const services = [
  {
    name: "Hair Cut",
    description: "Professional haircut with modern styling.",
    price: 200,
    duration: 30,
    icon: "✂️",
    isActive: true,
  },
  {
    name: "Beard Trim",
    description: "Clean and stylish beard trimming.",
    price: 100,
    duration: 20,
    icon: "🧔",
    isActive: true,
  },
  {
    name: "Hair & Beard",
    description: "Complete haircut and beard grooming.",
    price: 250,
    duration: 45,
    icon: "💇",
    isActive: true,
  },
  {
    name: "Hair Styling",
    description: "Professional styling for your perfect look.",
    price: 300,
    duration: 40,
    icon: "💈",
    isActive: true,
  },
  {
    name: "Facial",
    description: "Relaxing facial treatment for healthy skin.",
    price: 500,
    duration: 45,
    icon: "✨",
    isActive: true,
  },
  {
    name: "Head Massage",
    description: "Relaxing head massage to reduce stress.",
    price: 250,
    duration: 30,
    icon: "💆",
    isActive: true,
  },
];

const barbers = [
  {
    name: "Arun Kumar",
    specialization: "Senior Hair Stylist",
    rating: 4.8,
    experience: 8,
    location: "Madurai",
    image: "",
    isAvailable: true,
  },
  {
    name: "Karthik Raj",
    specialization: "Hair & Beard Specialist",
    rating: 4.7,
    experience: 6,
    location: "Madurai",
    image: "",
    isAvailable: true,
  },
  {
    name: "Vijay Kumar",
    specialization: "Modern Hair Stylist",
    rating: 4.9,
    experience: 7,
    location: "Madurai",
    image: "",
    isAvailable: true,
  },
  {
    name: "Surya Prakash",
    specialization: "Beard Specialist",
    rating: 4.6,
    experience: 5,
    location: "Madurai",
    image: "",
    isAvailable: true,
  },
  {
    name: "Rahul Kumar",
    specialization: "Hair Styling Expert",
    rating: 4.8,
    experience: 9,
    location: "Madurai",
    image: "",
    isAvailable: true,
  },
  {
    name: "Ajay Raj",
    specialization: "Grooming Specialist",
    rating: 4.7,
    experience: 6,
    location: "Madurai",
    image: "",
    isAvailable: true,
  },
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/barber_booking";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    if (process.argv[2] === "-d") {
      await Booking.deleteMany();
      await Service.deleteMany();
      await Barber.deleteMany();
      await User.deleteMany();
      console.log("🗑️  All data successfully destroyed!");
      process.exit();
    }

    // Clear existing services and barbers before repopulating
    await Service.deleteMany();
    await Barber.deleteMany();

    await Service.insertMany(services);
    console.log(`✅ ${services.length} services seeded.`);

    await Barber.insertMany(barbers);
    console.log(`✅ ${barbers.length} barbers seeded.`);

    // Create Admin User if not exists
    const adminExists = await User.findOne({ email: "admin@barberbook.com" });
    if (!adminExists) {
      await User.create({
        name: "BarberBook Admin",
        email: "admin@barberbook.com",
        phone: "9876543210",
        password: "adminpassword123",
        role: "admin",
      });
      console.log("✅ Admin user created: admin@barberbook.com / adminpassword123");
    }

    console.log("🌱 Database seeding complete!");
    process.exit();
  } catch (error) {
    console.error(`❌ Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
