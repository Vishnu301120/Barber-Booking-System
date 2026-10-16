import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    barber: {
      type: String,
      required: [true, "Barber selection is required"],
      trim: true,
    },
    service: {
      type: String,
      required: [true, "Service selection is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Booking date is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Booking time slot is required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
