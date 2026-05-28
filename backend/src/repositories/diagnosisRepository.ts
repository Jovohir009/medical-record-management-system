import { ResultSetHeader } from "mysql2";
import { db } from "../config/db";

export interface DiagnosisInput {
  patient_id: number;
  doctor_id: number | null;
  icd_code?: string | null;
  condition_name: string;
  severity: "mild" | "moderate" | "severe" | "critical";
  status?: "active" | "resolved" | "monitoring";
  diagnosed_date: string;
  notes?: string | null;
}

const diagnosisSelect = `
  SELECT
    dx.*,
    p.full_name AS patient_name,
    u.full_name AS doctor_name
  FROM diagnoses dx
  JOIN patients p ON p.id = dx.patient_id
  LEFT JOIN doctors d ON d.id = dx.doctor_id
  LEFT JOIN users u ON u.id = d.user_id
`;

export async function getDiagnoses() {
  const [rows] = await db.query(`
    ${diagnosisSelect}
    ORDER BY dx.diagnosed_date DESC, dx.id DESC
  `);

  return rows as any[];
}

export async function getDiagnosisById(id: number) {
  const [rows] = await db.query(
    `
    ${diagnosisSelect}
    WHERE dx.id = ?
    LIMIT 1
    `,
    [id]
  );

  return (rows as any[])[0] ?? null;
}

export async function createDiagnosis(input: DiagnosisInput) {
  const [result] = await db.query<ResultSetHeader>(
    `
    INSERT INTO diagnoses
      (patient_id, doctor_id, icd_code, condition_name, severity, status, diagnosed_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.patient_id,
      input.doctor_id,
      input.icd_code ?? null,
      input.condition_name,
      input.severity,
      input.status ?? "active",
      input.diagnosed_date,
      input.notes ?? null,
    ]
  );

  return getDiagnosisById(result.insertId);
}

export async function updateDiagnosis(
  id: number,
  input: Partial<DiagnosisInput>
) {
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const key of [
    "patient_id",
    "doctor_id",
    "icd_code",
    "condition_name",
    "severity",
    "status",
    "diagnosed_date",
    "notes",
  ] as const) {
    if (input[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(input[key]);
    }
  }

  if (!fields.length) {
    return getDiagnosisById(id);
  }

  values.push(id);
  await db.query(
    `UPDATE diagnoses SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return getDiagnosisById(id);
}

export async function deleteDiagnosis(id: number) {
  const [result] = await db.query<ResultSetHeader>(
    "DELETE FROM diagnoses WHERE id = ?",
    [id]
  );

  return result.affectedRows > 0;
}
