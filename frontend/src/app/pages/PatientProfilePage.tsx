import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Phone, Mail, MapPin, Heart, AlertTriangle, Plus, Calendar, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPatient } from '../services/patientService';
import { Patient } from '../types/domain';

const severityStyles = {
  mild: { class: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400', timelineDot: 'bg-emerald-400', label: 'Mild' },
  moderate: { class: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400', timelineDot: 'bg-amber-400', label: 'Moderate' },
  severe: { class: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400', timelineDot: 'bg-orange-500', label: 'Severe' },
  critical: { class: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', timelineDot: 'bg-red-500', label: 'Critical' },
};

const statusStyles = {
  active: 'bg-sky-100 text-sky-700',
  resolved: 'bg-slate-100 text-slate-500',
  monitoring: 'bg-violet-100 text-violet-700',
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-slate-400" style={{ fontSize: '0.72rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
        <p className="text-slate-700" style={{ fontSize: '0.875rem' }}>{value}</p>
      </div>
    </div>
  );
}

function calcAge(dob: string) {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, patients, doctors, diagnoses } = useApp();
  const [fetchedPatient, setFetchedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const patient = fetchedPatient ?? patients.find(p => p.id === id);
  const basePath = user?.role === 'clinician' ? '/clinician' : user?.role === 'receptionist' ? '/receptionist' : '/admin';

  useEffect(() => {
    if (!id) return;

    let active = true;
    setLoading(true);

    getPatient(id)
      .then(patient => {
        if (active) setFetchedPatient(patient);
      })
      .catch(() => {
        if (active) setFetchedPatient(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading && !patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <p className="text-slate-500">Loading patient profile...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <p className="text-slate-500">Patient not found.</p>
        <button onClick={() => navigate(`${basePath}/patients`)} className="mt-4 text-sky-500 hover:underline" style={{ fontSize: '0.875rem' }}>Back to Patients</button>
      </div>
    );
  }

  const doctor = doctors.find(d => d.id === patient.assignedDoctorId);
  const patientDiagnoses = diagnoses.filter(d => d.patientId === patient.id).sort(
    (a, b) => new Date(b.diagnosedDate).getTime() - new Date(a.diagnosedDate).getTime()
  );

  const patientStatus = patient.status === 'critical'
    ? { label: 'Critical', class: 'bg-red-100 text-red-700' }
    : patient.status === 'discharged'
    ? { label: 'Discharged', class: 'bg-slate-100 text-slate-500' }
    : { label: 'Active', class: 'bg-emerald-100 text-emerald-700' };

  return (
    <div>
      <button onClick={() => navigate(`${basePath}/patients`)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6" style={{ fontSize: '0.875rem' }}>
        <ArrowLeft className="w-4 h-4" />Back to Patients
      </button>

      {/* Patient Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div className="flex flex-wrap items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <span className="text-slate-500" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              {patient.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-slate-900">{patient.name}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${patientStatus.class}`} style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                {patientStatus.label}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-white" style={{ backgroundColor: '#0EA5E9', fontSize: '0.75rem', fontWeight: 600 }}>
                {patient.bloodType}
              </span>
            </div>
            <p className="text-slate-500 mt-1" style={{ fontSize: '0.875rem' }}>
              {patient.gender} - {calcAge(patient.dob)} years old - DOB: {formatDate(patient.dob)}
            </p>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>Patient ID: #{patient.id.toUpperCase()}</p>
          </div>
          <div className="flex gap-2">
            {patient.status === 'critical' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-red-600" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Critical - Immediate Attention Required</span>
              </div>
            )}
            {user?.role === 'administrator' && (
              <button
                onClick={() => navigate(`${basePath}/diagnoses/new`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#0EA5E9', fontSize: '0.8rem', fontWeight: 500 }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Diagnosis
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Info Cards */}
        <div className="space-y-5">
          {/* Contact */}
          <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <h4 className="text-slate-900 mb-4 pb-3 border-b border-slate-100">Contact Information</h4>
            <div className="space-y-3.5">
              <InfoRow icon={Mail} label="Email" value={patient.email} />
              <InfoRow icon={Phone} label="Phone" value={patient.phone} />
              <InfoRow icon={MapPin} label="Address" value={patient.address} />
              <div className="pt-2 border-t border-slate-100">
                <InfoRow icon={Phone} label="Emergency Contact" value={`${patient.emergencyContact} - ${patient.emergencyPhone}`} />
              </div>
            </div>
          </div>

          {/* Medical */}
          <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <h4 className="text-slate-900 mb-4 pb-3 border-b border-slate-100">Medical Details</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500" style={{ fontSize: '0.8rem' }}>Blood Type</span>
                <span className="px-2.5 py-0.5 rounded-lg text-white" style={{ backgroundColor: '#0EA5E9', fontSize: '0.75rem', fontWeight: 600 }}>{patient.bloodType}</span>
              </div>
              <div>
                <span className="text-slate-500" style={{ fontSize: '0.8rem' }}>Known Allergies</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {patient.allergies.length > 0 ? patient.allergies.map(a => (
                    <span key={a} className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100" style={{ fontSize: '0.72rem', fontWeight: 500 }}>{a}</span>
                  )) : <span className="text-slate-400" style={{ fontSize: '0.8rem' }}>No known allergies</span>}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500" style={{ fontSize: '0.8rem' }}>Insurance</span>
                <span className="text-slate-700" style={{ fontSize: '0.8rem' }}>{patient.insuranceProvider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500" style={{ fontSize: '0.8rem' }}>Registered</span>
                <span className="text-slate-700" style={{ fontSize: '0.8rem' }}>{formatDate(patient.registeredDate)}</span>
              </div>
            </div>
          </div>

          {/* Assigned Doctor */}
          {doctor && (
            <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <h4 className="text-slate-900 mb-4 pb-3 border-b border-slate-100">Assigned Physician</h4>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: doctor.avatarColor + '20' }}>
                  <span style={{ color: doctor.avatarColor, fontSize: '0.8rem', fontWeight: 700 }}>{doctor.initials}</span>
                </div>
                <div>
                  <p className="text-slate-900" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{doctor.name}</p>
                  <p className="text-slate-500" style={{ fontSize: '0.78rem' }}>{doctor.specialty}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-emerald-600" style={{ fontSize: '0.72rem' }}>Available</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <p className="text-slate-500 flex items-center gap-2" style={{ fontSize: '0.78rem' }}>
                  <Mail className="w-3 h-3" />{doctor.email}
                </p>
                <p className="text-slate-500 flex items-center gap-2" style={{ fontSize: '0.78rem' }}>
                  <Phone className="w-3 h-3" />{doctor.phone}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Diagnosis Timeline */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-slate-900">Diagnosis Timeline</h3>
                <p className="text-slate-500 mt-0.5" style={{ fontSize: '0.8rem' }}>{patientDiagnoses.length} recorded condition{patientDiagnoses.length !== 1 ? 's' : ''}</p>
              </div>
              <Heart className="w-5 h-5 text-slate-300" />
            </div>

            {patientDiagnoses.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400" style={{ fontSize: '0.9rem' }}>No diagnoses recorded yet.</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-100" />
                <div className="space-y-6">
                  {patientDiagnoses.map((diag) => {
                    const sev = severityStyles[diag.severity];
                    const diagDoctor = doctors.find(d => d.id === diag.doctorId);
                    return (
                      <div key={diag.id} className="flex gap-4 relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-white`} style={{ backgroundColor: sev.timelineDot + '20' }}>
                          <div className={`w-3 h-3 rounded-full ${sev.timelineDot}`} />
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-colors">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-white" style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600 }}>
                                  {diag.icdCode}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full border ${sev.class}`} style={{ fontSize: '0.72rem', fontWeight: 500 }}>
                                  {sev.label}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full ${statusStyles[diag.status]}`} style={{ fontSize: '0.72rem', fontWeight: 500, textTransform: 'capitalize' }}>
                                  {diag.status}
                                </span>
                              </div>
                              <p className="text-slate-900" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{diag.conditionName}</p>
                              <p className="text-slate-500 mt-1.5" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{diag.notes}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="flex items-center gap-1 text-slate-400" style={{ fontSize: '0.75rem' }}>
                                <Calendar className="w-3 h-3" />
                                {formatDate(diag.diagnosedDate)}
                              </div>
                              {diagDoctor && (
                                <div className="flex items-center gap-1 text-slate-400 mt-1" style={{ fontSize: '0.75rem' }}>
                                  <User className="w-3 h-3" />
                                  {diagDoctor.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
