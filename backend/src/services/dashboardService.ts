import {
  getAdminStats,
  getAuditLogs,
  getMonthlyPatientFlow,
  getPatientsByDepartment,
} from "../repositories/dashboardRepository";

export async function getAdminDashboard() {
  const [stats, admissionsChartData, departmentChartData, auditLogs] =
    await Promise.all([
      getAdminStats(),
      getMonthlyPatientFlow(),
      getPatientsByDepartment(),
      getAuditLogs(10),
    ]);

  return {
    stats,
    admissionsChartData,
    departmentChartData,
    auditLogs,
  };
}

export async function listAuditLogs(limit?: number) {
  return getAuditLogs(limit);
}
