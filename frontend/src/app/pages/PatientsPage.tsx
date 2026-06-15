import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  ArrowRightLeft,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Patient } from "../types/domain";
import { deletePatient } from "../services/patientService";
import { ReferralModal } from "../components/patients/ReferralModal";

const statusStyles: Record<
  Patient["status"],
  { label: string; class: string; dot: string }
> = {
  active: {
    label: "Active",
    class: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  discharged: {
    label: "Discharged",
    class: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
  },
  critical: {
    label: "Critical",
    class: "bg-red-100 text-red-600",
    dot: "bg-red-500",
  },
};

const bloodTypeColors: Record<string, string> = {
  "O+": "#0EA5E9",
  "O-": "#0284C7",
  "A+": "#0D9488",
  "A-": "#0F766E",
  "B+": "#8B5CF6",
  "B-": "#7C3AED",
  "AB+": "#F59E0B",
  "AB-": "#D97706",
};

function calcAge(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export function PatientsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, patients, doctors, departments, dataLoading, refreshData } = useApp();
  const [deletingPatientId, setDeletingPatientId] = useState("");
  const [actionError, setActionError] = useState("");
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  const basePath = location.pathname.startsWith("/clinician")
    ? "/clinician"
    : location.pathname.startsWith("/receptionist")
      ? "/receptionist"
      : "/admin";

  const canRegister = user?.role !== "clinician";
  const canEdit = user?.role === "administrator" || user?.role === "clinician";
  const canDelete = user?.role === "administrator";
  const canRefer =
    user?.role === "clinician" ||
    user?.role === "administrator" ||
    user?.role === "receptionist";

  const filtered = patients.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getDoctorName = (id: string) =>
    doctors.find((d) => d.id === id)?.name ?? "Unassigned";

  const counts = {
    all: patients.length,
    active: patients.filter((p) => p.status === "active").length,
    discharged: patients.filter((p) => p.status === "discharged").length,
    critical: patients.filter((p) => p.status === "critical").length,
  };

  const removePatient = async (patient: Patient) => {
    if (!window.confirm(`Delete ${patient.name}? This will remove the patient and linked records.`)) return;

    setDeletingPatientId(patient.id);
    setActionError("");

    try {
      await deletePatient(patient.id);
      await refreshData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to delete patient");
    } finally {
      setDeletingPatientId("");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900">Patients</h1>
          <p className="text-slate-500 mt-1" style={{ fontSize: "0.875rem" }}>
            {dataLoading && !patients.length ? "Loading patients..." : `${patients.length} patients in the registry`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canRefer && (
            <button
              onClick={() => setReferralModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white transition-colors"
              style={{
                backgroundColor: "#0D9488",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#0F766E")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#0D9488")
              }
            >
              <ArrowRightLeft className="w-4 h-4" />
              Refer Patient
            </button>
          )}

          {canRegister && (
            <button
              onClick={() => navigate(`${basePath}/patients/register`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white transition-colors"
              style={{
                backgroundColor: "#0EA5E9",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#0284C7")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#0EA5E9")
              }
            >
              <Plus className="w-4 h-4" />
              Register Patient
            </button>
          )}
        </div>
      </div>

      <ReferralModal
        open={referralModalOpen}
        patients={patients}
        doctors={doctors}
        departments={departments}
        refreshData={refreshData}
        onClose={() => setReferralModalOpen(false)}
      />

      {/* Critical Alert */}
      {counts.critical > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700" style={{ fontSize: "0.875rem" }}>
            <span style={{ fontWeight: 600 }}>
              {counts.critical} critical patient{counts.critical > 1 ? "s" : ""}
            </span>{" "}
            require immediate clinical attention.
          </p>
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" style={{ fontSize: "0.875rem" }}>
          {actionError}
        </div>
      )}

      {/* Filter Pills + Search */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div
          className="flex rounded-xl border border-slate-200 overflow-hidden bg-white"
          style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.04)" }}
        >
          {(["all", "active", "discharged", "critical"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 transition-colors ${statusFilter === s ? "bg-sky-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}
              style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} (
              {counts[s]})
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search by name, ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
            style={{
              fontSize: "0.875rem",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.04)",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        style={{
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        }}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {[
                "Patient",
                "Age / Gender",
                "Assigned Doctor",
                "Blood Type",
                "Insurance",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3.5 text-left text-slate-500"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((patient) => (
              <tr
                key={patient.id}
                className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${patient.status === "critical" ? "bg-red-50/30" : ""}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span
                        className="text-slate-500"
                        style={{ fontSize: "0.7rem", fontWeight: 700 }}
                      >
                        {patient.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p
                        className="text-slate-900"
                        style={{ fontSize: "0.875rem", fontWeight: 500 }}
                      >
                        {patient.name}
                      </p>
                      <p
                        className="text-slate-400"
                        style={{ fontSize: "0.75rem", fontFamily: "monospace" }}
                      >
                        #{patient.id.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p
                    className="text-slate-700"
                    style={{ fontSize: "0.875rem" }}
                  >
                    {calcAge(patient.dob)} yrs
                  </p>
                  <p className="text-slate-400" style={{ fontSize: "0.78rem" }}>
                    {patient.gender}
                  </p>
                </td>
                <td
                  className="px-6 py-4 text-slate-600"
                  style={{ fontSize: "0.875rem" }}
                >
                  {getDoctorName(patient.assignedDoctorId)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-white"
                    style={{
                      backgroundColor:
                        bloodTypeColors[patient.bloodType] || "#64748B",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {patient.bloodType}
                  </span>
                </td>
                <td
                  className="px-6 py-4 text-slate-600"
                  style={{ fontSize: "0.8rem" }}
                >
                  {patient.insuranceProvider}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusStyles[patient.status].class}`}
                    style={{ fontSize: "0.75rem", fontWeight: 500 }}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${statusStyles[patient.status].dot}`}
                    />
                    {statusStyles[patient.status].label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        navigate(`${basePath}/patients/${patient.id}`)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all"
                      title="View Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {canEdit && (
                      <button
                        onClick={() =>
                          navigate(`${basePath}/patients/${patient.id}/edit`)
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-500 hover:bg-teal-50 transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => removePatient(patient)}
                        disabled={deletingPatientId === patient.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-400" style={{ fontSize: "0.9rem" }}>
              No patients found.
            </p>
          </div>
        )}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
          <p className="text-slate-500" style={{ fontSize: "0.8rem" }}>
            Showing {filtered.length} of {patients.length} patients
          </p>
        </div>
      </div>
    </div>
  );
}
