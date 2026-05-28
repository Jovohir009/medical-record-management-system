import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { ArrowLeft, Save, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createDiagnosis, updateDiagnosis } from '../services/diagnosisService';

const icdSuggestions = [
  { code: 'I10', name: 'Essential Hypertension' },
  { code: 'E11.9', name: 'Type 2 Diabetes Mellitus' },
  { code: 'I25.10', name: 'Coronary Artery Disease' },
  { code: 'J45.30', name: 'Mild Persistent Asthma' },
  { code: 'G35', name: 'Multiple Sclerosis' },
  { code: 'M17.11', name: 'Primary Osteoarthritis of Right Knee' },
  { code: 'C34.10', name: 'Non-Small Cell Lung Cancer' },
  { code: 'I50.32', name: 'Chronic Systolic Heart Failure' },
  { code: 'I48.19', name: 'Atrial Fibrillation' },
  { code: 'F32.9', name: 'Major Depressive Disorder' },
  { code: 'N18.3', name: 'Chronic Kidney Disease, Stage 3' },
  { code: 'K21.0', name: 'Gastroesophageal Reflux Disease' },
];

export function DiagnosisFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { diagnoses, patients, doctors, refreshData } = useApp();
  const isEdit = Boolean(id) && id !== 'new';
  const existing = isEdit ? diagnoses.find(d => d.id === id) : null;
  const basePath = location.pathname.startsWith('/clinician') ? '/clinician' : '/admin';

  const [form, setForm] = useState({
    patientId: existing?.patientId ?? '',
    doctorId: existing?.doctorId ?? '',
    icdCode: existing?.icdCode ?? '',
    conditionName: existing?.conditionName ?? '',
    severity: existing?.severity ?? 'moderate',
    status: existing?.status ?? 'active',
    diagnosedDate: existing?.diagnosedDate ?? new Date().toISOString().split('T')[0],
    notes: existing?.notes ?? '',
  });
  const [icdSearch, setIcdSearch] = useState('');
  const [showIcdDropdown, setShowIcdDropdown] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const filteredIcd = icdSuggestions.filter(
    s => s.code.toLowerCase().includes(icdSearch.toLowerCase()) || s.name.toLowerCase().includes(icdSearch.toLowerCase())
  );

  const selectIcd = (code: string, name: string) => {
    update('icdCode', code);
    update('conditionName', name);
    setIcdSearch(code + ' — ' + name);
    setShowIcdDropdown(false);
  };

  const selectedPatient = patients.find(p => p.id === form.patientId);

  const handlePatientChange = (patientId: string) => {
    update('patientId', patientId);
    const patient = patients.find(p => p.id === patientId);
    if (patient) update('doctorId', patient.assignedDoctorId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setError('');

    try {
      if (isEdit && id) {
        await updateDiagnosis(id, form as any);
      } else {
        await createDiagnosis(form);
      }

      await refreshData();
      setSaved(true);
      navigate(`${basePath}/diagnoses`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save diagnosis');
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent";

  return (
    <div>
      <button onClick={() => navigate(`${basePath}/diagnoses`)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6" style={{ fontSize: '0.875rem' }}>
        <ArrowLeft className="w-4 h-4" />Back to Diagnoses
      </button>

      <div className="mb-8">
        <h1 className="text-slate-900">{isEdit ? 'Edit Diagnosis' : 'Add New Diagnosis'}</h1>
        <p className="text-slate-500 mt-1" style={{ fontSize: '0.875rem' }}>
          {isEdit ? `Editing: ${existing?.conditionName}` : 'Record a new clinical diagnosis and link it to a patient'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" style={{ fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Patient & Doctor */}
            <div className="bg-white rounded-xl border border-slate-200 p-6" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <h3 className="text-slate-900 mb-5 pb-4 border-b border-slate-100">Patient Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Patient *</label>
                  <select required value={form.patientId} onChange={e => handlePatientChange(e.target.value)} className={inputCls + " text-slate-700"} style={{ fontSize: '0.875rem' }}>
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Attending Physician</label>
                  <select value={form.doctorId} onChange={e => update('doctorId', e.target.value)} className={inputCls + " text-slate-700"} style={{ fontSize: '0.875rem' }}>
                    <option value="">Select doctor...</option>
                    {doctors.filter(d => d.status === 'active').map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
                  </select>
                  {selectedPatient && (
                    <p className="text-slate-400 mt-1" style={{ fontSize: '0.75rem' }}>Auto-filled from patient's assigned doctor</p>
                  )}
                </div>
              </div>
            </div>

            {/* ICD Code */}
            <div className="bg-white rounded-xl border border-slate-200 p-6" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <h3 className="text-slate-900 mb-5 pb-4 border-b border-slate-100">Clinical Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>ICD-10 Code Search *</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      placeholder="Search by code or condition name (e.g. I10, hypertension)..."
                      value={icdSearch}
                      onChange={e => { setIcdSearch(e.target.value); setShowIcdDropdown(true); }}
                      onFocus={() => setShowIcdDropdown(true)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                      style={{ fontSize: '0.875rem' }}
                    />
                    {showIcdDropdown && filteredIcd.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
                        {filteredIcd.slice(0, 6).map(s => (
                          <button
                            key={s.code}
                            type="button"
                            onClick={() => selectIcd(s.code, s.name)}
                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 last:border-b-0"
                          >
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-white flex-shrink-0" style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600 }}>{s.code}</span>
                            <span className="text-slate-700" style={{ fontSize: '0.8rem' }}>{s.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>ICD Code</label>
                    <input value={form.icdCode} onChange={e => update('icdCode', e.target.value)} placeholder="e.g. I10" className={inputCls} style={{ fontSize: '0.875rem', fontFamily: 'monospace' }} />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Condition Name *</label>
                    <input required value={form.conditionName} onChange={e => update('conditionName', e.target.value)} placeholder="Condition name" className={inputCls} style={{ fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Severity *</label>
                    <select required value={form.severity} onChange={e => update('severity', e.target.value)} className={inputCls + " text-slate-700"} style={{ fontSize: '0.875rem' }}>
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
                    <select value={form.status} onChange={e => update('status', e.target.value)} className={inputCls + " text-slate-700"} style={{ fontSize: '0.875rem' }}>
                      <option value="active">Active</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Date Diagnosed</label>
                    <input type="date" value={form.diagnosedDate} onChange={e => update('diagnosedDate', e.target.value)} className={inputCls} style={{ fontSize: '0.875rem' }} />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Clinical Notes</label>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={e => update('notes', e.target.value)}
                    placeholder="Document clinical findings, treatment plan, medications prescribed, and follow-up instructions..."
                    className={inputCls + " resize-none"}
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {form.icdCode && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                <p className="text-sky-800 mb-2" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Selected Diagnosis</p>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-white" style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 600 }}>{form.icdCode}</span>
                <p className="text-sky-700 mt-2" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{form.conditionName}</p>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl p-4" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <p className="text-slate-700 mb-3" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Severity Guide</p>
              {[
                { sev: 'Mild', color: 'bg-emerald-100 text-emerald-700', desc: 'Manageable with standard care' },
                { sev: 'Moderate', color: 'bg-amber-100 text-amber-700', desc: 'Requires active treatment' },
                { sev: 'Severe', color: 'bg-orange-100 text-orange-700', desc: 'Significant health impact' },
                { sev: 'Critical', color: 'bg-red-100 text-red-700', desc: 'Life-threatening, urgent care' },
              ].map(({ sev, color, desc }) => (
                <div key={sev} className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full ${color}`} style={{ fontSize: '0.7rem', fontWeight: 500 }}>{sev}</span>
                  <span className="text-slate-500" style={{ fontSize: '0.72rem' }}>{desc}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-white"
                style={{ backgroundColor: saved ? '#0D9488' : '#0EA5E9', fontWeight: 500, fontSize: '0.875rem' }}
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : isEdit ? 'Save Changes' : 'Record Diagnosis'}
              </button>
              <button type="button" onClick={() => navigate(`${basePath}/diagnoses`)} className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
