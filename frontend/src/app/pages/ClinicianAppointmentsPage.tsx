import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Search,
  XCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { updateAppointmentStatus } from "../services/appointmentService";
import { Appointment } from "../types/domain";

const statusStyles: Record<Appointment["status"], { label: string; class: string }> = {
  PENDING: { label: "Pending", class: "bg-amber-100 text-amber-700" },
  ACCEPTED: { label: "Accepted", class: "bg-emerald-100 text-emerald-700" },
  DECLINED: { label: "Declined", class: "bg-red-100 text-red-700" },
};

function formatDate(value: string) {
  if (!value) return "Unscheduled";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ClinicianAppointmentsPage() {
  const { appointments, doctors, user, refreshData } = useApp();
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const currentDoctor = doctors.find((doctor) => doctor.userId === user?.id);

  const filtered = useMemo(() => {
    return appointments.filter((appointment) => {
      const term = search.toLowerCase();

      return (
        appointment.patientName.toLowerCase().includes(term) ||
        appointment.appointmentDate.includes(term) ||
        appointment.status.toLowerCase().includes(term)
      );
    });
  }, [appointments, search]);

  const pendingCount = appointments.filter((item) => item.status === "PENDING").length;

  const changeStatus = async (appointmentId: string, status: "ACCEPTED" | "DECLINED") => {
    setUpdatingId(appointmentId);
    setError("");

    try {
      await updateAppointmentStatus(appointmentId, status);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update appointment");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900">Appointments</h1>
          <p className="text-slate-500 mt-1" style={{ fontSize: "0.875rem" }}>
            {currentDoctor ? `${appointments.length} appointments assigned to you` : "No clinician profile is linked to this user"}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-right">
          <p className="text-slate-400" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
            Pending review
          </p>
          <p className="text-amber-600" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            {pendingCount}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" style={{ fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5" style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search patient, date, or status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
            style={{ fontSize: "0.875rem" }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {["Patient", "Date", "Time", "Type", "Status", "Notes", "Actions"].map((heading) => (
                <th key={heading} className="px-6 py-3.5 text-left text-slate-500" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((appointment) => {
              const statusInfo = statusStyles[appointment.status];

              return (
                <tr key={appointment.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {appointment.patientName}
                    </p>
                    <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>
                      {appointment.patientPhone || "No phone on file"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-600" style={{ fontSize: "0.875rem" }}>
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(appointment.appointmentDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600" style={{ fontSize: "0.875rem" }}>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {appointment.appointmentTime}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600" style={{ fontSize: "0.8rem" }}>
                    {appointment.appointmentType === "general_practice" ? "General Practice" : "Specialist Consultation"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full ${statusInfo.class}`} style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs" style={{ fontSize: "0.8rem" }}>
                    <span className="inline-flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-300 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{appointment.notes || "No notes"}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {appointment.status === "PENDING" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeStatus(appointment.id, "ACCEPTED")}
                          disabled={updatingId === appointment.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          style={{ fontSize: "0.78rem", fontWeight: 500 }}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accept
                        </button>
                        <button
                          onClick={() => changeStatus(appointment.id, "DECLINED")}
                          disabled={updatingId === appointment.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                          style={{ fontSize: "0.78rem", fontWeight: 500 }}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400" style={{ fontSize: "0.8rem" }}>
                        Reviewed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-400" style={{ fontSize: "0.9rem" }}>
              No appointments found.
            </p>
          </div>
        )}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
          <p className="text-slate-500" style={{ fontSize: "0.8rem" }}>
            Showing {filtered.length} of {appointments.length} appointments
          </p>
        </div>
      </div>
    </div>
  );
}
