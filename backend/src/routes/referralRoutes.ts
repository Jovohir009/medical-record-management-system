import { Router } from "express";
import {
  createReferral,
  getPatientReferrals,
  getReferralHistory,
  updateReferralStatus,
} from "../controllers/referralController";
import { authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

const referralRoles = ["administrator", "clinician", "receptionist"] as const;

router.get("/history", getReferralHistory);
router.get("/patient/:patientId", getPatientReferrals);
router.post("/", authorizeRoles(...referralRoles), createReferral);
router.patch("/:id/status", authorizeRoles(...referralRoles), updateReferralStatus);

export default router;
