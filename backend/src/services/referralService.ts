import type { AuthenticatedUser } from "../middleware/authMiddleware";
import * as doctorRepository from "../repositories/doctorRepository";
import * as patientRepository from "../repositories/patientRepository";
import * as referralRepository from "../repositories/referralRepository";
import type { ReferralStatus } from "../repositories/referralRepository";

function httpError(message: string, statusCode = 400) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
}

function toRequiredNumber(value: unknown, label: string) {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw httpError(`${label} is required`);
  }

  return numberValue;
}

function normalizeStatus(value: unknown): ReferralStatus | undefined {
  if (!value) return undefined;

  const status = String(value).toUpperCase();
  if (status === "PENDING" || status === "COMPLETED" || status === "CANCELLED") {
    return status;
  }

  return undefined;
}

function normalizeReferralInput(input: any, user: AuthenticatedUser, ip?: string) {
  const reason = String(input.referral_reason ?? input.referralReason ?? "").trim();
  const notes = input.referral_notes ?? input.referralNotes;

  if (!reason) {
    throw httpError("Referral reason is required");
  }

  return {
    patient_id: toRequiredNumber(input.patient_id ?? input.patientId, "Patient"),
    referred_by_user_id: user.id,
    from_department_id: toRequiredNumber(
      input.from_department_id ?? input.fromDepartmentId,
      "Current department"
    ),
    to_department_id: toRequiredNumber(
      input.to_department_id ?? input.toDepartmentId,
      "Target department"
    ),
    from_doctor_id: toRequiredNumber(
      input.from_doctor_id ?? input.fromDoctorId,
      "Current doctor"
    ),
    to_doctor_id: toRequiredNumber(
      input.to_doctor_id ?? input.toDoctorId,
      "Target doctor"
    ),
    referral_reason: reason,
    referral_notes: notes ? String(notes).trim() : null,
    status: normalizeStatus(input.status) ?? "COMPLETED",
    ip_address: ip ?? null,
  };
}

export async function listReferralHistory() {
  return referralRepository.getReferralHistory();
}

export async function listPatientReferrals(patientId: number) {
  return referralRepository.getReferralsByPatientId(patientId);
}

export async function addReferral(
  input: any,
  user: AuthenticatedUser,
  ip?: string
) {
  const normalized = normalizeReferralInput(input, user, ip);

  if (normalized.from_doctor_id === normalized.to_doctor_id) {
    throw httpError("Target doctor must be different from the current doctor");
  }

  const [patient, fromDoctor, toDoctor] = await Promise.all([
    patientRepository.getPatientById(normalized.patient_id),
    doctorRepository.getDoctorById(normalized.from_doctor_id),
    doctorRepository.getDoctorById(normalized.to_doctor_id),
  ]);

  if (!patient) {
    throw httpError("Patient not found", 404);
  }

  if (!fromDoctor) {
    throw httpError("Current doctor not found", 404);
  }

  if (!toDoctor) {
    throw httpError("Target doctor not found", 404);
  }

  if (Number(patient.assigned_doctor_id) !== normalized.from_doctor_id) {
    throw httpError("Current doctor must match the patient's assigned doctor");
  }

  if (Number(fromDoctor.department_id) !== normalized.from_department_id) {
    throw httpError("Current doctor does not belong to the selected current department");
  }

  if (Number(toDoctor.department_id) !== normalized.to_department_id) {
    throw httpError("Target doctor does not belong to the selected target department");
  }

  if (toDoctor.status !== "active") {
    throw httpError("Target doctor must be active");
  }

  return referralRepository.createReferral(normalized);
}

export async function changeReferralStatus(id: number, statusValue: unknown) {
  const status = normalizeStatus(statusValue);

  if (!status) {
    throw httpError("Invalid referral status");
  }

  const referral = await referralRepository.getReferralById(id);

  if (!referral) {
    throw httpError("Referral not found", 404);
  }

  return referralRepository.updateReferralStatus(id, status);
}
