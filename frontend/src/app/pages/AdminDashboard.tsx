import {
  Users,
  Stethoscope,
  FileText,
  AlertTriangle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useApp } from "../context/AppContext";
import { getAdminDashboard } from "../services/dashboardService";
import { AdminDashboardData } from "../types/domain";

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-6"
      style={{
        boxShadow:
          "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-slate-500"
            style={{ fontSize: "0.8rem", fontWeight: 500 }}
          >
            {title}
          </p>
          <p
            className="text-slate-900 mt-1"
            style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.2 }}
          >
            {value}
          </p>
          <p
            className="text-emerald-600 mt-1 flex items-center gap-1"
            style={{ fontSize: "0.78rem" }}
          >
            <TrendingUp className="w-3 h-3" />
            {change}
          </p>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

const actionColors: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-sky-100 text-sky-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-violet-100 text-violet-700",
  Updated: "bg-sky-100 text-sky-700",
  Created: "bg-emerald-100 text-emerald-700",
  Registered: "bg-teal-100 text-teal-700",
  Deactivated: "bg-red-100 text-red-700",
  Viewed: "bg-slate-100 text-slate-600",
  Scheduled: "bg-amber-100 text-amber-700",
  Added: "bg-violet-100 text-violet-700",
};

function formatTimestamp(ts: string) {
  if (!ts) return "Never";
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminDashboard() {
  const { patients, doctors, diagnoses } = useApp();
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    let active = true;

    getAdminDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch(() => {
        if (active) setDashboard(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const criticalCount =
    dashboard?.stats.critical_cases ??
    patients.filter((p) => p.status === "critical").length;
  const activeDocCount =
    dashboard?.stats.active_doctors ??
    doctors.filter((d) => d.status === "active").length;
  const activeDiagnoses =
    dashboard?.stats.active_diagnoses ??
    diagnoses.filter((d) => d.status === "active").length;
  const admissionsChartData = dashboard?.admissionsChartData ?? [];
  const departmentChartData = dashboard?.departmentChartData ?? [];
  const auditLogs = dashboard?.auditLogs ?? [];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-slate-900">Administrator Dashboard</h1>
          <p className="text-slate-500 mt-1" style={{ fontSize: "0.875rem" }}>
            System overview -{" "}
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
          style={{
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
          }}
        >
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Patients"
          value={String(dashboard?.stats.total_patients ?? patients.length)}
          change="+12 this month"
          icon={Users}
          iconBg="#E0F2FE"
          iconColor="#0EA5E9"
        />
        <StatCard
          title="Active Doctors"
          value={String(activeDocCount)}
          change="+2 since last month"
          icon={Stethoscope}
          iconBg="#CCFBF1"
          iconColor="#0D9488"
        />
        <StatCard
          title="Active Diagnoses"
          value={String(activeDiagnoses)}
          change="+5 this week"
          icon={FileText}
          iconBg="#F3E8FF"
          iconColor="#9333EA"
        />
        <StatCard
          title="Critical Cases"
          value={String(criticalCount)}
          change="Requires immediate review"
          icon={AlertTriangle}
          iconBg="#FEE2E2"
          iconColor="#EF4444"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Admissions Chart */}
        <div
          className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-6"
          style={{
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-slate-900">
                Patient Admissions & Discharges
              </h3>
              <p
                className="text-slate-500 mt-0.5"
                style={{ fontSize: "0.8rem" }}
              >
                Last 7 months trend
              </p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50">
              <Activity className="w-3.5 h-3.5 text-sky-500" />
              <span
                className="text-sky-600"
                style={{ fontSize: "0.78rem", fontWeight: 500 }}
              >
                Live
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={admissionsChartData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorAdmissions"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="colorDischarges"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  fontSize: 13,
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />
              <Area
                type="monotone"
                dataKey="admissions"
                name="Admissions"
                stroke="#0EA5E9"
                strokeWidth={2}
                fill="url(#colorAdmissions)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="discharges"
                name="Discharges"
                stroke="#0D9488"
                strokeWidth={2}
                fill="url(#colorDischarges)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div
          className="bg-white rounded-xl border border-slate-200 p-6"
          style={{
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
          }}
        >
          <div className="mb-6">
            <h3 className="text-slate-900">Patients by Department</h3>
            <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.8rem" }}>
              Current active distribution
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={departmentChartData}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F1F5F9"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  fontSize: 13,
                }}
              />
              <Bar
                dataKey="patients"
                name="Patients"
                fill="#0EA5E9"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audit Log */}
      <div
        className="bg-white rounded-xl border border-slate-200"
        style={{
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        }}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-slate-900">Recent Audit Activity</h3>
            <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.8rem" }}>
              System event log - last 24 hours
            </p>
          </div>
          <button
            className="px-4 py-2 rounded-lg text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
            style={{ fontSize: "0.8rem", fontWeight: 500 }}
          >
            View Full Log
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "User",
                  "Role",
                  "Action",
                  "Resource",
                  "Timestamp",
                  "IP Address",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-slate-500"
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
              {auditLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td
                    className="px-6 py-4 text-slate-900"
                    style={{ fontSize: "0.875rem", fontWeight: 500 }}
                  >
                    {log.user}
                  </td>
                  <td
                    className="px-6 py-4 text-slate-500"
                    style={{ fontSize: "0.875rem" }}
                  >
                    {log.role}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${actionColors[log.action] || "bg-slate-100 text-slate-600"}`}
                      style={{ fontSize: "0.75rem", fontWeight: 500 }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-slate-600 max-w-64 truncate"
                    style={{ fontSize: "0.875rem" }}
                  >
                    {log.resource}
                  </td>
                  <td
                    className="px-6 py-4 text-slate-500"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td
                    className="px-6 py-4 text-slate-400"
                    style={{ fontSize: "0.8rem", fontFamily: "monospace" }}
                  >
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
