import { Request, Response } from "express";
import { listDepartments } from "../services/departmentService";

export async function getDepartments(_req: Request, res: Response) {
  const departments = await listDepartments();
  return res.status(200).json(departments);
}
