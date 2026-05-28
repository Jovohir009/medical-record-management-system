import { Request, Response } from "express";
import {
  addDoctor,
  editDoctor,
  getDoctor,
  listDoctors,
  removeDoctor,
} from "../services/doctorService";

export async function getDoctors(_req: Request, res: Response) {
  const doctors = await listDoctors();
  return res.status(200).json(doctors);
}

export async function getDoctorById(req: Request, res: Response) {
  const doctor = await getDoctor(Number(req.params.id));

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  return res.status(200).json(doctor);
}

export async function createDoctor(req: Request, res: Response) {
  try {
    const doctor = await addDoctor(req.body);
    return res.status(201).json(doctor);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateDoctor(req: Request, res: Response) {
  try {
    const doctor = await editDoctor(Number(req.params.id), req.body);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.status(200).json(doctor);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteDoctor(req: Request, res: Response) {
  const deleted = await removeDoctor(Number(req.params.id));

  if (!deleted) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  return res.status(204).send();
}

function handleError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed";

  if (message.includes("Duplicate")) {
    return res.status(409).json({ message: "A doctor or user with this value already exists" });
  }

  return res.status(400).json({ message });
}
