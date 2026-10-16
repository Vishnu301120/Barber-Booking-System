import Service from "../models/Service.js";

// @desc    Get all active services
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ price: 1 });
    return res.status(200).json(services);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    return res.status(200).json(service);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private/Admin
export const createService = async (req, res, next) => {
  try {
    const { name, description, price, duration, icon } = req.body;

    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "Service with this name already exists",
      });
    }

    const service = await Service.create({
      name,
      description,
      price,
      duration,
      icon: icon || "✂️",
    });

    return res.status(201).json({
      success: true,
      service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (req.body.name && req.body.name.trim() !== service.name) {
      const existing = await Service.findOne({ name: req.body.name.trim(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "A service with this name already exists",
        });
      }
    }

    service.name = req.body.name ? req.body.name.trim() : service.name;
    service.description = req.body.description !== undefined ? req.body.description : service.description;
    service.price = req.body.price !== undefined ? Number(req.body.price) : service.price;
    service.duration = req.body.duration !== undefined ? Number(req.body.duration) : service.duration;
    service.icon = req.body.icon || service.icon;
    if (req.body.isActive !== undefined) {
      service.isActive = req.body.isActive;
    }

    const updatedService = await service.save();

    return res.status(200).json({
      success: true,
      service: updatedService,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await service.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

