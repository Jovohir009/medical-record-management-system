import { apiRequest } from "./apiClient";
import { mapDepartment } from "./mappers";

export async function getDepartments() {
  const rows = await apiRequest<any[]>("/departments");
  return rows.map(mapDepartment);
}
