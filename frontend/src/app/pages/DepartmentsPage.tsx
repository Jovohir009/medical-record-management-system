import { Building2, Users, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function DepartmentsPage() {
  const { departments, doctors } = useApp();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-slate-900">Departments</h1>
        <p className="text-slate-500 mt-1" style={{ fontSize: '0.875rem' }}>{departments.length} clinical departments across all wings</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Departments', value: departments.length },
          { label: 'Total Doctors', value: doctors.length },
          { label: 'Active Doctors', value: doctors.filter(d => d.status === 'active').length },
          { label: 'Avg. Doctors / Dept', value: (doctors.length / departments.length).toFixed(1) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <p className="text-slate-500" style={{ fontSize: '0.78rem', fontWeight: 500 }}>{label}</p>
            <p className="text-slate-900 mt-1" style={{ fontSize: '1.6rem', fontWeight: 700 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {departments.map(dept => {
          const deptDoctors = doctors.filter(d => d.department === dept.id);
          const activeDoctors = deptDoctors.filter(d => d.status === 'active');

          return (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
            >
              {/* Color Bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: dept.color }} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: dept.color + '15' }}>
                      <Building2 className="w-5 h-5" style={{ color: dept.color }} />
                    </div>
                    <div>
                      <h3 className="text-slate-900">{dept.name}</h3>
                      <p className="text-slate-500 mt-0.5" style={{ fontSize: '0.78rem' }}>Dept. Head: {dept.head}</p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-slate-500 mb-4" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{dept.description}</p>

                {/* Doctor Count */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-slate-900" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{dept.doctorCount}</p>
                    <p className="text-slate-500" style={{ fontSize: '0.72rem', fontWeight: 500 }}>Total</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <p className="text-emerald-600" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{activeDoctors.length}</p>
                    <p className="text-slate-500" style={{ fontSize: '0.72rem', fontWeight: 500 }}>Active</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="flex-1">
                    <div className="flex -space-x-1.5">
                      {deptDoctors.slice(0, 4).map(doc => (
                        <div
                          key={doc.id}
                          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center"
                          style={{ backgroundColor: doc.avatarColor + '25' }}
                          title={doc.name}
                        >
                          <span style={{ color: doc.avatarColor, fontSize: '0.6rem', fontWeight: 700 }}>{doc.initials}</span>
                        </div>
                      ))}
                      {deptDoctors.length > 4 && (
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                          <span className="text-slate-500" style={{ fontSize: '0.6rem', fontWeight: 600 }}>+{deptDoctors.length - 4}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.65rem' }}>Physicians</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500" style={{ fontSize: '0.78rem' }}>
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    {dept.location}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500" style={{ fontSize: '0.78rem' }}>
                    <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    {dept.phone}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500" style={{ fontSize: '0.78rem' }}>
                    <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    {dept.email}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
