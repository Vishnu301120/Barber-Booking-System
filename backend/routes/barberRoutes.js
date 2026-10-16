import express from "express";
import {
  getBarbers,
  getBarberById,
  createBarber,
  updateBarber,
  deleteBarber,
} from "../controllers/barberController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getBarbers)
  .post(protect, authorize("admin"), createBarber);

router.route("/:id")
  .get(getBarberById)
  .put(protect, authorize("admin"), updateBarber)
  .delete(protect, authorize("admin"), deleteBarber);

export default router;
