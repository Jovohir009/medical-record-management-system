import { useNavigate } from "react-router";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";
import { useApp } from "../context/AppContext";

const dashboardByRole = {
  administrator: "/admin/dashboard",
  clinician: "/clinician/dashboard",
  receptionist: "/receptionist/dashboard",
};

export function AccessDeniedPage() {
  const navigate = useNavigate();
  const { user } = useApp();

  const handleReturn = () => {
    if (user) {
      navigate(dashboardByRole[user.role]);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
              <ShieldOff className="w-12 h-12 text-red-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-400 flex items-center justify-center">
              <span
                className="text-white"
                style={{ fontSize: "0.75rem", fontWeight: 700 }}
              >
                !
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1
          className="text-slate-900 mb-3"
          style={{ fontSize: "1.75rem", fontWeight: 700 }}
        >
          Access Denied
        </h1>
        <p
          className="text-slate-500 mb-2"
          style={{ fontSize: "1rem", lineHeight: 1.6 }}
        >
          You don't have permission to view this page.
        </p>
        <p
          className="text-slate-400 mb-8"
          style={{ fontSize: "0.875rem", lineHeight: 1.6 }}
        >
          This area is restricted to authorized roles. If you believe this is an
          error, please contact your system administrator.
        </p>

        {/* Role Info */}
        {user && (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl mb-8">
            <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
              <span
                className="text-sky-600"
                style={{ fontSize: "0.6rem", fontWeight: 700 }}
              >
                {user.initials}
              </span>
            </div>
            <span className="text-slate-600" style={{ fontSize: "0.8rem" }}>
              Signed in as{" "}
            </span>
            <span
              className="text-slate-900"
              style={{ fontSize: "0.8rem", fontWeight: 600 }}
            >
              {user.name}
            </span>
            <span
              className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700"
              style={{
                fontSize: "0.7rem",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            >
              {user.role}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1 as any)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            style={{ fontWeight: 500, fontSize: "0.875rem" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={handleReturn}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white transition-colors"
            style={{
              backgroundColor: "#0EA5E9",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#0284C7")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#0EA5E9")
            }
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-10 text-slate-300" style={{ fontSize: "0.78rem" }}>
          CareTrack Clinic · HIPAA Compliant Access Controls · Event logged at{" "}
          {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
