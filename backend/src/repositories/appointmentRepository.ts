import { ResultSetHeader } from "mysql2";
import { db } from "../config/db";

export interface AppointmentInput {
  patient_id: number;
  doctor_id?: number | null;
  created_by_user_id: number;
  appointment_type: "general_practice" | "specialist_consultation";
  appointment_date: string;
  appointment_time: string;
  notes?: string | null;
  status?: "PENDING" | "ACCEPTED" | "DECLINED";
}

const appointmentSelect = `
  SELECT
    a.*,
    p.full_name AS patient_name,
    p.phone AS patient_phone,
    u.full_name AS doctor_name,
    dep.name AS department_name,
    creator.full_name AS created_by_name
  FROM appointments a
  JOIN patients p ON p.id = a.patient_id
  LEFT JOIN doctors d ON d.id = a.doctor_id
  LEFT JOIN users u ON u.id = d.user_id
  LEFT JOIN departments dep ON dep.id = d.department_id
  JOIN users creator ON creator.id = a.created_by_user_id
`;

export async function getAppointments() {
  const [rows] = await db.query(`
    ${appointmentSelect}
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `);

  return rows as any[];
}

export async function getAppointmentsByDoctorId(doctorId: number) {
  const [rows] = await db.query(
    `
    ${appointmentSelect}
    WHERE a.doctor_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `,
    [doctorId]
  );

  return rows as any[];
}

export async function getAppointmentById(id: number) {
  const [rows] = await db.query(
    `
    ${appointmentSelect}
    WHERE a.id = ?
    LIMIT 1
    `,
    [id]
  );

  return (rows as any[])[0] ?? null;
}

export async function createAppointment(input: AppointmentInput) {
  const [result] = await db.query<ResultSetHeader>(
    `
    INSERT INTO appointments
      (patient_id, doctor_id, created_by_user_id, appointment_type,
       appointment_date, appointment_time, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.patient_id,
      input.doctor_id ?? null,
      input.created_by_user_id,
      input.appointment_type,
      input.appointment_date,
      input.appointment_time,
      input.notes ?? null,
      input.status ?? "PENDING",
    ]
  );

  return getAppointmentById(result.insertId);
}

export async function updateAppointment(
  id: number,
  input: Partial<AppointmentInput>
) {
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const key of [
    "patient_id",
    "doctor_id",
    "created_by_user_id",
    "appointment_type",
    "appointment_date",
    "appointment_time",
    "notes",
    "status",
  ] as const) {
    if (input[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(input[key]);
    }
  }

  if (!fields.length) {
    return getAppointmentById(id);
  }

  values.push(id);
  await db.query(
    `UPDATE appointments SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return getAppointmentById(id);
}

export async function getBookedSlots(doctorId: number, date: string) {
  const [rows] = await db.query(
    `
    SELECT TIME_FORMAT(appointment_time, '%H:%i') AS appointment_time
    FROM appointments
    WHERE doctor_id = ?
      AND appointment_date = ?
      AND status IN ('PENDING', 'ACCEPTED')
    ORDER BY appointment_time ASC
    `,
    [doctorId, date]
  );

  return rows as any[];
}

export async function updateAppointmentStatus(
  id: number,
  status: "PENDING" | "ACCEPTED" | "DECLINED"
) {
  await db.query("UPDATE appointments SET status = ? WHERE id = ?", [status, id]);
  return getAppointmentById(id);
}

export async function getDoctorAvailability(doctorId: number, dayOfWeek: string) {
  const [rows] = await db.query(
    `
    SELECT start_time, end_time
    FROM doctor_availability
    WHERE doctor_id = ?
      AND day_of_week = ?
      AND is_available = TRUE
    ORDER BY start_time ASC
    `,
    [doctorId, dayOfWeek]
  );

  return rows as any[];
}
