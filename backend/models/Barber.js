import mongoose from "mongoose";

const barberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Barber name is required"],
      trim: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    experience: {
      type: Number,
      default: 5,
      min: [0, "Experience cannot be negative"],
    },
    location: {
      type: String,
      default: "Madurai",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Barber = mongoose.model("Barber", barberSchema);

export default Barber;
