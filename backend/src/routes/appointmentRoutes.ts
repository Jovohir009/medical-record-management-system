import { Router } from "express";
import {
  createAppointment,
  getAppointments,
  getAvailableAppointmentSlots,
  getReceptionistDashboardData,
  updateAppointment,
  updateAppointmentStatus,
} from "../controllers/appointmentController";
import { authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getAppointments);
router.get("/available-slots", getAvailableAppointmentSlots);
router.get("/receptionist-dashboard-data", getReceptionistDashboardData);
router.post("/", authorizeRoles("administrator", "receptionist"), createAppointment);
router.patch("/:id/status", authorizeRoles("administrator", "clinician"), updateAppointmentStatus);
router.put("/:id", authorizeRoles("administrator"), updateAppointment);

export default router;
