import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, Edit2, Eye, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Doctor } from '../types/domain';
import { deleteDoctor, getDoctor } from '../services/specialistService';

const statusStyles: Record<Doctor['status'], { label: string; class: string }> = {
  active: { label: 'Active', class: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: 'Inactive', class: 'bg-slate-100 text-slate-500' },
  'on-leave': { label: 'On Leave', class: 'bg-amber-100 text-amber-700' },
};

export function DoctorsPage() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { doctors, departments, user, refreshData } = useApp();
  const isAdmin = user?.role === 'administrator';
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loadingDoctorId, setLoadingDoctorId] = useState('');
  const [deletingDoctorId, setDeletingDoctorId] = useState('');
  const [actionError, setActionError] = useState('');

  const filtered = doctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || d.department === deptFilter;
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name ?? id;

  const viewDoctor = async (id: string) => {
    setLoadingDoctorId(id);
    setActionError('');

    try {
      setSelectedDoctor(await getDoctor(id));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to load doctor details');
    } finally {
      setLoadingDoctorId('');
    }
  };

  const removeDoctor = async (doctor: Doctor) => {
    if (!window.confirm(`Delete ${doctor.name}? This action cannot be undone.`)) return;

    setDeletingDoctorId(doctor.id);
    setActionError('');

    try {
      await deleteDoctor(doctor.id);
      await refreshData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to delete doctor');
    } finally {
      setDeletingDoctorId('');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900">Doctors</h1>
          <p className="text-slate-500 mt-1" style={{ fontSize: '0.875rem' }}>{doctors.length} medical professionals registered</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate('/admin/doctors/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#0EA5E9', fontSize: '0.875rem', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0284C7')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0EA5E9')}
          >
            <Plus className="w-4 h-4" />
            Add Doctor
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 flex flex-wrap gap-3" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
            style={{ fontSize: '0.875rem' }}
          />
        </div>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
          style={{ fontSize: '0.875rem' }}
        >
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
          style={{ fontSize: '0.875rem' }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on-leave">On Leave</option>
        </select>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" style={{ fontSize: '0.875rem' }}>
          {actionError}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {['Doctor', 'Department', 'Contact', 'Patients', 'License No.', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3.5 text-left text-slate-500" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((doctor) => (
              <tr key={doctor.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: doctor.avatarColor + '20' }}>
                      <span style={{ color: doctor.avatarColor, fontSize: '0.7rem', fontWeight: 700 }}>{doctor.initials}</span>
                    </div>
                    <div>
                      <p className="text-slate-900" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{doctor.name}</p>
                      <p className="text-slate-500" style={{ fontSize: '0.78rem' }}>{doctor.specialty}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600" style={{ fontSize: '0.875rem' }}>{getDeptName(doctor.department)}</td>
                <td className="px-6 py-4">
                  <p className="text-slate-600" style={{ fontSize: '0.8rem' }}>{doctor.email}</p>
                  <p className="text-slate-400" style={{ fontSize: '0.78rem' }}>{doctor.phone}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-900" style={{ fontSize: '0.875rem', fontWeight: 600 }}>{doctor.patientsCount}</span>
                  <span className="text-slate-400 ml-1" style={{ fontSize: '0.78rem' }}>pts</span>
                </td>
                <td className="px-6 py-4 text-slate-500" style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{doctor.licenseNumber}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full ${statusStyles[doctor.status].class}`} style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    {statusStyles[doctor.status].label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => viewDoctor(doctor.id)}
                      disabled={loadingDoctorId === doctor.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-500 hover:bg-teal-50 transition-all disabled:opacity-50"
                      title="View Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => navigate(`/admin/doctors/${doctor.id}/edit`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeDoctor(doctor)}
                          disabled={deletingDoctorId === doctor.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-400" style={{ fontSize: '0.9rem' }}>No doctors found matching your criteria.</p>
          </div>
        )}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-slate-500" style={{ fontSize: '0.8rem' }}>Showing {filtered.length} of {doctors.length} doctors</p>
        </div>
      </div>
      {selectedDoctor && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-2xl overflow-hidden" style={{ boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.15)' }}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-slate-900">{selectedDoctor.name}</h3>
                <p className="text-slate-500 mt-0.5" style={{ fontSize: '0.82rem' }}>{selectedDoctor.specialty}</p>
              </div>
              <button onClick={() => setSelectedDoctor(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['Department', selectedDoctor.departmentName || getDeptName(selectedDoctor.department)],
                ['Email', selectedDoctor.email],
                ['Phone', selectedDoctor.phone || 'Not provided'],
                ['License No.', selectedDoctor.licenseNumber],
                ['Status', statusStyles[selectedDoctor.status].label],
                ['Joined', selectedDoctor.joinedDate || 'Not recorded'],
                ['Assigned Patients', String(selectedDoctor.patientsCount)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                  <p className="text-slate-400" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>{label}</p>
                  <p className="text-slate-800 mt-1" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{value}</p>
                </div>
              ))}
              <div className="md:col-span-2 rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-slate-400" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Bio</p>
                <p className="text-slate-700 mt-1" style={{ fontSize: '0.9rem' }}>{selectedDoctor.bio || 'No bio recorded.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
