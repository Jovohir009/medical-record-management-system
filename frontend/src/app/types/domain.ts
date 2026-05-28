export type UserRole = "administrator" | "clinician" | "receptionist";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
}

export interface Doctor {
  id: string;
  userId: number;
  name: string;
  specialty: string;
  department: string;
  departmentName: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "on-leave";
  initials: string;
  avatarColor: string;
  patientsCount: number;
  joinedDate: string;
  licenseNumber: string;
  bio: string;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  email: string;
  phone: string;
  address: string;
  bloodType: string;
  assignedDoctorId: string;
  assignedDoctorName?: string;
  registeredDate: string;
  status: "active" | "discharged" | "critical";
  insuranceProvider: string;
  allergies: string[];
  emergencyContact: string;
  emergencyPhone: string;
}

export interface Diagnosis {
  id: string;
  patientId: string;
  doctorId: string;
  patientName?: string;
  doctorName?: string;
  icdCode: string;
  conditionName: string;
  severity: "mild" | "moderate" | "severe" | "critical";
  status: "active" | "resolved" | "monitoring";
  diagnosedDate: string;
  notes: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  doctorCount: number;
  location: string;
  phone: string;
  email: string;
  description: string;
  color: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  lastLogin: string;
  createdDate: string;
  initials: string;
  avatarColor: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  createdByUserId: number;
  createdByName: string;
  appointmentType: "general_practice" | "specialist_consultation";
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
}

export interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  timestamp: string;
  ip: string;
}

export interface AdminDashboardData {
  stats: {
    total_patients: number;
    active_doctors: number;
    active_diagnoses: number;
    critical_cases: number;
  };
  admissionsChartData: Array<{
    month: string;
    admissions: number;
    discharges: number;
  }>;
  departmentChartData: Array<{
    name: string;
    patients: number;
  }>;
  auditLogs: AuditLog[];
}
