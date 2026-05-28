import { db } from "../config/db";

export async function getAuditLogs(limit = 10) {
  const [rows] = await db.query(
    `
    SELECT
      al.id,
      al.user_id,
      COALESCE(u.full_name, 'System') AS user,
      COALESCE(u.role, 'system') AS role,
      al.action,
      al.resource,
      al.ip_address,
      al.created_at
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.user_id
    ORDER BY al.created_at DESC, al.id DESC
    LIMIT ?
    `,
    [limit]
  );

  return rows as any[];
}

export async function getAdminStats() {
  const [rows] = await db.query(`
    SELECT
      (SELECT COUNT(1) FROM patients) AS total_patients,
      (SELECT COUNT(1) FROM doctors WHERE status = 'active') AS active_doctors,
      (SELECT COUNT(1) FROM diagnoses WHERE status = 'active') AS active_diagnoses,
      (SELECT COUNT(1) FROM patients WHERE status = 'critical') AS critical_cases
  `);

  return (rows as any[])[0];
}

export async function getMonthlyPatientFlow() {
  const [rows] = await db.query(`
    SELECT
      DATE_FORMAT(months.month_start, '%b') AS month,
      COALESCE(admissions.count, 0) AS admissions,
      COALESCE(discharges.count, 0) AS discharges
    FROM (
      SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 MONTH), '%Y-%m-01') AS month_start
      UNION ALL SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
      UNION ALL SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 MONTH), '%Y-%m-01')
      UNION ALL SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-01')
      UNION ALL SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m-01')
      UNION ALL SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')
      UNION ALL SELECT DATE_FORMAT(CURDATE(), '%Y-%m-01')
    ) months
    LEFT JOIN (
      SELECT DATE_FORMAT(registered_date, '%Y-%m-01') AS month_start, COUNT(1) AS count
      FROM patients
      GROUP BY DATE_FORMAT(registered_date, '%Y-%m-01')
    ) admissions ON admissions.month_start = months.month_start
    LEFT JOIN (
      SELECT DATE_FORMAT(updated_at, '%Y-%m-01') AS month_start, COUNT(1) AS count
      FROM patients
      WHERE status = 'discharged'
      GROUP BY DATE_FORMAT(updated_at, '%Y-%m-01')
    ) discharges ON discharges.month_start = months.month_start
  `);

  return rows as any[];
}

export async function getPatientsByDepartment() {
  const [rows] = await db.query(`
    SELECT dep.name, COUNT(p.id) AS patients
    FROM departments dep
    LEFT JOIN doctors d ON d.department_id = dep.id
    LEFT JOIN patients p ON p.assigned_doctor_id = d.id AND p.status != 'discharged'
    GROUP BY dep.id, dep.name
    ORDER BY patients DESC, dep.name ASC
  `);

  return rows as any[];
}
