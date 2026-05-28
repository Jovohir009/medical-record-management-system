import { Request, Response } from "express";
import {
  addDiagnosis,
  editDiagnosis,
  getDiagnosis,
  listDiagnoses,
  removeDiagnosis,
} from "../services/diagnosisService";

export async function getDiagnoses(_req: Request, res: Response) {
  const diagnoses = await listDiagnoses();
  return res.status(200).json(diagnoses);
}

export async function getDiagnosisById(req: Request, res: Response) {
  const diagnosis = await getDiagnosis(Number(req.params.id));

  if (!diagnosis) {
    return res.status(404).json({ message: "Diagnosis not found" });
  }

  return res.status(200).json(diagnosis);
}

export async function createDiagnosis(req: Request, res: Response) {
  try {
    const diagnosis = await addDiagnosis(req.body);
    return res.status(201).json(diagnosis);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create diagnosis";
    return res.status(400).json({ message });
  }
}

export async function updateDiagnosis(req: Request, res: Response) {
  try {
    const diagnosis = await editDiagnosis(Number(req.params.id), req.body);

    if (!diagnosis) {
      return res.status(404).json({ message: "Diagnosis not found" });
    }

    return res.status(200).json(diagnosis);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update diagnosis";
    return res.status(400).json({ message });
  }
}

export async function deleteDiagnosis(req: Request, res: Response) {
  const deleted = await removeDiagnosis(Number(req.params.id));

  if (!deleted) {
    return res.status(404).json({ message: "Diagnosis not found" });
  }

  return res.status(204).send();
}
