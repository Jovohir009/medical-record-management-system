import { NavLink, useNavigate } from "react-router";
import { Calendar } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Stethoscope,
  FileText,
  Building2,
  ShieldCheck,
  LogOut,
  Cross,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { UserRole } from "../../types/domain";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Doctors", path: "/admin/doctors", icon: Stethoscope },
  { label: "Patients", path: "/admin/patients", icon: Users },
  { label: "Diagnoses", path: "/admin/diagnoses", icon: FileText },
  { label: "Departments", path: "/admin/departments", icon: Building2 },
  { label: "User Management", path: "/admin/users", icon: UserCog },
];

const clinicianNav: NavItem[] = [
  { label: "Dashboard", path: "/clinician/dashboard", icon: LayoutDashboard },
  { label: "My Patients", path: "/clinician/patients", icon: Users },
  { label: "Diagnoses", path: "/clinician/diagnoses", icon: FileText },
  { label: "Appointments", path: "/clinician/appointments", icon: Calendar },
];

const receptionistNav: NavItem[] = [
  {
    label: "Dashboard",
    path: "/receptionist/dashboard",
    icon: LayoutDashboard,
  },
  { label: "Patients", path: "/receptionist/patients", icon: Users },
  { label: "Doctors", path: "/receptionist/doctors", icon: Stethoscope },
  {
    label: "Register Patient",
    path: "/receptionist/patients/register",
    icon: UserCog,
  },
];

const navByRole: Record<UserRole, NavItem[]> = {
  administrator: adminNav,
  clinician: clinicianNav,
  receptionist: receptionistNav,
};

const roleLabels: Record<UserRole, string> = {
  administrator: "Administrator",
  clinician: "Clinician",
  receptionist: "Receptionist",
};

const roleBadgeColors: Record<UserRole, string> = {
  administrator: "bg-sky-100 text-sky-700",
  clinician: "bg-teal-100 text-teal-700",
  receptionist: "bg-amber-100 text-amber-700",
};

export function Sidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = navByRole[user.role];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-slate-200 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center flex-shrink-0">
          <Cross className="w-4 h-4 text-white" />
        </div>
        <div>
          <p
            className="text-slate-900"
            style={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2 }}
          >
            CareTrack
          </p>
          <p
            className="text-slate-400"
            style={{ fontSize: "0.7rem", lineHeight: 1.2 }}
          >
            Clinic v2.4
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive
                  ? "bg-sky-50 text-sky-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"}`}
                />
                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight className="w-3 h-3 ml-auto text-sky-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#0EA5E9" }}
          >
            <span
              className="text-white"
              style={{ fontSize: "0.7rem", fontWeight: 700 }}
            >
              {user.initials}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-slate-900 truncate"
              style={{ fontSize: "0.8rem", fontWeight: 600 }}
            >
              {user.name}
            </p>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded ${roleBadgeColors[user.role]}`}
              style={{ fontSize: "0.65rem", fontWeight: 500 }}
            >
              {roleLabels[user.role]}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
          style={{ fontSize: "0.8rem" }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
