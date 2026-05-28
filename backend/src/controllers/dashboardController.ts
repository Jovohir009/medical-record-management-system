import { Request, Response } from "express";
import { getAdminDashboard, listAuditLogs } from "../services/dashboardService";

export async function getAdminDashboardData(_req: Request, res: Response) {
  const dashboard = await getAdminDashboard();
  return res.status(200).json(dashboard);
}

export async function getAuditLogData(req: Request, res: Response) {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const logs = await listAuditLogs(limit);
  return res.status(200).json(logs);
}
