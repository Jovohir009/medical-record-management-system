import { Patient } from "../types/domain";
import { apiRequest } from "./apiClient";
import { mapPatient } from "./mappers";

export async function getPatients() {
  const rows = await apiRequest<any[]>("/patients");
  return rows.map(mapPatient);
}

export async function getPatient(id: string) {
  const row = await apiRequest<any>(`/patients/${id}`);
  return mapPatient(row);
}

export async function createPatient(payload: Record<string, unknown>) {
  const row = await apiRequest<any>("/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapPatient(row);
}

export async function updatePatient(id: string, payload: Partial<Patient>) {
  const row = await apiRequest<any>(`/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return mapPatient(row);
}

export async function deletePatient(id: string) {
  await apiRequest<void>(`/patients/${id}`, {
    method: "DELETE",
  });
}
