import { ResultSetHeader } from "mysql2";
import { db } from "../config/db";

export interface UserInput {
  full_name: string;
  email: string;
  password_hash?: string;
  role: "administrator" | "clinician" | "receptionist";
  status?: "active" | "inactive";
}

export async function findUserByEmail(email: string) {
  const [rows] = await db.query(
    `
    SELECT id, full_name, email, password_hash, role, status
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [email]
  );

  return (rows as any[])[0] ?? null;
}

export async function findUserById(id: number) {
  const [rows] = await db.query(
    `
    SELECT id, full_name, email, role, status, last_login, created_at, updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return (rows as any[])[0] ?? null;
}

export async function getUsers() {
  const [rows] = await db.query(`
    SELECT id, full_name, email, role, status, last_login, created_at, updated_at
    FROM users
    ORDER BY created_at DESC, id DESC
  `);

  return rows as any[];
}

export async function createUser(input: Required<UserInput>) {
  const [result] = await db.query<ResultSetHeader>(
    `
    INSERT INTO users (full_name, email, password_hash, role, status)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      input.full_name,
      input.email,
      input.password_hash,
      input.role,
      input.status ?? "active",
    ]
  );

  return findUserById(result.insertId);
}

export async function updateUser(
  id: number,
  input: Partial<UserInput>
) {
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const key of ["full_name", "email", "password_hash", "role", "status"] as const) {
    if (input[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(input[key]);
    }
  }

  if (!fields.length) {
    return findUserById(id);
  }

  values.push(id);
  await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

  return findUserById(id);
}

export async function updateLastLogin(id: number) {
  await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [id]);
}

export async function deleteUser(id: number) {
  const [result] = await db.query<ResultSetHeader>(
    "DELETE FROM users WHERE id = ?",
    [id]
  );

  return result.affectedRows > 0;
}
