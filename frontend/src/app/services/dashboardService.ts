import { AdminDashboardData } from "../types/domain";
import { apiRequest } from "./apiClient";
import { mapAuditLog } from "./mappers";

export async function getAdminDashboard() {
  const data = await apiRequest<any>("/dashboard/admin");

  return {
    stats: data.stats,
    admissionsChartData: data.admissionsChartData.map((item: any) => ({
      month: item.month,
      admissions: Number(item.admissions),
      discharges: Number(item.discharges),
    })),
    departmentChartData: data.departmentChartData.map((item: any) => ({
      name: item.name,
      patients: Number(item.patients),
    })),
    auditLogs: data.auditLogs.map(mapAuditLog),
  } satisfies AdminDashboardData;
}
