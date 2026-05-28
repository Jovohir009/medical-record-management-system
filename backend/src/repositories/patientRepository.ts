import { ResultSetHeader } from "mysql2";
import { db } from "../config/db";

export interface PatientInput {
  full_name: string;
  dob: string;
  gender: "male" | "female" | "other";
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  blood_type?: string | null;
  assigned_doctor_id?: number | null;
  registered_date?: string;
  status?: "active" | "discharged" | "critical";
  insurance_provider?: string | null;
  allergies?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
}

const patientSelect = `
  SELECT
    p.*,
    u.full_name AS assigned_doctor_name
  FROM patients p
  LEFT JOIN doctors d ON d.id = p.assigned_doctor_id
  LEFT JOIN users u ON u.id = d.user_id
`;

export async function getPatients() {
  const [rows] = await db.query(`
    ${patientSelect}
    ORDER BY p.created_at DESC, p.id DESC
  `);

  return rows as any[];
}

export async function getPatientById(id: number) {
  const [rows] = await db.query(
    `
    ${patientSelect}
    WHERE p.id = ?
    LIMIT 1
    `,
    [id]
  );

  return (rows as any[])[0] ?? null;
}

export async function createPatient(input: PatientInput) {
  const [result] = await db.query<ResultSetHeader>(
    `
    INSERT INTO patients
      (full_name, dob, gender, email, phone, address, blood_type, assigned_doctor_id,
       registered_date, status, insurance_provider, allergies, emergency_contact, emergency_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.full_name,
      input.dob,
      input.gender,
      input.email ?? null,
      input.phone ?? null,
      input.address ?? null,
      input.blood_type ?? null,
      input.assigned_doctor_id ?? null,
      input.registered_date ?? new Date().toISOString().slice(0, 10),
      input.status ?? "active",
      input.insurance_provider ?? null,
      input.allergies ?? null,
      input.emergency_contact ?? null,
      input.emergency_phone ?? null,
    ]
  );

  return getPatientById(result.insertId);
}

export async function updatePatient(id: number, input: Partial<PatientInput>) {
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const key of [
    "full_name",
    "dob",
    "gender",
    "email",
    "phone",
    "address",
    "blood_type",
    "assigned_doctor_id",
    "registered_date",
    "status",
    "insurance_provider",
    "allergies",
    "emergency_contact",
    "emergency_phone",
  ] as const) {
    if (input[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(input[key]);
    }
  }

  if (!fields.length) {
    return getPatientById(id);
  }

  values.push(id);
  await db.query(`UPDATE patients SET ${fields.join(", ")} WHERE id = ?`, values);

  return getPatientById(id);
}

export async function deletePatient(id: number) {
  const [result] = await db.query<ResultSetHeader>(
    "DELETE FROM patients WHERE id = ?",
    [id]
  );

  return result.affectedRows > 0;
}
