import * as appointmentRepository from "../repositories/appointmentRepository";
import * as doctorRepository from "../repositories/doctorRepository";
import type { AuthenticatedUser } from "../middleware/authMiddleware";

type AppointmentStatus = "PENDING" | "ACCEPTED" | "DECLINED";

function httpError(message: string, statusCode = 400) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
}

function normalizeStatus(value: unknown): AppointmentStatus | undefined {
  if (!value) return undefined;

  const status = String(value).toUpperCase();
  if (status === "PENDING" || status === "ACCEPTED" || status === "DECLINED") {
    return status;
  }

  return undefined;
}

function normalizeTime(value: string) {
  if (!value) return value;

  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;

  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) return value;

  let hour = Number(match[1]);
  const minute = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}:00`;
}

function normalizeAppointmentInput(input: any, createdByUserId: number) {
  return {
    patient_id: Number(input.patient_id ?? input.patientId),
    doctor_id:
      input.doctor_id || input.doctorId
        ? Number(input.doctor_id ?? input.doctorId)
        : null,
    created_by_user_id: createdByUserId,
    appointment_type:
      input.appointment_type ??
      input.appointmentType ??
      "general_practice",
    appointment_date: input.appointment_date ?? input.appointmentDate,
    appointment_time: normalizeTime(
      input.appointment_time ?? input.appointmentTime
    ),
    notes: input.notes ?? null,
    status: normalizeStatus(input.status) ?? "PENDING",
  };
}

export async function listAppointments(user?: AuthenticatedUser) {
  if (user?.role === "clinician") {
    const doctor = await doctorRepository.getDoctorByUserId(user.id);
    if (!doctor) return [];

    return appointmentRepository.getAppointmentsByDoctorId(Number(doctor.id));
  }

  return appointmentRepository.getAppointments();
}

export async function addAppointment(input: any, createdByUserId: number) {
  const normalized = normalizeAppointmentInput(input, createdByUserId);
  normalized.status = "PENDING";

  if (!normalized.patient_id || !normalized.doctor_id) {
    throw httpError("Patient and doctor are required");
  }

  if (!normalized.appointment_date || !normalized.appointment_time) {
    throw httpError("Appointment date and time are required");
  }

  return appointmentRepository.createAppointment(normalized as any);
}

export async function editAppointment(
  id: number,
  input: any,
  _createdByUserId: number
) {
  const normalized: any = {};

  if (input.patient_id !== undefined || input.patientId !== undefined) {
    normalized.patient_id = Number(input.patient_id ?? input.patientId);
  }

  if (input.doctor_id !== undefined || input.doctorId !== undefined) {
    const value = input.doctor_id ?? input.doctorId;
    normalized.doctor_id = value === "" || value === null ? null : Number(value);
  }

  if (input.appointment_type !== undefined || input.appointmentType !== undefined) {
    normalized.appointment_type = input.appointment_type ?? input.appointmentType;
  }

  if (input.appointment_date !== undefined || input.appointmentDate !== undefined) {
    normalized.appointment_date = input.appointment_date ?? input.appointmentDate;
  }

  if (input.appointment_time !== undefined || input.appointmentTime !== undefined) {
    normalized.appointment_time = normalizeTime(input.appointment_time ?? input.appointmentTime);
  }

  if (input.notes !== undefined) {
    normalized.notes = input.notes ?? null;
  }

  if (input.status !== undefined) {
    const status = normalizeStatus(input.status);
    if (!status) throw httpError("Invalid appointment status");
    normalized.status = status;
  }

  return appointmentRepository.updateAppointment(id, normalized);
}

export async function updateAppointmentStatus(
  id: number,
  statusValue: unknown,
  user: AuthenticatedUser
) {
  const status = normalizeStatus(statusValue);

  if (!status || status === "PENDING") {
    throw httpError("Appointment status must be ACCEPTED or DECLINED");
  }

  const appointment = await appointmentRepository.getAppointmentById(id);

  if (!appointment) {
    throw httpError("Appointment not found", 404);
  }

  if (user.role === "receptionist") {
    throw httpError("Receptionists cannot approve appointments", 403);
  }

  if (user.role === "clinician") {
    const doctor = await doctorRepository.getDoctorByUserId(user.id);

    if (!doctor || Number(appointment.doctor_id) !== Number(doctor.id)) {
      throw httpError("You can only update appointments assigned to you", 403);
    }
  }

  return appointmentRepository.updateAppointmentStatus(id, status);
}

export async function getAvailableSlots(doctorId: number, date: string) {
  const dayOfWeek = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
  });
  const availability = await appointmentRepository.getDoctorAvailability(
    doctorId,
    dayOfWeek
  );
  const bookedRows = await appointmentRepository.getBookedSlots(doctorId, date);
  const booked = new Set(bookedRows.map((row) => row.appointment_time));

  const slots: string[] = [];

  for (const window of availability) {
    let cursor = toMinutes(window.start_time);
    const end = toMinutes(window.end_time);

    while (cursor < end) {
      const value = fromMinutes(cursor);

      if (!booked.has(value)) {
        slots.push(value);
      }

      cursor += 30;
    }
  }

  return slots;
}

function toMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function fromMinutes(value: number) {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
