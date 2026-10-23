import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { sendBookingStatusEmail } from "../utils/emailService.js";


// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { barber, service, date, time, notes } = req.body;

    if (!barber || !service || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Please provide barber, service, date, and time",
      });
    }

    // Optional check: Avoid duplicate booking for the same barber at the same date and time slot
    const existingBooking = await Booking.findOne({
      barber,
      date,
      time,
      status: { $ne: "cancelled" },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: `Barber ${barber} is already booked for ${time} on ${date}. Please select another time slot.`,
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      barber,
      service,
      date,
      time,
      notes: notes || "",
      status: "pending",
    });

    // Populate user and send appointment acknowledgement email to user
    const populatedBooking = await Booking.findById(booking._id).populate(
      "user",
      "name email phone"
    );
    let emailResult = null;
    if (populatedBooking?.user?.email) {
      emailResult = await sendBookingStatusEmail(populatedBooking, "pending");
    }

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully!",
      booking,
      emailSent: emailResult?.success ?? false,
      isTestAccount: emailResult?.isTestAccount ?? false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin/Staff)
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (sends nodemailer email on confirmed, completed, cancelled)
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const booking = await Booking.findById(req.params.id).populate(
      "user",
      "name email phone"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check ownership if user is not admin
    const bookingUserId = booking.user?._id
      ? booking.user._id.toString()
      : booking.user.toString();

    if (bookingUserId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    // Customers are only allowed to cancel their own appointments
    if (req.user.role !== "admin" && status !== "cancelled") {
      return res.status(403).json({
        success: false,
        message: "Customers can only cancel their appointments",
      });
    }

    booking.status = status;
    await booking.save();

    // Trigger email via nodemailer for confirmed, completed, or cancelled status
    let emailResult = null;
    if (["confirmed", "completed", "cancelled"].includes(status)) {
      emailResult = await sendBookingStatusEmail(booking, status);
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
      emailSent: emailResult?.success ?? false,
      emailError: emailResult?.error || null,
      isTestAccount: emailResult?.isTestAccount ?? false,
      previewUrl: emailResult?.previewUrl || null,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Delete a booking (sends cancellation email if active)
// @route   DELETE /api/bookings/:id
// @access  Private
export const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "user",
      "name email phone"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check ownership if user is not admin
    const bookingUserId = booking.user?._id
      ? booking.user._id.toString()
      : booking.user.toString();

    if (bookingUserId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this booking",
      });
    }

    // Send cancellation email if deleting an active booking
    let emailResult = null;
    if (booking.status !== "cancelled") {
      emailResult = await sendBookingStatusEmail(booking, "cancelled");
    }

    await booking.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      emailSent: emailResult?.success ?? false,
      previewUrl: emailResult?.previewUrl || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually send or resend status email for a booking
// @route   POST /api/bookings/:id/send-email
// @access  Private/Admin
export const resendBookingEmail = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "user",
      "name email phone"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const targetStatus = req.body.status || booking.status;
    const emailResult = await sendBookingStatusEmail(booking, targetStatus);

    return res.status(200).json({
      success: emailResult?.success ?? false,
      message: emailResult?.success
        ? `Email sent successfully to ${booking?.user?.email}`
        : "Failed to send email. Check logs or SMTP settings.",
      emailResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Test email configuration
// @route   POST /api/bookings/test-email
// @access  Private
export const testEmail = async (req, res, next) => {
  try {
    const toEmail = req.body.email || req.user.email;
    const mockBooking = {
      user: { name: req.user.name || "Test User", email: toEmail },
      barber: req.body.barber || "Demo Barber",
      service: req.body.service || "Classic Haircut",
      date: req.body.date || new Date().toISOString().split("T")[0],
      time: req.body.time || "10:00 AM",
      notes: "This is a test notification from Nodemailer.",
      status: req.body.status || "confirmed",
    };

    const emailResult = await sendBookingStatusEmail(
      mockBooking,
      mockBooking.status
    );

    return res.status(200).json({
      success: emailResult?.success ?? false,
      message: emailResult?.success
        ? `Test email sent to ${toEmail}`
        : "Failed to send test email",
      emailResult,
    });
  } catch (error) {
    next(error);
  }
};


