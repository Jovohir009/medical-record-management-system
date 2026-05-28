import { Router } from "express";
import {
  getAdminDashboardData,
  getAuditLogData,
} from "../controllers/dashboardController";

const router = Router();

router.get("/admin", getAdminDashboardData);
router.get("/audit-logs", getAuditLogData);

export default router;
