import { Router } from "express";
import {
  createPatient,
  deletePatient,
  getPatientById,
  getPatients,
  updatePatient,
} from "../controllers/patientController";
import { authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getPatients);
router.get("/:id", getPatientById);
router.post("/", authorizeRoles("administrator", "receptionist"), createPatient);
router.put("/:id", authorizeRoles("administrator", "clinician"), updatePatient);
router.delete("/:id", authorizeRoles("administrator"), deletePatient);

export default router;
