import { db } from "../config/db";

export async function getDepartments() {
  const [rows] = await db.query(`
    SELECT
      dep.id,
      dep.name,
      dep.location,
      dep.phone,
      dep.email,
      dep.description,
      dep.color,
      COUNT(d.id) AS doctor_count,
      MIN(u.full_name) AS head
    FROM departments dep
    LEFT JOIN doctors d ON d.department_id = dep.id
    LEFT JOIN users u ON u.id = d.user_id
    GROUP BY dep.id, dep.name, dep.location, dep.phone, dep.email, dep.description, dep.color
    ORDER BY dep.name ASC
  `);

  return rows as any[];
}
