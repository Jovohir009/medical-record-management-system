import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  addReferral,
  changeReferralStatus,
  listPatientReferrals,
  listReferralHistory,
} from "../services/referralService";

export async function getReferralHistory(_req: AuthRequest, res: Response) {
  const referrals = await listReferralHistory();
  return res.status(200).json(referrals);
}

export async function getPatientReferrals(req: AuthRequest, res: Response) {
  const referrals = await listPatientReferrals(Number(req.params.patientId));
  return res.status(200).json(referrals);
}

export async function createReferral(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const referral = await addReferral(req.body, req.user, req.ip);
    return res.status(201).json(referral);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateReferralStatus(req: AuthRequest, res: Response) {
  try {
    const referral = await changeReferralStatus(
      Number(req.params.id),
      req.body.status
    );

    return res.status(200).json(referral);
  } catch (error) {
    return handleError(res, error);
  }
}

function handleError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Referral request failed";
  const statusCode =
    error instanceof Error && "statusCode" in error
      ? Number((error as Error & { statusCode?: number }).statusCode)
      : undefined;

  return res.status(statusCode || 400).json({ message });
}
