import bcrypt from "bcryptjs";
import * as doctorRepository from "../repositories/doctorRepository";

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
}

function normalizeDoctorInput(input: any, includePassword = false) {
  const normalized: any = {
    full_name: input.full_name ?? input.name,
    email: input.email,
    department_id: toNumber(input.department_id ?? input.department),
    specialty: input.specialty,
    license_number: input.license_number ?? input.licenseNumber,
    bio: input.bio ?? null,
    phone: input.phone ?? null,
    status: input.status ?? "active",
    joined_date: input.joined_date ?? input.joinedDate ?? null,
  };

  if (includePassword) {
    normalized.password_hash = input.password_hash;
  }

  return normalized;
}

export async function listDoctors() {
  return doctorRepository.getDoctors();
}

export async function getDoctor(id: number) {
  return doctorRepository.getDoctorById(id);
}

export async function addDoctor(input: any) {
  const password_hash = await bcrypt.hash(input.password || "password", 10);
  const normalized = normalizeDoctorInput({ ...input, password_hash }, true);

  return doctorRepository.createDoctor(normalized);
}

export async function editDoctor(id: number, input: any) {
  const normalized = normalizeDoctorInput(input);

  if (input.password) {
    normalized.password_hash = await bcrypt.hash(input.password, 10);
  }

  Object.keys(normalized).forEach((key) => {
    if (normalized[key] === undefined) {
      delete normalized[key];
    }
  });

  return doctorRepository.updateDoctor(id, normalized);
}

export async function removeDoctor(id: number) {
  return doctorRepository.deleteDoctor(id);
}
