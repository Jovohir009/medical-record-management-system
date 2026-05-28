import {
  Appointment,
  AuditLog,
  Department,
  Diagnosis,
  Doctor,
  Patient,
  SystemUser,
} from "../types/domain";

const colors = [
  "#0EA5E9",
  "#0D9488",
  "#8B5CF6",
  "#F59E0B",
  "#10B981",
  "#EC4899",
  "#F97316",
  "#64748B",
];

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function dateOnly(value: unknown) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export function timeOnly(value: unknown) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

export function mapDoctor(row: any, index = 0): Doctor {
  return {
    id: String(row.id),
    userId: Number(row.user_id),
    name: row.full_name ?? "",
    specialty: row.specialty ?? "",
    department: String(row.department_id ?? ""),
    departmentName: row.department_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    status: row.status ?? "active",
    initials: initials(row.full_name),
    avatarColor: colors[index % colors.length],
    patientsCount: Number(row.patients_count ?? 0),
    joinedDate: dateOnly(row.joined_date),
    licenseNumber: row.license_number ?? "",
    bio: row.bio ?? "",
  };
}

export function mapDepartment(row: any): Department {
  return {
    id: String(row.id),
    name: row.name ?? "",
    head: row.head ?? "Unassigned",
    doctorCount: Number(row.doctor_count ?? 0),
    location: row.location ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    description: row.description ?? "",
    color: row.color ?? "#0EA5E9",
  };
}

export function mapPatient(row: any): Patient {
  const gender =
    row.gender === "female" ? "Female" : row.gender === "other" ? "Other" : "Male";
  const allergyText = row.allergies ?? "";

  return {
    id: String(row.id),
    name: row.full_name ?? "",
    dob: dateOnly(row.dob),
    gender,
    email: row.email ?? "",
    phone: row.phone ?? "",
    address: row.address ?? "",
    bloodType: row.blood_type ?? "",
    assignedDoctorId: row.assigned_doctor_id ? String(row.assigned_doctor_id) : "",
    assignedDoctorName: row.assigned_doctor_name ?? "",
    registeredDate: dateOnly(row.registered_date),
    status: row.status ?? "active",
    insuranceProvider: row.insurance_provider ?? "",
    allergies: allergyText && allergyText.toLowerCase() !== "none"
      ? allergyText.split(",").map((item: string) => item.trim()).filter(Boolean)
      : [],
    emergencyContact: row.emergency_contact ?? "",
    emergencyPhone: row.emergency_phone ?? "",
  };
}

export function mapDiagnosis(row: any): Diagnosis {
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    doctorId: row.doctor_id ? String(row.doctor_id) : "",
    patientName: row.patient_name ?? "",
    doctorName: row.doctor_name ?? "",
    icdCode: row.icd_code ?? "",
    conditionName: row.condition_name ?? "",
    severity: row.severity,
    status: row.status,
    diagnosedDate: dateOnly(row.diagnosed_date),
    notes: row.notes ?? "",
  };
}

export function mapUser(row: any, index = 0): SystemUser {
  return {
    id: String(row.id),
    name: row.full_name ?? "",
    email: row.email ?? "",
    role: row.role,
    status: row.status ?? "active",
    lastLogin: row.last_login ?? row.updated_at ?? row.created_at ?? "",
    createdDate: dateOnly(row.created_at),
    initials: initials(row.full_name),
    avatarColor: colors[index % colors.length],
  };
}

export function mapAppointment(row: any): Appointment {
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    patientName: row.patient_name ?? "",
    patientPhone: row.patient_phone ?? "",
    doctorId: row.doctor_id ? String(row.doctor_id) : "",
    doctorName: row.doctor_name ?? "Unassigned",
    departmentName: row.department_name ?? "",
    createdByUserId: Number(row.created_by_user_id),
    createdByName: row.created_by_name ?? "",
    appointmentType: row.appointment_type,
    appointmentDate: dateOnly(row.appointment_date),
    appointmentTime: timeOnly(row.appointment_time),
    notes: row.notes ?? "",
    status: row.status ?? "PENDING",
  };
}

export function mapAuditLog(row: any): AuditLog {
  return {
    id: String(row.id),
    user: row.user ?? "System",
    role: row.role ?? "system",
    action: row.action ?? "",
    resource: row.resource ?? "",
    timestamp: row.created_at ?? "",
    ip: row.ip_address ?? "",
  };
}
