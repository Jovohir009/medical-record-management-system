import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, User, Mail, Phone, Award, Building2, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createDoctor, updateDoctor } from '../services/specialistService';

export function DoctorFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctors, departments, refreshData } = useApp();
  const isEdit = Boolean(id);
  const existing = isEdit ? doctors.find(d => d.id === id) : null;

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    email: existing?.email ?? '',
    phone: existing?.phone ?? '',
    specialty: existing?.specialty ?? '',
    department: existing?.department ?? '',
    licenseNumber: existing?.licenseNumber ?? '',
    status: existing?.status ?? 'active',
    bio: existing?.bio ?? '',
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setError('');

    try {
      if (isEdit && id) {
        await updateDoctor(id, form as any);
      } else {
        await createDoctor(form);
      }

      await refreshData();
      setSaved(true);
      navigate('/admin/doctors');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save doctor');
    }
  };

  const specialties = ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics', 'Radiology', 'General Practice', 'Emergency Medicine', 'Internal Medicine', 'Dermatology'];

  return (
    <div>
      <button
        onClick={() => navigate('/admin/doctors')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        style={{ fontSize: '0.875rem' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Doctors
      </button>

      <div className="mb-8">
        <h1 className="text-slate-900">{isEdit ? 'Edit Doctor Profile' : 'Add New Doctor'}</h1>
        <p className="text-slate-500 mt-1" style={{ fontSize: '0.875rem' }}>
          {isEdit ? `Editing record for ${existing?.name}` : 'Register a new medical professional in the system'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" style={{ fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="xl:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-slate-200 p-6" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                <User className="w-4 h-4 text-sky-500" />
                <h3 className="text-slate-900">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name <span className="text-red-500">*</span></label>
                  <input
                    required
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="e.g. Dr. Jane Smith"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    <Mail className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="doctor@caretrack.clinic"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    <Phone className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />Phone Number
                  </label>
                  <input
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-white rounded-xl border border-slate-200 p-6" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                <Award className="w-4 h-4 text-teal-500" />
                <h3 className="text-slate-900">Professional Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Specialty <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={form.specialty}
                    onChange={e => update('specialty', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <option value="">Select specialty...</option>
                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    <Building2 className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.department}
                    onChange={e => update('department', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <option value="">Select department...</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    <FileText className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.licenseNumber}
                    onChange={e => update('licenseNumber', e.target.value)}
                    placeholder="MD-NY-000000"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                    style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
                  <select
                    value={form.status}
                    onChange={e => update('status', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Professional Biography</label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={e => update('bio', e.target.value)}
                    placeholder="Brief professional background, specializations, and experience..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent resize-none"
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Panel */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <h4 className="text-slate-900 mb-4">Preview</h4>
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mb-3">
                  <span className="text-sky-600" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {form.name ? form.name.split(' ').map(w => w[0]).slice(0, 2).join('') : '?'}
                  </span>
                </div>
                <p className="text-slate-900" style={{ fontWeight: 600 }}>{form.name || 'Doctor Name'}</p>
                <p className="text-slate-500 mt-0.5" style={{ fontSize: '0.8rem' }}>{form.specialty || 'Specialty'}</p>
                {form.department && (
                  <span className="mt-2 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-600" style={{ fontSize: '0.75rem' }}>
                    {departments.find(d => d.id === form.department)?.name}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Important</p>
              <p className="text-amber-700 mt-1" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                Verify the license number with the state medical board before activating this doctor's account.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-white transition-colors"
                style={{ backgroundColor: saved ? '#0D9488' : '#0EA5E9', fontWeight: 500, fontSize: '0.875rem' }}
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : isEdit ? 'Save Changes' : 'Create Doctor'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/doctors')}
                className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                style={{ fontWeight: 500, fontSize: '0.875rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
