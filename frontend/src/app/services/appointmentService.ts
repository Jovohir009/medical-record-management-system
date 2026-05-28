import { Appointment } from "../types/domain";
import { apiRequest } from "./apiClient";
import { mapAppointment } from "./mappers";

export async function getAppointments() {
  const rows = await apiRequest<any[]>("/appointments");
  return rows.map(mapAppointment);
}

export async function createAppointment(payload: Record<string, unknown>) {
  const row = await apiRequest<any>("/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapAppointment(row);
}

export async function updateAppointment(
  id: string,
  payload: Partial<Appointment>,
) {
  const row = await apiRequest<any>(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return mapAppointment(row);
}

export async function updateAppointmentStatus(
  id: string,
  status: "ACCEPTED" | "DECLINED",
) {
  const row = await apiRequest<any>(`/appointments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return mapAppointment(row);
}

export async function getAvailableSlots(doctorId: string, date: string) {
  const data = await apiRequest<{ slots: string[] }>(
    `/appointments/available-slots?doctorId=${encodeURIComponent(
      doctorId,
    )}&date=${encodeURIComponent(date)}`,
  );

  return data.slots;
}
