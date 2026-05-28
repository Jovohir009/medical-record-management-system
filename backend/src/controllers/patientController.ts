import { Request, Response } from "express";
import {
  addPatient,
  editPatient,
  getPatient,
  listPatients,
  removePatient,
} from "../services/patientService";

export async function getPatients(_req: Request, res: Response) {
  const patients = await listPatients();
  return res.status(200).json(patients);
}

export async function getPatientById(req: Request, res: Response) {
  const patient = await getPatient(Number(req.params.id));

  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  return res.status(200).json(patient);
}

export async function createPatient(req: Request, res: Response) {
  try {
    const patient = await addPatient(req.body);
    return res.status(201).json(patient);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create patient";
    return res.status(400).json({ message });
  }
}

export async function updatePatient(req: Request, res: Response) {
  try {
    const patient = await editPatient(Number(req.params.id), req.body);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json(patient);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update patient";
    return res.status(400).json({ message });
  }
}

export async function deletePatient(req: Request, res: Response) {
  const deleted = await removePatient(Number(req.params.id));

  if (!deleted) {
    return res.status(404).json({ message: "Patient not found" });
  }

  return res.status(204).send();
}
