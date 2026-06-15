import { useNavigate } from "react-router";
import {
  UserPlus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Phone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

const apptStatusStyles = {
  ACCEPTED: {
    class: "bg-emerald-100 text-emerald-700",
    label: "Accepted",
    icon: CheckCircle,
  },
  PENDING: {
    class: "bg-amber-100 text-amber-700",
    label: "Pending",
    icon: Clock,
  },
  DECLINED: {
    class: "bg-red-100 text-red-700",
    label: "Declined",
    icon: XCircle,
  },
};

export function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { doctors, patients, appointments, user, refreshData } = useApp();
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;

  const activeDoctors = doctors.filter((d) => d.status === "active");
  const onLeaveDoctors = doctors.filter((d) => d.status === "on-leave");
  const todayAppointments = appointments
    .filter((appointment) => appointment.appointmentDate === today)
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  const appointmentStatusCounts = {
    PENDING: appointments.filter((appointment) => appointment.status === "PENDING").length,
    ACCEPTED: appointments.filter((appointment) => appointment.status === "ACCEPTED").length,
    DECLINED: appointments.filter((appointment) => appointment.status === "DECLINED").length,
  };
  const recentAppointments = [...appointments]
    .sort((a, b) => {
      const aValue = `${a.appointmentDate}T${a.appointmentTime}`;
      const bValue = `${b.appointmentDate}T${b.appointmentTime}`;
      return bValue.localeCompare(aValue);
    })
    .slice(0, 10);
  const registeredThisWeek = patients.filter(
    (patient) => new Date(patient.registeredDate).getTime() >= sevenDaysAgo,
  ).length;

  const searchResults =
    search.length > 1
      ? patients.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.phone.includes(search),
        )
      : [];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshData();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [refreshData]);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-slate-900">Good morning, {user?.name ?? "Front Desk"}</h1>
          <p className="text-slate-500 mt-1" style={{ fontSize: "0.875rem" }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            - Front Desk
          </p>
        </div>

        <button
          className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 hover:shadow-md transition-all"
          style={{
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
          }}
        >
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
            <Phone className="w-5 h-5 text-red-500" />
          </div>

          <div className="text-left">
            <p
              className="text-slate-500"
              style={{ fontSize: "0.75rem", fontWeight: 500 }}
            >
              After-Hours Emergency
            </p>
            <p
              className="text-slate-900"
              style={{ fontSize: "0.95rem", fontWeight: 700 }}
            >
              +998 90 123 45 67
            </p>
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => navigate("/receptionist/patients/register")}
          className="flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 hover:bg-sky-100 hover:border-sky-400 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sky-900" style={{ fontWeight: 600 }}>
              Register New Patient
            </p>
            <p className="text-sky-600 mt-0.5" style={{ fontSize: "0.8rem" }}>
              Quick 4-step intake form to add a new patient to the system
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-sky-400 ml-auto" />
        </button>

        <button
          onClick={() => navigate("/receptionist/patients")}
          className="flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-all text-left"
          style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
        >
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
            <Search className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-slate-900" style={{ fontWeight: 600 }}>
              Patient Lookup
            </p>
            <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.8rem" }}>
              Search the patient registry by name, ID, or phone number
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 ml-auto" />
        </button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Appointments + Search */}
        <div className="xl:col-span-2 space-y-5">
          {/* Quick Search */}
          <div
            className="bg-white rounded-xl border border-slate-200 p-5"
            style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
          >
            <h3 className="text-slate-900 mb-3">Patient Quick Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Search by name or phone number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                style={{ fontSize: "0.875rem" }}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {searchResults.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                      <span
                        className="text-slate-500"
                        style={{ fontSize: "0.65rem", fontWeight: 700 }}
                      >
                        {p.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-slate-900"
                        style={{ fontSize: "0.875rem", fontWeight: 500 }}
                      >
                        {p.name}
                      </p>
                      <p
                        className="text-slate-400 flex items-center gap-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        <Phone className="w-3 h-3" />
                        {p.phone}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/receptionist/patients/${p.id}`)}
                      className="text-sky-500 hover:text-sky-600"
                      style={{ fontSize: "0.78rem", fontWeight: 500 }}
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Appointments */}
          <div
            className="bg-white rounded-xl border border-slate-200"
            style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-slate-900">Today's Appointments</h3>
                <p
                  className="text-slate-500 mt-0.5"
                  style={{ fontSize: "0.78rem" }}
                >
                  {todayAppointments.length} booked -{" "}
                  {
                    todayAppointments.filter((a) => a.status === "ACCEPTED")
                      .length
                  }{" "}
                  accepted
                </p>
              </div>

              <button
                onClick={() => navigate("/receptionist/appointments/new")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white transition-colors"
                style={{
                  backgroundColor: "#0EA5E9",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#0284C7")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#0EA5E9")
                }
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Appointment
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {todayAppointments.map((appt) => {
                const doctor = doctors.find((d) => d.id === appt.doctorId);
                const statusInfo =
                  apptStatusStyles[
                    appt.status as keyof typeof apptStatusStyles
                  ] ?? apptStatusStyles.PENDING;
                return (
                  <div
                    key={appt.id}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
                    <div className="text-center w-14 flex-shrink-0">
                      <p
                        className="text-slate-500"
                        style={{ fontSize: "0.875rem", fontWeight: 600 }}
                      >
                        {appt.appointmentTime}
                      </p>
                    </div>
                    <div className="w-px h-10 bg-slate-200 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-slate-900"
                        style={{ fontSize: "0.875rem", fontWeight: 500 }}
                      >
                        {appt.patientName}
                      </p>
                      <p
                        className="text-slate-500"
                        style={{ fontSize: "0.78rem" }}
                      >
                        {appt.appointmentType === "general_practice" ? "General Practice" : "Specialist Consultation"} - {doctor?.name ?? appt.doctorName}
                      </p>
                    </div>
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 ${statusInfo.class}`}
                      style={{ fontSize: "0.72rem", fontWeight: 500 }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                );
              })}
              {todayAppointments.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-slate-400" style={{ fontSize: "0.875rem" }}>
                    No appointments booked for today.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className="bg-white rounded-xl border border-slate-200"
            style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
          >
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-slate-900">Appointment Status Board</h3>
                  <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.78rem" }}>
                    Live appointment records grouped by clinician decision state
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {(["PENDING", "ACCEPTED", "DECLINED"] as const).map((status) => {
                    const statusInfo = apptStatusStyles[status];
                    return (
                      <span
                        key={status}
                        className={`px-3 py-1.5 rounded-full ${statusInfo.class}`}
                        style={{ fontSize: "0.75rem", fontWeight: 600 }}
                      >
                        {statusInfo.label}: {appointmentStatusCounts[status]}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {["Patient", "Doctor", "Date", "Time", "Status"].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-left text-slate-500"
                        style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((appointment) => {
                    const statusInfo = apptStatusStyles[appointment.status] ?? apptStatusStyles.PENDING;

                    return (
                      <tr key={appointment.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="px-5 py-3 text-slate-900" style={{ fontSize: "0.84rem", fontWeight: 500 }}>
                          {appointment.patientName}
                        </td>
                        <td className="px-5 py-3 text-slate-600" style={{ fontSize: "0.82rem" }}>
                          {appointment.doctorName}
                        </td>
                        <td className="px-5 py-3 text-slate-500" style={{ fontSize: "0.82rem" }}>
                          {appointment.appointmentDate}
                        </td>
                        <td className="px-5 py-3 text-slate-500" style={{ fontSize: "0.82rem" }}>
                          {appointment.appointmentTime}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-full ${statusInfo.class}`} style={{ fontSize: "0.72rem", fontWeight: 500 }}>
                            {statusInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {recentAppointments.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-slate-400" style={{ fontSize: "0.875rem" }}>
                    No appointment records found.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Doctor Availability */}
        <div className="space-y-5">
          <div
            className="bg-white rounded-xl border border-slate-200 p-5"
            style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
          >
            <h4 className="text-slate-900 mb-4">Doctor Availability</h4>
            <div className="space-y-3">
              {activeDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: doc.avatarColor + "20" }}
                  >
                    <span
                      style={{
                        color: doc.avatarColor,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                      }}
                    >
                      {doc.initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-slate-900 truncate"
                      style={{ fontSize: "0.8rem", fontWeight: 500 }}
                    >
                      {doc.name}
                    </p>
                    <p
                      className="text-slate-400"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {doc.specialty}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span
                      className="text-emerald-600"
                      style={{ fontSize: "0.7rem", fontWeight: 500 }}
                    >
                      Available
                    </span>
                  </div>
                </div>
              ))}
              {onLeaveDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 opacity-60"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <span
                      className="text-slate-400"
                      style={{ fontSize: "0.65rem", fontWeight: 700 }}
                    >
                      {doc.initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-slate-500 truncate"
                      style={{ fontSize: "0.8rem", fontWeight: 500 }}
                    >
                      {doc.name}
                    </p>
                    <p
                      className="text-slate-400"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {doc.specialty}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span
                      className="text-amber-500"
                      style={{ fontSize: "0.7rem", fontWeight: 500 }}
                    >
                      On Leave
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div
            className="bg-white rounded-xl border border-slate-200 p-5"
            style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
          >
            <h4 className="text-slate-900 mb-4">Today's Summary</h4>
            <div className="space-y-3">
              {[
                {
                  label: "Total Patients",
                  value: patients.length,
                  color: "text-sky-600",
                },
                {
                  label: "Registered This Week",
                  value: registeredThisWeek,
                  color: "text-teal-600",
                },
                {
                  label: "Today's Appointments",
                  value: todayAppointments.length,
                  color: "text-slate-900",
                },
                {
                  label: "Accepted",
                  value: todayAppointments.filter(
                    (a) => a.status === "ACCEPTED",
                  ).length,
                  color: "text-emerald-600",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                >
                  <span
                    className="text-slate-500"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {label}
                  </span>
                  <span
                    className={color}
                    style={{ fontSize: "0.9rem", fontWeight: 700 }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
