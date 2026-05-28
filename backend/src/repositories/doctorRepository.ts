import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import { db } from "../config/db";

export interface DoctorInput {
  full_name: string;
  email: string;
  password_hash: string;
  department_id: number;
  specialty: string;
  license_number: string;
  bio?: string | null;
  phone?: string | null;
  status?: "active" | "inactive" | "on-leave";
  joined_date?: string | null;
}

const doctorSelect = `
  SELECT
    d.id,
    d.user_id,
    u.full_name,
    u.email,
    d.department_id,
    dep.name AS department_name,
    d.specialty,
    d.license_number,
    d.bio,
    d.phone,
    d.status,
    d.joined_date,
    d.created_at,
    d.updated_at,
    COUNT(p.id) AS patients_count
  FROM doctors d
  JOIN users u ON u.id = d.user_id
  JOIN departments dep ON dep.id = d.department_id
  LEFT JOIN patients p ON p.assigned_doctor_id = d.id
`;

export async function getDoctors() {
  const [rows] = await db.query(`
    ${doctorSelect}
    GROUP BY d.id, d.user_id, u.full_name, u.email, d.department_id, dep.name,
      d.specialty, d.license_number, d.bio, d.phone, d.status, d.joined_date,
      d.created_at, d.updated_at
    ORDER BY u.full_name ASC
  `);

  return rows as any[];
}

export async function getDoctorById(id: number) {
  const [rows] = await db.query(
    `
    ${doctorSelect}
    WHERE d.id = ?
    GROUP BY d.id, d.user_id, u.full_name, u.email, d.department_id, dep.name,
      d.specialty, d.license_number, d.bio, d.phone, d.status, d.joined_date,
      d.created_at, d.updated_at
    LIMIT 1
    `,
    [id]
  );

  return (rows as any[])[0] ?? null;
}

export async function getDoctorByUserId(userId: number) {
  const [rows] = await db.query(
    `
    ${doctorSelect}
    WHERE d.user_id = ?
    GROUP BY d.id, d.user_id, u.full_name, u.email, d.department_id, dep.name,
      d.specialty, d.license_number, d.bio, d.phone, d.status, d.joined_date,
      d.created_at, d.updated_at
    LIMIT 1
    `,
    [userId]
  );

  return (rows as any[])[0] ?? null;
}

export async function createDoctor(input: DoctorInput) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const userId = await insertDoctorUser(connection, input);
    const [doctorResult] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO doctors
        (user_id, department_id, specialty, license_number, bio, phone, status, joined_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        input.department_id,
        input.specialty,
        input.license_number,
        input.bio ?? null,
        input.phone ?? null,
        input.status ?? "active",
        input.joined_date ?? new Date().toISOString().slice(0, 10),
      ]
    );

    await connection.commit();
    return getDoctorById(doctorResult.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function insertDoctorUser(
  connection: PoolConnection,
  input: DoctorInput
) {
  const [userResult] = await connection.query<ResultSetHeader>(
    `
    INSERT INTO users (full_name, email, password_hash, role, status)
    VALUES (?, ?, ?, 'clinician', 'active')
    `,
    [input.full_name, input.email, input.password_hash]
  );

  return userResult.insertId;
}

export async function updateDoctor(id: number, input: Partial<DoctorInput>) {
  const existing = await getDoctorById(id);

  if (!existing) {
    return null;
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userFields: string[] = [];
    const userValues: unknown[] = [];

    if (input.full_name !== undefined) {
      userFields.push("full_name = ?");
      userValues.push(input.full_name);
    }

    if (input.email !== undefined) {
      userFields.push("email = ?");
      userValues.push(input.email);
    }

    if (input.password_hash !== undefined) {
      userFields.push("password_hash = ?");
      userValues.push(input.password_hash);
    }

    if (userFields.length) {
      userValues.push(existing.user_id);
      await connection.query(
        `UPDATE users SET ${userFields.join(", ")} WHERE id = ?`,
        userValues
      );
    }

    const doctorFields: string[] = [];
    const doctorValues: unknown[] = [];

    for (const key of [
      "department_id",
      "specialty",
      "license_number",
      "bio",
      "phone",
      "status",
      "joined_date",
    ] as const) {
      if (input[key] !== undefined) {
        doctorFields.push(`${key} = ?`);
        doctorValues.push(input[key]);
      }
    }

    if (doctorFields.length) {
      doctorValues.push(id);
      await connection.query(
        `UPDATE doctors SET ${doctorFields.join(", ")} WHERE id = ?`,
        doctorValues
      );
    }

    await connection.commit();
    return getDoctorById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteDoctor(id: number) {
  const doctor = await getDoctorById(id);

  if (!doctor) {
    return false;
  }

  const [result] = await db.query<ResultSetHeader>(
    "DELETE FROM users WHERE id = ?",
    [doctor.user_id]
  );

  return result.affectedRows > 0;
}
