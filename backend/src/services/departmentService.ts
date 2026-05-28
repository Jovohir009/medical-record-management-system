import { getDepartments } from "../repositories/departmentRepository";

export async function listDepartments() {
  return getDepartments();
}
