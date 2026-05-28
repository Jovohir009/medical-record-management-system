import { Router } from "express";
import {
  createDoctor,
  deleteDoctor,
  getDoctorById,
  getDoctors,
  updateDoctor,
} from "../controllers/doctorController";
import { authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.post("/", authorizeRoles("administrator"), createDoctor);
router.put("/:id", authorizeRoles("administrator"), updateDoctor);
router.delete("/:id", authorizeRoles("administrator"), deleteDoctor);

export default router;
