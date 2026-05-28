import * as patientRepository from "../repositories/patientRepository";

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
}

function normalizeGender(value: string) {
  return value.toLowerCase() as "male" | "female" | "other";
}

function normalizePatientInput(input: any, withDefaults = true) {
  const addressParts = [input.address, input.city, input.state, input.zip].filter(Boolean);
  const gender = input.gender ? normalizeGender(input.gender) : withDefaults ? "other" : undefined;

  return {
    full_name:
      input.full_name ??
      input.name ??
      [input.firstName, input.lastName].filter(Boolean).join(" "),
    dob: input.dob,
    gender,
    email: input.email ?? null,
    phone: input.phone ?? null,
    address: addressParts.length ? addressParts.join(", ") : input.address ?? null,
    blood_type: input.blood_type ?? input.bloodType ?? null,
    assigned_doctor_id: toNumber(
      input.assigned_doctor_id ?? input.assignedDoctorId
    ),
    registered_date:
      input.registered_date ??
      input.registeredDate ??
      (withDefaults ? new Date().toISOString().slice(0, 10) : undefined),
    status: input.status ?? (withDefaults ? "active" : undefined),
    insurance_provider:
      input.insurance_provider ?? input.insuranceProvider ?? null,
    allergies: input.allergies ?? null,
    emergency_contact:
      input.emergency_contact ?? input.emergencyContact ?? null,
    emergency_phone: input.emergency_phone ?? input.emergencyPhone ?? null,
  };
}

export async function listPatients() {
  return patientRepository.getPatients();
}

export async function getPatient(id: number) {
  return patientRepository.getPatientById(id);
}

export async function addPatient(input: any) {
  return patientRepository.createPatient(
    normalizePatientInput(input) as patientRepository.PatientInput
  );
}

export async function editPatient(id: number, input: any) {
  const normalized: any = normalizePatientInput(input, false);

  Object.keys(normalized).forEach((key) => {
    if (normalized[key] === undefined || normalized[key] === "") {
      delete normalized[key];
    }
  });

  return patientRepository.updatePatient(id, normalized);
}

export async function removePatient(id: number) {
  return patientRepository.deletePatient(id);
}
