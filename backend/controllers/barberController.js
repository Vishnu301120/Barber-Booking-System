import Barber from "../models/Barber.js";

// @desc    Get all available barbers
// @route   GET /api/barbers
// @access  Public
export const getBarbers = async (req, res, next) => {
  try {
    const barbers = await Barber.find({ isAvailable: true }).sort({ rating: -1 });
    return res.status(200).json(barbers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single barber by ID
// @route   GET /api/barbers/:id
// @access  Public
export const getBarberById = async (req, res, next) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: "Barber not found",
      });
    }
    return res.status(200).json(barber);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new barber
// @route   POST /api/barbers
// @access  Private/Admin
export const createBarber = async (req, res, next) => {
  try {
    const { name, specialization, rating, experience, location, image } = req.body;

    const existingBarber = await Barber.findOne({ name });
    if (existingBarber) {
      return res.status(400).json({
        success: false,
        message: "Barber with this name already exists",
      });
    }

    const barber = await Barber.create({
      name,
      specialization,
      rating: rating || 4.8,
      experience: experience || 5,
      location: location || "Madurai",
      image: image || "",
    });

    return res.status(201).json({
      success: true,
      barber,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a barber
// @route   PUT /api/barbers/:id
// @access  Private/Admin
export const updateBarber = async (req, res, next) => {
  try {
    const barber = await Barber.findById(req.params.id);

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: "Barber not found",
      });
    }

    if (req.body.name && req.body.name.trim() !== barber.name) {
      const existing = await Barber.findOne({ name: req.body.name.trim(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "A barber with this name already exists",
        });
      }
    }

    barber.name = req.body.name ? req.body.name.trim() : barber.name;
    barber.specialization = req.body.specialization || barber.specialization;
    barber.rating = req.body.rating !== undefined ? Number(req.body.rating) : barber.rating;
    barber.experience = req.body.experience !== undefined ? Number(req.body.experience) : barber.experience;
    barber.location = req.body.location || barber.location;
    barber.image = req.body.image !== undefined ? req.body.image : barber.image;
    if (req.body.isAvailable !== undefined) {
      barber.isAvailable = req.body.isAvailable;
    }

    const updatedBarber = await barber.save();

    return res.status(200).json({
      success: true,
      barber: updatedBarber,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a barber
// @route   DELETE /api/barbers/:id
// @access  Private/Admin
export const deleteBarber = async (req, res, next) => {
  try {
    const barber = await Barber.findById(req.params.id);

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: "Barber not found",
      });
    }

    await barber.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Barber deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

