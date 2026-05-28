import { Doctor } from "../types/domain";
import { apiRequest } from "./apiClient";
import { mapDoctor } from "./mappers";

export async function getDoctors() {
  const rows = await apiRequest<any[]>("/doctors");
  return rows.map(mapDoctor);
}

export async function getDoctor(id: string) {
  const row = await apiRequest<any>(`/doctors/${id}`);
  return mapDoctor(row);
}

export async function createDoctor(payload: Record<string, unknown>) {
  const row = await apiRequest<any>("/doctors", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapDoctor(row);
}

export async function updateDoctor(id: string, payload: Partial<Doctor>) {
  const row = await apiRequest<any>(`/doctors/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return mapDoctor(row);
}

export async function deleteDoctor(id: string) {
  await apiRequest<void>(`/doctors/${id}`, {
    method: "DELETE",
  });
}
