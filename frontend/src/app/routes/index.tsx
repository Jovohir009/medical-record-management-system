import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { AdminDashboard } from "../pages/AdminDashboard";
import { DoctorsPage } from "../pages/DoctorsPage";
import { DoctorFormPage } from "../pages/DoctorFormPage";
import { PatientsPage } from "../pages/PatientsPage";
import { PatientRegistrationPage } from "../pages/PatientRegistrationPage";
import { PatientProfilePage } from "../pages/PatientProfilePage";
import { DiagnosisPage } from "../pages/DiagnosisPage";
import { DiagnosisFormPage } from "../pages/DiagnosisFormPage";
import { DepartmentsPage } from "../pages/DepartmentsPage";
import { UserManagementPage } from "../pages/UserManagementPage";
import { ClinicianDashboard } from "../pages/ClinicianDashboard";
import { ClinicianAppointmentsPage } from "../pages/ClinicianAppointmentsPage";
import { ReceptionistDashboard } from "../pages/ReceptionistDashboard";
import { AccessDeniedPage } from "../pages/AccessDeniedPage";
import { AppointmentBookingPage } from "../pages/AppointmentBookingPage";
import { ProtectedRoute } from "./ProtectedRoute";

const admin = ["administrator"] as const;
const clinician = ["clinician"] as const;
const receptionist = ["receptionist"] as const;
const adminClinician = ["administrator", "clinician"] as const;
const adminReceptionist = ["administrator", "receptionist"] as const;

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/access-denied",
    Component: AccessDeniedPage,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/admin/dashboard", element: <ProtectedRoute allowedRoles={[...admin]}><AdminDashboard /></ProtectedRoute> },
      { path: "/admin/doctors", element: <ProtectedRoute allowedRoles={[...admin]}><DoctorsPage /></ProtectedRoute> },
      { path: "/admin/doctors/new", element: <ProtectedRoute allowedRoles={[...admin]}><DoctorFormPage /></ProtectedRoute> },
      { path: "/admin/doctors/:id/edit", element: <ProtectedRoute allowedRoles={[...admin]}><DoctorFormPage /></ProtectedRoute> },
      { path: "/admin/patients", element: <ProtectedRoute allowedRoles={[...admin]}><PatientsPage /></ProtectedRoute> },
      { path: "/admin/patients/register", element: <ProtectedRoute allowedRoles={[...admin]}><PatientRegistrationPage /></ProtectedRoute> },
      { path: "/admin/patients/:id", element: <ProtectedRoute allowedRoles={[...admin]}><PatientProfilePage /></ProtectedRoute> },
      { path: "/admin/patients/:id/edit", element: <ProtectedRoute allowedRoles={[...admin]}><PatientRegistrationPage /></ProtectedRoute> },
      { path: "/admin/diagnoses", element: <ProtectedRoute allowedRoles={[...admin]}><DiagnosisPage /></ProtectedRoute> },
      { path: "/admin/diagnoses/new", element: <ProtectedRoute allowedRoles={[...admin]}><DiagnosisFormPage /></ProtectedRoute> },
      { path: "/admin/diagnoses/:id/edit", element: <ProtectedRoute allowedRoles={[...admin]}><DiagnosisFormPage /></ProtectedRoute> },
      { path: "/admin/departments", element: <ProtectedRoute allowedRoles={[...admin]}><DepartmentsPage /></ProtectedRoute> },
      { path: "/admin/users", element: <ProtectedRoute allowedRoles={[...admin]}><UserManagementPage /></ProtectedRoute> },
      { path: "/clinician/dashboard", element: <ProtectedRoute allowedRoles={[...clinician]}><ClinicianDashboard /></ProtectedRoute> },
      { path: "/clinician/patients", element: <ProtectedRoute allowedRoles={[...clinician]}><PatientsPage /></ProtectedRoute> },
      { path: "/clinician/patients/:id", element: <ProtectedRoute allowedRoles={[...clinician]}><PatientProfilePage /></ProtectedRoute> },
      { path: "/clinician/patients/:id/edit", element: <ProtectedRoute allowedRoles={[...clinician]}><PatientRegistrationPage /></ProtectedRoute> },
      { path: "/clinician/diagnoses", element: <ProtectedRoute allowedRoles={[...adminClinician]}><DiagnosisPage /></ProtectedRoute> },
      { path: "/clinician/diagnoses/:id/edit", element: <ProtectedRoute allowedRoles={[...clinician]}><DiagnosisFormPage /></ProtectedRoute> },
      { path: "/clinician/appointments", element: <ProtectedRoute allowedRoles={[...clinician]}><ClinicianAppointmentsPage /></ProtectedRoute> },
      { path: "/receptionist/dashboard", element: <ProtectedRoute allowedRoles={[...receptionist]}><ReceptionistDashboard /></ProtectedRoute> },
      { path: "/receptionist/patients", element: <ProtectedRoute allowedRoles={[...receptionist]}><PatientsPage /></ProtectedRoute> },
      { path: "/receptionist/patients/register", element: <ProtectedRoute allowedRoles={[...adminReceptionist]}><PatientRegistrationPage /></ProtectedRoute> },
      { path: "/receptionist/patients/:id", element: <ProtectedRoute allowedRoles={[...receptionist]}><PatientProfilePage /></ProtectedRoute> },
      { path: "/receptionist/doctors", element: <ProtectedRoute allowedRoles={[...receptionist]}><DoctorsPage /></ProtectedRoute> },
      { path: "/receptionist/appointments/new", element: <ProtectedRoute allowedRoles={[...receptionist]}><AppointmentBookingPage /></ProtectedRoute> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
