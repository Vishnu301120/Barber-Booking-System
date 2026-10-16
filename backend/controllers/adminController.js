import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import Barber from "../models/Barber.js";

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalUsers,
      totalBarbers,
      totalServices,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "cancelled" }),
      User.countDocuments({ role: "customer" }),
      Barber.countDocuments(),
      Service.countDocuments(),
      Booking.find()
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Calculate estimated revenue from completed or active bookings
    const bookings = await Booking.find({ status: { $in: ["confirmed", "completed"] } });
    const services = await Service.find();
    const servicePriceMap = {};
    services.forEach((s) => {
      servicePriceMap[s.name] = s.price;
    });

    let totalRevenue = 0;
    bookings.forEach((b) => {
      if (servicePriceMap[b.service]) {
        totalRevenue += servicePriceMap[b.service];
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalUsers,
        totalBarbers,
        totalServices,
        totalRevenue,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};
