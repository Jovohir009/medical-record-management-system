import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  addAppointment,
  editAppointment,
  getAvailableSlots,
  listAppointments,
  updateAppointmentStatus as changeAppointmentStatus,
} from "../services/appointmentService";

export async function getAppointments(req: AuthRequest, res: Response) {
  const appointments = await listAppointments(req.user);
  return res.status(200).json(appointments);
}

export async function createAppointment(req: AuthRequest, res: Response) {
  try {
    const appointment = await addAppointment(req.body, req.user?.id ?? 0);
    return res.status(201).json(appointment);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateAppointment(req: AuthRequest, res: Response) {
  try {
    const appointment = await editAppointment(
      Number(req.params.id),
      req.body,
      req.user?.id ?? 0
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateAppointmentStatus(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const appointment = await changeAppointmentStatus(
      Number(req.params.id),
      req.body.status,
      req.user
    );

    return res.status(200).json(appointment);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getAvailableAppointmentSlots(req: Request, res: Response) {
  const doctorId = Number(req.query.doctorId);
  const date = String(req.query.date ?? "");

  if (!doctorId || !date) {
    return res.status(400).json({ message: "doctorId and date are required" });
  }

  const slots = await getAvailableSlots(doctorId, date);
  return res.status(200).json({ slots });
}

export async function getReceptionistDashboardData(_req: Request, res: Response) {
  const appointments = await listAppointments();
  const today = new Date().toISOString().slice(0, 10);
  const todayAppointments = appointments.filter((appointment) => {
    const value = appointment.appointment_date instanceof Date
      ? appointment.appointment_date.toISOString().slice(0, 10)
      : String(appointment.appointment_date).slice(0, 10);

    return value === today;
  });

  return res.status(200).json({
    todayAppointments,
    totals: {
      today: todayAppointments.length,
      accepted: todayAppointments.filter((a) => a.status === "ACCEPTED").length,
      pending: todayAppointments.filter((a) => a.status === "PENDING").length,
    },
  });
}

function handleError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Unable to save appointment";
  const statusCode =
    error instanceof Error && "statusCode" in error
      ? Number((error as Error & { statusCode?: number }).statusCode)
      : undefined;

  if (message.includes("Duplicate")) {
    return res.status(409).json({ message: "This doctor already has an appointment at that time" });
  }

  return res.status(statusCode || 400).json({ message });
}
