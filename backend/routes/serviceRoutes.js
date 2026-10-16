import express from "express";
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getServices)
  .post(protect, authorize("admin"), createService);

router.route("/:id")
  .get(getServiceById)
  .put(protect, authorize("admin"), updateService)
  .delete(protect, authorize("admin"), deleteService);

export default router;
