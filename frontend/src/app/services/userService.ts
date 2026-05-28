import { SystemUser } from "../types/domain";
import { apiRequest } from "./apiClient";
import { mapUser } from "./mappers";

export async function getUsers() {
  const rows = await apiRequest<any[]>("/users");
  return rows.map(mapUser);
}

export async function createUser(payload: Record<string, unknown>) {
  const row = await apiRequest<any>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapUser(row);
}

export async function updateUser(id: string, payload: Partial<SystemUser>) {
  const row = await apiRequest<any>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return mapUser(row);
}

export async function deleteUser(id: string) {
  return apiRequest<void>(`/users/${id}`, {
    method: "DELETE",
  });
}
