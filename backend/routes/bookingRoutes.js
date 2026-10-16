import express from "express";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createBooking)
  .get(protect, authorize("admin"), getAllBookings);

router.route("/my")
  .get(protect, getMyBookings);

router.route("/:id")
  .delete(protect, deleteBooking);

router.route("/:id/status")
  .put(protect, updateBookingStatus);

export default router;

