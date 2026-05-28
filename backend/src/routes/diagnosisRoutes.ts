import { Router } from "express";
import {
  createDiagnosis,
  deleteDiagnosis,
  getDiagnosisById,
  getDiagnoses,
  updateDiagnosis,
} from "../controllers/diagnosisController";
import { authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getDiagnoses);
router.get("/:id", getDiagnosisById);
router.post("/", authorizeRoles("administrator"), createDiagnosis);
router.put("/:id", authorizeRoles("administrator", "clinician"), updateDiagnosis);
router.delete("/:id", authorizeRoles("administrator"), deleteDiagnosis);

export default router;
