import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Appointment,
  AuthUser,
  Department,
  Diagnosis,
  Doctor,
  Patient,
  Referral,
  SystemUser,
  UserRole,
} from "../types/domain";
import { clearAuthToken, getAuthToken } from "../services/apiClient";
import { getCurrentUserRequest, loginRequest } from "../services/authService";
import { getAppointments } from "../services/appointmentService";
import { getDepartments } from "../services/departmentService";
import { getDiagnoses } from "../services/diagnosisService";
import { getPatients } from "../services/patientService";
import { getReferralHistory } from "../services/referralService";
import { getDoctors } from "../services/specialistService";
import { getUsers } from "../services/userService";

interface AppContextType {
  user: AuthUser | null;
  initializing: boolean;
  dataLoading: boolean;
  dataError: string | null;
  doctors: Doctor[];
  patients: Patient[];
  diagnoses: Diagnosis[];
  departments: Department[];
  users: SystemUser[];
  appointments: Appointment[];
  referrals: Referral[];
  login: (
    email: string,
    password: string,
    remember: boolean,
  ) => Promise<AuthUser>;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const dashboardByRole: Record<UserRole, string> = {
  administrator: "/admin/dashboard",
  clinician: "/clinician/dashboard",
  receptionist: "/receptionist/dashboard",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const refreshData = useCallback(async () => {
    if (!getAuthToken()) return;

    setDataLoading(true);
    setDataError(null);

    try {
      const [
        doctorsData,
        patientsData,
        diagnosesData,
        departmentsData,
        usersData,
        appointmentsData,
        referralsData,
      ] = await Promise.all([
        getDoctors(),
        getPatients(),
        getDiagnoses(),
        getDepartments(),
        getUsers(),
        getAppointments(),
        getReferralHistory(),
      ]);

      setDoctors(doctorsData);
      setPatients(patientsData);
      setDiagnoses(diagnosesData);
      setDepartments(departmentsData);
      setUsers(usersData);
      setAppointments(appointmentsData);
      setReferrals(referralsData);
    } catch (error) {
      setDataError(
        error instanceof Error ? error.message : "Unable to load data",
      );
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      if (!getAuthToken()) {
        setInitializing(false);
        return;
      }

      try {
        const currentUser = await getCurrentUserRequest();
        if (!active) return;
        setUser(currentUser);
        await refreshData();
      } catch {
        clearAuthToken();
        if (active) setUser(null);
      } finally {
        if (active) setInitializing(false);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [refreshData]);

  const login = async (email: string, password: string, remember: boolean) => {
    const authUser = await loginRequest(email, password, remember);
    setUser(authUser);
    await refreshData();
    return authUser;
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    setDoctors([]);
    setPatients([]);
    setDiagnoses([]);
    setDepartments([]);
    setUsers([]);
    setAppointments([]);
    setReferrals([]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        initializing,
        dataLoading,
        dataError,
        doctors,
        patients,
        diagnoses,
        departments,
        users,
        appointments,
        referrals,
        login,
        logout,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
