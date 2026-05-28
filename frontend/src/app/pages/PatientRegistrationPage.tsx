import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ArrowLeft, User, Phone, Heart, Shield, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createPatient, updatePatient } from '../services/patientService';

const steps = ['Personal Info', 'Contact Details', 'Medical Info', 'Insurance'];

const emptyForm = {
  firstName: '', lastName: '', dob: '', gender: '', email: '', phone: '', address: '', city: '', state: 'NY', zip: '',
  bloodType: '', allergies: '', emergencyContact: '', emergencyPhone: '', assignedDoctorId: '',
  insuranceProvider: '', policyNumber: '', groupNumber: '',
};

export function PatientRegistrationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const basePath = location.pathname.startsWith('/receptionist')
    ? '/receptionist'
    : location.pathname.startsWith('/clinician')
      ? '/clinician'
      : '/admin';
  const { doctors, patients, refreshData } = useApp();
  const isEdit = Boolean(id);
  const existing = isEdit ? patients.find(patient => patient.id === id) : null;

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!existing) return;

    const [firstName, ...rest] = existing.name.split(' ');
    setForm({
      ...emptyForm,
      firstName: firstName ?? '',
      lastName: rest.join(' '),
      dob: existing.dob,
      gender: existing.gender,
      email: existing.email,
      phone: existing.phone,
      address: existing.address,
      bloodType: existing.bloodType,
      allergies: existing.allergies.join(', '),
      emergencyContact: existing.emergencyContact,
      emergencyPhone: existing.emergencyPhone,
      assignedDoctorId: existing.assignedDoctorId,
      insuranceProvider: existing.insuranceProvider,
    });
  }, [existing]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < steps.length - 1) { setStep(s => s + 1); return; }
    setSaving(true);
    setError('');

    try {
      if (isEdit && id) {
        await updatePatient(id, form as any);
      } else {
        await createPatient(form);
      }
      await refreshData();
      setSubmitted(true);
      navigate(`${basePath}/patients`);
    } catch (err) {
      setError(err instanceof Error ? err.message : isEdit ? 'Unable to update patient' : 'Unable to register patient');
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-slate-900">{isEdit ? 'Patient Updated Successfully' : 'Patient Registered Successfully'}</h2>
        <p className="text-slate-500 mt-2" style={{ fontSize: '0.9rem' }}>Redirecting to patient registry...</p>
      </div>
    );
  }

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent";
  const labelCls = "block text-slate-700 mb-1.5";
  const selectCls = inputCls + " text-slate-700";

  return (
    <div>
      <button onClick={() => navigate(`${basePath}/patients`)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6" style={{ fontSize: '0.875rem' }}>
        <ArrowLeft className="w-4 h-4" />Back to Patients
      </button>

      <div className="mb-8">
        <h1 className="text-slate-900">{isEdit ? 'Edit Patient Record' : 'Register New Patient'}</h1>
        <p className="text-slate-500 mt-1" style={{ fontSize: '0.875rem' }}>
          {isEdit ? `Updating record for ${existing?.name ?? 'selected patient'}` : "Complete all sections to create the patient's medical record"}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}
                style={{ fontWeight: 600, fontSize: '0.8rem' }}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <p className={`mt-1.5 ${i === step ? 'text-sky-600' : i < step ? 'text-emerald-600' : 'text-slate-400'}`} style={{ fontSize: '0.72rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{s}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 mb-5 ${i < step ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" style={{ fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div>
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                <User className="w-4 h-4 text-sky-500" />
                <h3 className="text-slate-900">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>First Name *</label>
                  <input required value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="First name" className={inputCls} style={{ fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Last Name *</label>
                  <input required value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Last name" className={inputCls} style={{ fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Date of Birth *</label>
                  <input required type="date" value={form.dob} onChange={e => update('dob', e.target.value)} className={inputCls} style={{ fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Gender *</label>
                  <select required value={form.gender} onChange={e => update('gender', e.target.value)} className={selectCls} style={{ fontSize: '0.875rem' }}>
                    <option value="">Select gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Assigned Doctor *</label>
                  <select required value={form.assignedDoctorId} onChange={e => update('assignedDoctorId', e.target.value)} className={selectCls} style={{ fontSize: '0.875rem' }}>
                    <option value="">Select doctor...</option>
                    {doctors.filter(d => d.status === 'active').map(d => (
                      <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Contact Details */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                <Phone className="w-4 h-4 text-sky-500" />
                <h3 className="text-slate-900">Contact Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="patient@email.com" className={inputCls} style={{ fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Phone Number *</label>
                  <input required value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 (555) 000-0000" className={inputCls} style={{ fontSize: '0.875rem' }} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Street Address</label>
                  <input value={form.address} onChange={e => update('address', e.target.value)} placeholder="123 Main Street, Apt 4B" className={inputCls} style={{ fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>City</label>
                  <input value={form.city} onChange={e => update('city', e.target.value)} placeholder="New York" className={inputCls} style={{ fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>ZIP Code</label>
                  <input value={form.zip} onChange={e => update('zip', e.target.value)} placeholder="10001" className={inputCls} style={{ fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Emergency Contact Name *</label>
                  <input required value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)} placeholder="Full name" className={inputCls} style={{ fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Emergency Contact Phone *</label>
                  <input required value={form.emergencyPhone} onChange={e => update('emergencyPhone', e.target.value)} placeholder="+1 (555) 000-0000" className={inputCls} style={{ fontSize: '0.875rem' }} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Medical Info */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                <Heart className="w-4 h-4 text-sky-500" />
                <h3 className="text-slate-900">Medical Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Blood Type *</label>
                  <select required value={form.bloodType} onChange={e => update('bloodType', e.target.value)} className={selectCls} style={{ fontSize: '0.875rem' }}>
                    <option value="">Select blood type...</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Known Allergies</label>
                  <textarea
                    rows={3}
                    value={form.allergies}
                    onChange={e => update('allergies', e.target.value)}
                    placeholder="List known drug, food, or environmental allergies (comma separated)..."
                    className={inputCls + " resize-none"}
                    style={{ fontSize: '0.875rem' }}
                  />
                  <p className="text-slate-400 mt-1" style={{ fontSize: '0.75rem' }}>e.g. Penicillin, Latex, Peanuts</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Insurance */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                <Shield className="w-4 h-4 text-sky-500" />
                <h3 className="text-slate-900">Insurance Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Insurance Provider</label>
                  <input value={form.insuranceProvider} onChange={e => update('insuranceProvider', e.target.value)} placeholder="e.g. BlueCross Shield" className={inputCls} style={{ fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Policy Number</label>
                  <input value={form.policyNumber} onChange={e => update('policyNumber', e.target.value)} placeholder="Policy #" className={inputCls} style={{ fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>Group Number</label>
                  <input value={form.groupNumber} onChange={e => update('groupNumber', e.target.value)} placeholder="Group #" className={inputCls} style={{ fontSize: '0.875rem' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ fontWeight: 500, fontSize: '0.875rem' }}
          >
            Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-slate-400" style={{ fontSize: '0.8rem' }}>Step {step + 1} of {steps.length}</span>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-white transition-colors"
              style={{ backgroundColor: '#0EA5E9', fontWeight: 500, fontSize: '0.875rem' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0284C7')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0EA5E9')}
            >
              {saving ? 'Saving...' : step < steps.length - 1 ? 'Next Step' : isEdit ? 'Save Changes' : 'Register Patient'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
