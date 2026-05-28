import { Diagnosis } from "../types/domain";
import { apiRequest } from "./apiClient";
import { mapDiagnosis } from "./mappers";

export async function getDiagnoses() {
  const rows = await apiRequest<any[]>("/diagnoses");
  return rows.map(mapDiagnosis);
}

export async function getDiagnosis(id: string) {
  const row = await apiRequest<any>(`/diagnoses/${id}`);
  return mapDiagnosis(row);
}

export async function createDiagnosis(payload: Record<string, unknown>) {
  const row = await apiRequest<any>("/diagnoses", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapDiagnosis(row);
}

export async function updateDiagnosis(id: string, payload: Partial<Diagnosis>) {
  const row = await apiRequest<any>(`/diagnoses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return mapDiagnosis(row);
}

export async function deleteDiagnosis(id: string) {
  await apiRequest<void>(`/diagnoses/${id}`, {
    method: "DELETE",
  });
}
