import { ResultSetHeader } from "mysql2";
import { db } from "../config/db";

export type ReferralStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface ReferralInput {
  patient_id: number;
  referred_by_user_id: number;
  from_department_id: number;
  to_department_id: number;
  from_doctor_id: number;
  to_doctor_id: number;
  referral_reason: string;
  referral_notes?: string | null;
  status?: ReferralStatus;
  ip_address?: string | null;
}

const referralSelect = `
  SELECT
    r.*,
    p.full_name AS patient_name,
    referred_by.full_name AS referred_by_name,
    from_dep.name AS from_department_name,
    to_dep.name AS to_department_name,
    from_user.full_name AS from_doctor_name,
    to_user.full_name AS to_doctor_name
  FROM referrals r
  JOIN patients p ON p.id = r.patient_id
  JOIN users referred_by ON referred_by.id = r.referred_by_user_id
  JOIN departments from_dep ON from_dep.id = r.from_department_id
  JOIN departments to_dep ON to_dep.id = r.to_department_id
  JOIN doctors from_doctor ON from_doctor.id = r.from_doctor_id
  JOIN users from_user ON from_user.id = from_doctor.user_id
  JOIN doctors to_doctor ON to_doctor.id = r.to_doctor_id
  JOIN users to_user ON to_user.id = to_doctor.user_id
`;

export async function getReferralHistory() {
  const [rows] = await db.query(`
    ${referralSelect}
    ORDER BY r.referral_date DESC, r.referral_id DESC
  `);

  return rows as any[];
}

export async function getReferralsByPatientId(patientId: number) {
  const [rows] = await db.query(
    `
    ${referralSelect}
    WHERE r.patient_id = ?
    ORDER BY r.referral_date DESC, r.referral_id DESC
    `,
    [patientId]
  );

  return rows as any[];
}

export async function getReferralById(id: number) {
  const [rows] = await db.query(
    `
    ${referralSelect}
    WHERE r.referral_id = ?
    LIMIT 1
    `,
    [id]
  );

  return (rows as any[])[0] ?? null;
}

export async function createReferral(input: ReferralInput) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO referrals
        (patient_id, referred_by_user_id, from_department_id, to_department_id,
         from_doctor_id, to_doctor_id, referral_reason, referral_notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.patient_id,
        input.referred_by_user_id,
        input.from_department_id,
        input.to_department_id,
        input.from_doctor_id,
        input.to_doctor_id,
        input.referral_reason,
        input.referral_notes ?? null,
        input.status ?? "COMPLETED",
      ]
    );

    await connection.query(
      "UPDATE patients SET assigned_doctor_id = ? WHERE id = ?",
      [input.to_doctor_id, input.patient_id]
    );

    await connection.query(
      `
      INSERT INTO audit_logs (user_id, action, resource, ip_address)
      VALUES (?, 'CREATE', ?, ?)
      `,
      [
        input.referred_by_user_id,
        `Referral ID ${result.insertId} for Patient ID ${input.patient_id}`,
        input.ip_address ?? null,
      ]
    );

    await connection.commit();
    return getReferralById(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateReferralStatus(id: number, status: ReferralStatus) {
  await db.query("UPDATE referrals SET status = ? WHERE referral_id = ?", [
    status,
    id,
  ]);

  return getReferralById(id);
}
