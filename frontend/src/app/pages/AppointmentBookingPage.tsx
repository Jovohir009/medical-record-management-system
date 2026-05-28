import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Phone,
  User,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  createAppointment,
  getAvailableSlots,
} from "../services/appointmentService";

interface AppointmentForm {
  patientId: string;
  contactNumber: string;
  appointmentType: "general_practice" | "specialist_consultation" | "";
  departmentId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export function AppointmentBookingPage() {
  const navigate = useNavigate();
  const { patients, doctors, departments, refreshData } = useApp();
  const [formData, setFormData] = useState<AppointmentForm>({
    patientId: "",
    contactNumber: "",
    appointmentType: "",
    departmentId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const selectedPatient = patients.find((patient) => patient.id === formData.patientId);
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const statusMatch = doctor.status === "active";
      const departmentMatch = formData.departmentId
        ? doctor.department === formData.departmentId
        : true;
      const generalMatch =
        formData.appointmentType === "general_practice"
          ? doctor.specialty.toLowerCase().includes("general")
          : true;

      return statusMatch && departmentMatch && generalMatch;
    });
  }, [doctors, formData.appointmentType, formData.departmentId]);

  useEffect(() => {
    if (!formData.doctorId || !formData.appointmentDate) {
      setAvailableTimeSlots([]);
      return;
    }

    let active = true;
    setSlotsLoading(true);

    getAvailableSlots(formData.doctorId, formData.appointmentDate)
      .then((slots) => {
        if (active) setAvailableTimeSlots(slots);
      })
      .catch((err) => {
        if (active) {
          setAvailableTimeSlots([]);
          setErrors((prev) => ({
            ...prev,
            appointmentTime:
              err instanceof Error ? err.message : "Unable to load available time slots",
          }));
        }
      })
      .finally(() => {
        if (active) setSlotsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [formData.doctorId, formData.appointmentDate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "patientId") {
        const patient = patients.find((item) => item.id === value);
        next.contactNumber = patient?.phone ?? "";
      }

      if (name === "appointmentType") {
        next.departmentId = "";
        next.doctorId = "";
        next.appointmentTime = "";
      }

      if (name === "departmentId") {
        next.doctorId = "";
        next.appointmentTime = "";
      }

      if (name === "doctorId" || name === "appointmentDate") {
        next.appointmentTime = "";
      }

      return next;
    });

    if (errors[name] || name === "doctorId" || name === "appointmentDate") {
      setErrors((prev) => ({ ...prev, [name]: "", appointmentTime: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.patientId) newErrors.patientId = "Please select a patient";
    if (!formData.appointmentType) newErrors.appointmentType = "Please select an appointment type";
    if (formData.appointmentType === "specialist_consultation" && !formData.departmentId) {
      newErrors.departmentId = "Please select a specialist department";
    }
    if (!formData.doctorId) newErrors.doctorId = "Please select a doctor";
    if (!formData.appointmentDate) newErrors.appointmentDate = "Please select a date";
    if (formData.appointmentDate && formData.appointmentDate < today) {
      newErrors.appointmentDate = "Please select today or a future date";
    }
    if (!formData.appointmentTime) newErrors.appointmentTime = "Please select a time slot";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;

    setSaving(true);

    try {
      await createAppointment({
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        appointmentType: formData.appointmentType,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        notes: formData.notes,
      });
      await refreshData();
      setIsSubmitted(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to book appointment");
    } finally {
      setSaving(false);
    }
  };

  if (isSubmitted) {
    return (
      <div
        className="max-w-md mx-auto mt-16 bg-white rounded-xl border border-slate-200 p-8 text-center"
        style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
      >
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Appointment Booked</h2>
        <p className="text-slate-500 mb-8" style={{ fontSize: "0.95rem" }}>
          The appointment for{" "}
          <span className="font-medium text-slate-700">
            {selectedPatient?.name ?? "the selected patient"}
          </span>{" "}
          has been saved as a pending appointment for clinician review.
        </p>
        <button
          onClick={() => navigate("/receptionist/dashboard")}
          className="w-full py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 font-medium transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-in fade-in duration-300">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book New Appointment</h1>
          <p className="text-slate-500 mt-1" style={{ fontSize: "0.875rem" }}>
            Schedule a general consultation or specialist visit
          </p>
        </div>
      </div>

      <div
        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        style={{ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
      >
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" style={{ fontSize: "0.875rem" }}>
              {apiError}
            </div>
          )}

          <section>
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-sky-500" />
              Patient Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.patientId ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-sky-400"
                  } bg-slate-50 focus:outline-none focus:ring-2 transition-all`}
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                {errors.patientId && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.patientId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contact Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="+998 90 123 45 67"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-500" />
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Appointment Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="appointmentType"
                  value={formData.appointmentType}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.appointmentType ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-sky-400"
                  } bg-slate-50 focus:outline-none focus:ring-2 transition-all`}
                >
                  <option value="">Select Appointment Type</option>
                  <option value="general_practice">General Practice Consultation</option>
                  <option value="specialist_consultation">Specialist Doctor Appointment</option>
                </select>
                {errors.appointmentType && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.appointmentType}
                  </p>
                )}
              </div>

              {formData.appointmentType === "specialist_consultation" && (
                <div className="md:col-span-2 animate-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Specialist Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.departmentId ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-sky-400"
                    } bg-slate-50 focus:outline-none focus:ring-2 transition-all`}
                  >
                    <option value="">Select Specialist Department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.departmentId}
                    </p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Doctor <span className="text-red-500">*</span>
                </label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  disabled={!formData.appointmentType}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.doctorId ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-sky-400"
                  } bg-slate-50 focus:outline-none focus:ring-2 transition-all disabled:bg-slate-100 disabled:text-slate-400`}
                >
                  <option value="">Select Doctor</option>
                  {filteredDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
                {errors.doctorId && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.doctorId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    min={today}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                      errors.appointmentDate ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-sky-400"
                    } bg-slate-50 focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {errors.appointmentDate && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.appointmentDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    disabled={!formData.appointmentDate || !formData.doctorId || slotsLoading}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                      errors.appointmentTime ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-sky-400"
                    } ${
                      !formData.appointmentDate || !formData.doctorId
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-slate-50"
                    } focus:outline-none focus:ring-2 appearance-none transition-all`}
                  >
                    <option value="">
                      {slotsLoading
                        ? "Loading slots..."
                        : formData.appointmentDate && formData.doctorId
                          ? "Select Time Slot"
                          : "Select doctor and date first"}
                    </option>
                    {availableTimeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.appointmentDate && formData.doctorId && !slotsLoading && availableTimeSlots.length === 0 && !errors.appointmentTime && (
                  <p className="text-amber-600 text-xs mt-1.5">
                    No available slots for this doctor on the selected date.
                  </p>
                )}
                {errors.appointmentTime && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.appointmentTime}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Notes / Reason for Visit{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Patient reported symptoms, requests, or additional context..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none transition-all"
                />
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-white rounded-lg font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
              style={{ backgroundColor: "#0EA5E9" }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = "#0284C7")}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = "#0EA5E9")}
            >
              <CheckCircle className="w-4 h-4" />
              {saving ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
