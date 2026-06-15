import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  FileText,
  X,
} from "lucide-react";
import { createReferral } from "../../services/referralService";
import { Department, Doctor, Patient } from "../../types/domain";

interface ReferralModalProps {
  open: boolean;
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  refreshData: () => Promise<void>;
  onClose: () => void;
}

interface ReferralForm {
  patientId: string;
  fromDepartmentId: string;
  fromDoctorId: string;
  toDepartmentId: string;
  toDoctorId: string;
  referralReason: string;
  referralNotes: string;
}

const emptyForm: ReferralForm = {
  patientId: "",
  fromDepartmentId: "",
  fromDoctorId: "",
  toDepartmentId: "",
  toDoctorId: "",
  referralReason: "",
  referralNotes: "",
};

export function ReferralModal({
  open,
  patients,
  doctors,
  departments,
  refreshData,
  onClose,
}: ReferralModalProps) {
  const [form, setForm] = useState<ReferralForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedPatient = patients.find((patient) => patient.id === form.patientId);
  const fromDepartmentDoctors = useMemo(
    () =>
      doctors.filter((doctor) =>
        form.fromDepartmentId ? doctor.department === form.fromDepartmentId : true,
      ),
    [doctors, form.fromDepartmentId],
  );
  const targetDoctors = useMemo(
    () =>
      doctors.filter(
        (doctor) =>
          doctor.status === "active" &&
          doctor.department === form.toDepartmentId &&
          doctor.id !== form.fromDoctorId,
      ),
    [doctors, form.fromDoctorId, form.toDepartmentId],
  );

  if (!open) return null;

  const resetAndClose = () => {
    setForm(emptyForm);
    setErrors({});
    setApiError("");
    setSuccessMessage("");
    onClose();
  };

  const update = (key: keyof ReferralForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setApiError("");
    setSuccessMessage("");
  };

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find((item) => item.id === patientId);
    const assignedDoctor = doctors.find(
      (doctor) => doctor.id === patient?.assignedDoctorId,
    );

    setForm((prev) => ({
      ...prev,
      patientId,
      fromDoctorId: assignedDoctor?.id ?? "",
      fromDepartmentId: assignedDoctor?.department ?? "",
      toDepartmentId: "",
      toDoctorId: "",
    }));
    setErrors((prev) => ({
      ...prev,
      patientId: "",
      fromDoctorId: "",
      fromDepartmentId: "",
      toDepartmentId: "",
      toDoctorId: "",
    }));
    setApiError("");
    setSuccessMessage("");
  };

  const handleFromDepartmentChange = (departmentId: string) => {
    setForm((prev) => {
      const currentDoctor = doctors.find((doctor) => doctor.id === prev.fromDoctorId);

      return {
        ...prev,
        fromDepartmentId: departmentId,
        fromDoctorId:
          currentDoctor?.department === departmentId ? prev.fromDoctorId : "",
        toDoctorId: prev.toDoctorId === prev.fromDoctorId ? "" : prev.toDoctorId,
      };
    });
    setErrors((prev) => ({ ...prev, fromDepartmentId: "", fromDoctorId: "" }));
  };

  const handleFromDoctorChange = (doctorId: string) => {
    const doctor = doctors.find((item) => item.id === doctorId);

    setForm((prev) => ({
      ...prev,
      fromDoctorId: doctorId,
      fromDepartmentId: doctor?.department ?? prev.fromDepartmentId,
      toDoctorId: prev.toDoctorId === doctorId ? "" : prev.toDoctorId,
    }));
    setErrors((prev) => ({ ...prev, fromDoctorId: "", fromDepartmentId: "" }));
  };

  const handleTargetDepartmentChange = (departmentId: string) => {
    setForm((prev) => ({
      ...prev,
      toDepartmentId: departmentId,
      toDoctorId: "",
    }));
    setErrors((prev) => ({ ...prev, toDepartmentId: "", toDoctorId: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.patientId) nextErrors.patientId = "Select a patient";
    if (!form.fromDepartmentId) {
      nextErrors.fromDepartmentId = "Select the current department";
    }
    if (!form.fromDoctorId) nextErrors.fromDoctorId = "Select the current doctor";
    if (!form.toDepartmentId) {
      nextErrors.toDepartmentId = "Select the target department";
    }
    if (!form.toDoctorId) nextErrors.toDoctorId = "Select the target doctor";
    if (form.fromDoctorId && form.toDoctorId && form.fromDoctorId === form.toDoctorId) {
      nextErrors.toDoctorId = "Target doctor must be different";
    }
    if (!form.referralReason.trim()) {
      nextErrors.referralReason = "Enter a referral reason";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (!validate()) return;

    setSaving(true);

    try {
      const referral = await createReferral({
        patientId: form.patientId,
        fromDepartmentId: form.fromDepartmentId,
        fromDoctorId: form.fromDoctorId,
        toDepartmentId: form.toDepartmentId,
        toDoctorId: form.toDoctorId,
        referralReason: form.referralReason,
        referralNotes: form.referralNotes,
      });

      await refreshData();
      setSuccessMessage(
        `${referral.patientName} was referred to ${referral.toDoctorName}.`,
      );
      setForm(emptyForm);
      setErrors({});
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Unable to create referral");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400";
  const errorClass = "mt-1.5 text-red-500 flex items-center gap-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
          <div>
            <h2 className="text-slate-900" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              Refer Patient
            </h2>
            <p className="text-slate-500 mt-1" style={{ fontSize: "0.875rem" }}>
              Transfer care to another department and doctor with an auditable history record.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close referral form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" style={{ fontSize: "0.875rem" }}>
              {apiError}
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700" style={{ fontSize: "0.875rem" }}>
              <CheckCircle className="w-4 h-4" />
              {successMessage}
            </div>
          )}

          <div>
            <label className="block text-slate-700 mb-1.5" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              Patient
            </label>
            <select
              value={form.patientId}
              onChange={(event) => handlePatientChange(event.target.value)}
              className={inputClass}
            >
              <option value="">Select patient...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.assignedDoctorName || "Unassigned"}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className={errorClass} style={{ fontSize: "0.75rem" }}>
                <AlertCircle className="w-3.5 h-3.5" /> {errors.patientId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-500" style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Current Assignment
              </div>
              <div>
                <label className="block text-slate-700 mb-1.5" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  Current Department
                </label>
                <select
                  value={form.fromDepartmentId}
                  onChange={(event) => handleFromDepartmentChange(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select department...</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
                {errors.fromDepartmentId && (
                  <p className={errorClass} style={{ fontSize: "0.75rem" }}>
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.fromDepartmentId}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 mb-1.5" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  Current Doctor
                </label>
                <select
                  value={form.fromDoctorId}
                  onChange={(event) => handleFromDoctorChange(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select doctor...</option>
                  {fromDepartmentDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
                {errors.fromDoctorId && (
                  <p className={errorClass} style={{ fontSize: "0.75rem" }}>
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.fromDoctorId}
                  </p>
                )}
              </div>
            </div>

            <div className="hidden md:flex h-full items-center justify-center pt-12">
              <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-sky-500" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-500" style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Target Assignment
              </div>
              <div>
                <label className="block text-slate-700 mb-1.5" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  Target Department
                </label>
                <select
                  value={form.toDepartmentId}
                  onChange={(event) => handleTargetDepartmentChange(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select department...</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
                {errors.toDepartmentId && (
                  <p className={errorClass} style={{ fontSize: "0.75rem" }}>
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.toDepartmentId}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 mb-1.5" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  Target Doctor
                </label>
                <select
                  value={form.toDoctorId}
                  onChange={(event) => update("toDoctorId", event.target.value)}
                  disabled={!form.toDepartmentId}
                  className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
                >
                  <option value="">Select doctor...</option>
                  {targetDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
                {form.toDepartmentId && targetDoctors.length === 0 && (
                  <p className="mt-1.5 text-amber-600" style={{ fontSize: "0.75rem" }}>
                    No active target doctors available in this department.
                  </p>
                )}
                {errors.toDoctorId && (
                  <p className={errorClass} style={{ fontSize: "0.75rem" }}>
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.toDoctorId}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-slate-700 mb-1.5" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                Referral Reason
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  value={form.referralReason}
                  onChange={(event) => update("referralReason", event.target.value)}
                  placeholder="Reason for referral"
                  className={`${inputClass} pl-10`}
                />
              </div>
              {errors.referralReason && (
                <p className={errorClass} style={{ fontSize: "0.75rem" }}>
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.referralReason}
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 mb-1.5" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                Referral Notes
              </label>
              <textarea
                value={form.referralNotes}
                onChange={(event) => update("referralNotes", event.target.value)}
                rows={3}
                placeholder="Clinical or scheduling context for the receiving doctor..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {selectedPatient && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600" style={{ fontSize: "0.8rem" }}>
              {selectedPatient.name} is currently assigned to{" "}
              <span className="font-medium text-slate-800">
                {selectedPatient.assignedDoctorName || "an unassigned doctor"}
              </span>
              .
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              style={{ fontSize: "0.875rem", fontWeight: 500 }}
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60"
              style={{ fontSize: "0.875rem", fontWeight: 600 }}
            >
              <CheckCircle className="w-4 h-4" />
              {saving ? "Creating..." : "Create Referral"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
