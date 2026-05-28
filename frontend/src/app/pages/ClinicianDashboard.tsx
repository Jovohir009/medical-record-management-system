import { useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Search,
  Users,
} from "lucide-react";
import { useApp } from "../context/AppContext";

function calcAge(dob: string) {
  return Math.floor(
    (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000),
  );
}

export function ClinicianDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { user, patients, diagnoses, doctors, appointments } = useApp();
  const currentDoctor = doctors.find((doctor) => doctor.userId === user?.id);
  const myDoctorId = currentDoctor?.id ?? "";
  const myPatients = patients.filter((p) => p.assignedDoctorId === myDoctorId);
  const myDiagnoses = diagnoses.filter((d) => d.doctorId === myDoctorId);
  const criticalPatients = myPatients.filter((p) => p.status === "critical");
  const today = new Date().toISOString().slice(0, 10);
  const todaySchedule = appointments
    .filter((appointment) => appointment.doctorId === myDoctorId && appointment.appointmentDate === today)
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  const recentActivity = myDiagnoses.slice(0, 4).map((diagnosis) => ({
    time: new Date(diagnosis.diagnosedDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    action: "Diagnosis recorded",
    detail: `${diagnosis.conditionName} for ${diagnosis.patientName ?? "patient"}`,
    type: diagnosis.severity === "critical" ? "critical" : "diagnosis",
  }));

  const searchResults =
    search.length > 1
      ? myPatients.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.id.includes(search.toLowerCase()),
        )
      : [];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-slate-900">Good morning, {user?.name ?? "Clinician"}</h1>
            <span
              className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-700"
              style={{ fontSize: "0.75rem", fontWeight: 500 }}
            >
              {currentDoctor?.departmentName ?? "Clinical"}
            </span>
          </div>

          <p className="text-slate-500" style={{ fontSize: "0.875rem" }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <button
          className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 hover:shadow-md transition-all"
          style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)" }}
        >
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-left">
            <p className="text-slate-500" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              After-Hours Emergency
            </p>
            <p className="text-slate-900" style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              +998 90 123 45 67
            </p>
          </div>
        </button>
      </div>

      {criticalPatients.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-red-700" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              Critical Patient Alerts
            </p>
          </div>
          <div className="space-y-2">
            {criticalPatients.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/clinician/patients/${p.id}`)}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-red-100 hover:border-red-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                    {p.name}
                  </span>
                  <span className="text-slate-500" style={{ fontSize: "0.78rem" }}>
                    {calcAge(p.dob)} yrs · {p.bloodType}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          {
            label: "My Patients",
            value: myPatients.length,
            icon: Users,
            color: "#0EA5E9",
            bg: "#E0F2FE",
            action: () => navigate("/clinician/patients"),
          },
          {
            label: "Active Diagnoses",
            value: myDiagnoses.filter((d) => d.status === "active").length,
            icon: FileText,
            color: "#0D9488",
            bg: "#CCFBF1",
            action: () => navigate("/clinician/diagnoses"),
          },
          {
            label: "Critical Cases",
            value: criticalPatients.length,
            icon: AlertTriangle,
            color: "#EF4444",
            bg: "#FEE2E2",
            action: () => navigate("/clinician/patients"),
          },
        ].map(({ label, value, icon: Icon, color, bg, action }) => (
          <button
            key={label}
            onClick={action}
            className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-all text-left"
            style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div>
              <p className="text-slate-500" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                {label}
              </p>
              <p className="text-slate-900 mt-0.5" style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.2 }}>
                {value}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}>
            <h3 className="text-slate-900 mb-4">Quick Patient Lookup</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Search your patients by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                style={{ fontSize: "0.875rem" }}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/clinician/patients/${p.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="text-slate-500" style={{ fontSize: "0.65rem", fontWeight: 700 }}>
                        {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                        {p.name}
                      </p>
                      <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>
                        {calcAge(p.dob)} yrs · {p.bloodType}
                      </p>
                    </div>
                    <span
                      className={`ml-auto px-2 py-0.5 rounded-full text-xs ${p.status === "critical" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}
                      style={{ fontWeight: 500 }}
                    >
                      {p.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200" style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-slate-900">My Patients</h3>
              <button onClick={() => navigate("/clinician/patients")} className="text-sky-500 hover:text-sky-600" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                View All
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {myPatients.slice(0, 5).map((p) => {
                const diagCount = myDiagnoses.filter((d) => d.patientId === p.id && d.status === "active").length;
                return (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/clinician/patients/${p.id}`)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-500" style={{ fontSize: "0.65rem", fontWeight: 700 }}>
                        {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                        {p.name}
                      </p>
                      <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>
                        {calcAge(p.dob)} yrs · {p.bloodType} · {diagCount} active dx
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full flex-shrink-0 ${p.status === "critical" ? "bg-red-100 text-red-600" : p.status === "discharged" ? "bg-slate-100 text-slate-400" : "bg-emerald-100 text-emerald-600"}`}
                      style={{ fontSize: "0.72rem", fontWeight: 500 }}
                    >
                      {p.status}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-sky-500" />
              <h4 className="text-slate-900">Today's Schedule</h4>
            </div>
            <div className="space-y-3">
              {todaySchedule.length === 0 ? (
                <p className="text-slate-400" style={{ fontSize: "0.8rem" }}>
                  No appointments scheduled today.
                </p>
              ) : (
                todaySchedule.map((appt) => (
                  <div key={appt.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50">
                    <div className="text-center flex-shrink-0">
                      <p className="text-sky-600" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                        {appt.appointmentTime}
                      </p>
                    </div>
                    <div className="w-px h-7 bg-slate-200" />
                    <div>
                      <p className="text-slate-900" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                        {appt.patientName}
                      </p>
                      <p className="text-slate-400" style={{ fontSize: "0.7rem" }}>
                        {appt.appointmentType === "general_practice" ? "General Practice" : "Specialist Consultation"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-slate-400" />
              <h4 className="text-slate-900">Recent Activity</h4>
            </div>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-slate-400" style={{ fontSize: "0.8rem" }}>
                  No recent diagnosis activity.
                </p>
              ) : (
                recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.type === "critical" ? "bg-red-400" : "bg-sky-400"}`} />
                    <div>
                      <p className="text-slate-700" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                        {a.action}
                      </p>
                      <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>
                        {a.detail}
                      </p>
                      <p className="text-slate-300 mt-0.5" style={{ fontSize: "0.7rem" }}>
                        {a.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
