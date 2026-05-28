import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Edit2, Eye, Plus, Search, Trash2, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { deleteDiagnosis, getDiagnosis } from "../services/diagnosisService";
import { Diagnosis } from "../types/domain";

const severityStyles = {
  mild: { class: "bg-emerald-100 text-emerald-700", label: "Mild" },
  moderate: { class: "bg-amber-100 text-amber-700", label: "Moderate" },
  severe: { class: "bg-orange-100 text-orange-700", label: "Severe" },
  critical: { class: "bg-red-100 text-red-700", label: "Critical" },
};

const statusStyles = {
  active: { class: "bg-sky-100 text-sky-700", label: "Active" },
  resolved: { class: "bg-slate-100 text-slate-500", label: "Resolved" },
  monitoring: { class: "bg-violet-100 text-violet-700", label: "Monitoring" },
};

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DiagnosisPage() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  const [loadingDiagnosisId, setLoadingDiagnosisId] = useState("");
  const [deletingDiagnosisId, setDeletingDiagnosisId] = useState("");
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, diagnoses, patients, doctors, refreshData } = useApp();

  const basePath = location.pathname.startsWith("/clinician") ? "/clinician" : "/admin";
  const canAdd = user?.role === "administrator";
  const canEdit = user?.role === "administrator" || user?.role === "clinician";
  const canDelete = user?.role === "administrator";

  const filtered = diagnoses.filter((diagnosis) => {
    const patient = patients.find((item) => item.id === diagnosis.patientId);
    const matchSearch =
      diagnosis.conditionName.toLowerCase().includes(search.toLowerCase()) ||
      diagnosis.icdCode.toLowerCase().includes(search.toLowerCase()) ||
      (patient?.name.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchSeverity =
      severityFilter === "all" || diagnosis.severity === severityFilter;
    const matchStatus = statusFilter === "all" || diagnosis.status === statusFilter;

    return matchSearch && matchSeverity && matchStatus;
  });

  const viewDiagnosis = async (id: string) => {
    setLoadingDiagnosisId(id);
    setActionError("");

    try {
      setSelectedDiagnosis(await getDiagnosis(id));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to load diagnosis");
    } finally {
      setLoadingDiagnosisId("");
    }
  };

  const removeDiagnosis = async (diagnosis: Diagnosis) => {
    if (!window.confirm(`Delete diagnosis ${diagnosis.conditionName}?`)) return;

    setDeletingDiagnosisId(diagnosis.id);
    setActionError("");

    try {
      await deleteDiagnosis(diagnosis.id);
      await refreshData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to delete diagnosis");
    } finally {
      setDeletingDiagnosisId("");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900">Diagnoses</h1>
          <p className="text-slate-500 mt-1" style={{ fontSize: "0.875rem" }}>
            {diagnoses.length} diagnoses across all patients
          </p>
        </div>
        {canAdd && (
          <button
            onClick={() => navigate(`${basePath}/diagnoses/new`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white"
            style={{ backgroundColor: "#0EA5E9", fontSize: "0.875rem", fontWeight: 500 }}
            onMouseEnter={(event) => (event.currentTarget.style.backgroundColor = "#0284C7")}
            onMouseLeave={(event) => (event.currentTarget.style.backgroundColor = "#0EA5E9")}
          >
            <Plus className="w-4 h-4" />
            Add Diagnosis
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(["mild", "moderate", "severe", "critical"] as const).map((severity) => {
          const count = diagnoses.filter((diagnosis) => diagnosis.severity === severity).length;
          return (
            <button
              key={severity}
              onClick={() => setSeverityFilter(severityFilter === severity ? "all" : severity)}
              className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${severityFilter === severity ? "border-sky-300 ring-1 ring-sky-200" : "border-slate-200"}`}
              style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
            >
              <p className="text-slate-500" style={{ fontSize: "0.75rem", fontWeight: 500, textTransform: "capitalize" }}>
                {severity} Severity
              </p>
              <p className="text-slate-900 mt-1" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                {count}
              </p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full mt-2 ${severityStyles[severity].class}`} style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                {severityStyles[severity].label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 flex flex-wrap gap-3" style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}>
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search condition, ICD code, or patient..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
            style={{ fontSize: "0.875rem" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
          style={{ fontSize: "0.875rem" }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="monitoring">Monitoring</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" style={{ fontSize: "0.875rem" }}>
          {actionError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {["ICD Code", "Condition", "Patient", "Physician", "Severity", "Status", "Diagnosed", "Actions"].map((heading) => (
                <th key={heading} className="px-6 py-3.5 text-left text-slate-500" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((diagnosis) => {
              const patient = patients.find((item) => item.id === diagnosis.patientId);
              const doctor = doctors.find((item) => item.id === diagnosis.doctorId);

              return (
                <tr key={diagnosis.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-white" style={{ fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 600 }}>
                      {diagnosis.icdCode || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                    {diagnosis.conditionName}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700" style={{ fontSize: "0.875rem" }}>
                      {patient?.name ?? diagnosis.patientName ?? "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-600" style={{ fontSize: "0.8rem" }}>
                    {doctor?.name ?? diagnosis.doctorName ?? "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full ${severityStyles[diagnosis.severity].class}`} style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                      {severityStyles[diagnosis.severity].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full ${statusStyles[diagnosis.status].class}`} style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                      {statusStyles[diagnosis.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500" style={{ fontSize: "0.8rem" }}>
                    {formatDate(diagnosis.diagnosedDate)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => viewDiagnosis(diagnosis.id)}
                        disabled={loadingDiagnosisId === diagnosis.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-500 hover:bg-teal-50 transition-all disabled:opacity-50"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => navigate(`${basePath}/diagnoses/${diagnosis.id}/edit`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => removeDiagnosis(diagnosis)}
                          disabled={deletingDiagnosisId === diagnosis.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-400" style={{ fontSize: "0.9rem" }}>
              No diagnoses found.
            </p>
          </div>
        )}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
          <p className="text-slate-500" style={{ fontSize: "0.8rem" }}>
            Showing {filtered.length} of {diagnoses.length} diagnoses
          </p>
        </div>
      </div>

      {selectedDiagnosis && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-2xl overflow-hidden" style={{ boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.15)" }}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-slate-900">{selectedDiagnosis.conditionName}</h3>
                <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.82rem" }}>
                  {selectedDiagnosis.icdCode || "No ICD code"}
                </p>
              </div>
              <button onClick={() => setSelectedDiagnosis(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["Patient", selectedDiagnosis.patientName || patients.find((item) => item.id === selectedDiagnosis.patientId)?.name || "-"],
                ["Physician", selectedDiagnosis.doctorName || doctors.find((item) => item.id === selectedDiagnosis.doctorId)?.name || "-"],
                ["Severity", severityStyles[selectedDiagnosis.severity].label],
                ["Status", statusStyles[selectedDiagnosis.status].label],
                ["Diagnosed Date", formatDate(selectedDiagnosis.diagnosedDate)],
                ["ICD Code", selectedDiagnosis.icdCode || "-"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                  <p className="text-slate-400" style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase" }}>
                    {label}
                  </p>
                  <p className="text-slate-800 mt-1" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                    {value}
                  </p>
                </div>
              ))}
              <div className="md:col-span-2 rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-slate-400" style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase" }}>
                  Description / Notes
                </p>
                <p className="text-slate-700 mt-1" style={{ fontSize: "0.9rem" }}>
                  {selectedDiagnosis.notes || "No notes recorded."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
