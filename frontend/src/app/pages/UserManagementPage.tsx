import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { updateUser as saveUser } from '../services/userService';
import { SystemUser as User } from '../types/domain';

const roleStyles: Record<User['role'], { label: string; class: string }> = {
  administrator: { label: 'Administrator', class: 'bg-sky-100 text-sky-700' },
  clinician: { label: 'Clinician', class: 'bg-teal-100 text-teal-700' },
  receptionist: { label: 'Receptionist', class: 'bg-amber-100 text-amber-700' },
};

const permissionMap: Record<User['role'], string[]> = {
  administrator: ['Full System Access', 'User Management', 'Audit Logs', 'CRUD All Records', 'System Settings'],
  clinician: ['View/Edit Patients', 'Manage Diagnoses', 'Clinical Records', 'Patient Timelines'],
  receptionist: ['Patient Registration', 'Appointment Scheduling', 'Basic Lookups', 'Doctor Availability'],
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatLogin(d: string) {
  const date = new Date(d);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { users, refreshData } = useApp();
  const [userList, setUserList] = useState(users);

  useEffect(() => {
    setUserList(users);
  }, [users]);

  const toggleStatus = async (userId: string) => {
    const target = userList.find(u => u.id === userId);
    if (!target) return;
    const status = target.status === 'active' ? 'inactive' : 'active';
    setUserList(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    await saveUser(userId, { status });
    await refreshData();
  };

  const filtered = userList.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const counts = {
    total: userList.length,
    admin: userList.filter(u => u.role === 'administrator').length,
    clinician: userList.filter(u => u.role === 'clinician').length,
    receptionist: userList.filter(u => u.role === 'receptionist').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1" style={{ fontSize: '0.875rem' }}>{counts.total} system accounts — manage roles and access permissions</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white"
          style={{ backgroundColor: '#0EA5E9', fontSize: '0.875rem', fontWeight: 500 }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0284C7')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0EA5E9')}
        >
          <Plus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { role: 'administrator' as const, count: counts.admin, desc: 'Full system control' },
          { role: 'clinician' as const, count: counts.clinician, desc: 'Clinical workflows' },
          { role: 'receptionist' as const, count: counts.receptionist, desc: 'Intake & scheduling' },
        ].map(({ role, count, desc }) => (
          <button
            key={role}
            onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
            className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${roleFilter === role ? 'border-sky-300 ring-1 ring-sky-200' : 'border-slate-200'}`}
            style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
          >
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full ${roleStyles[role].class}`} style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                {roleStyles[role].label}
              </span>
              <span className="text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{count}</span>
            </div>
            <p className="text-slate-500 mt-2" style={{ fontSize: '0.78rem' }}>{desc}</p>
            <div className="mt-3">
              <p className="text-slate-400 mb-1.5" style={{ fontSize: '0.7rem', fontWeight: 500 }}>Permissions:</p>
              <div className="flex flex-wrap gap-1">
                {permissionMap[role].slice(0, 2).map(p => (
                  <span key={p} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded" style={{ fontSize: '0.65rem' }}>{p}</span>
                ))}
                {permissionMap[role].length > 2 && (
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded" style={{ fontSize: '0.65rem' }}>+{permissionMap[role].length - 2} more</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 flex flex-wrap gap-3" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
            style={{ fontSize: '0.875rem' }}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400" style={{ fontSize: '0.875rem' }}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {['User', 'Role', 'Permissions', 'Last Login', 'Member Since', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3.5 text-left text-slate-500" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: u.status === 'inactive' ? '#F1F5F9' : u.avatarColor + '20' }}
                    >
                      <span style={{ color: u.status === 'inactive' ? '#94A3B8' : u.avatarColor, fontSize: '0.65rem', fontWeight: 700 }}>{u.initials}</span>
                    </div>
                    <div>
                      <p className={`${u.status === 'inactive' ? 'text-slate-400' : 'text-slate-900'}`} style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.name}</p>
                      <p className="text-slate-400" style={{ fontSize: '0.75rem' }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full ${roleStyles[u.role].class}`} style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    {roleStyles[u.role].label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {permissionMap[u.role].slice(0, 2).map(p => (
                      <span key={p} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded" style={{ fontSize: '0.65rem' }}>{p}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500" style={{ fontSize: '0.8rem' }}>{formatLogin(u.lastLogin)}</td>
                <td className="px-6 py-4 text-slate-500" style={{ fontSize: '0.8rem' }}>{formatDate(u.createdDate)}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleStatus(u.id)}
                    className="flex items-center gap-2 transition-colors group"
                  >
                    {u.status === 'active' ? (
                      <ToggleRight className="w-6 h-6 text-emerald-500 group-hover:text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300 group-hover:text-slate-400" />
                    )}
                    <span className={u.status === 'active' ? 'text-emerald-600' : 'text-slate-400'} style={{ fontSize: '0.78rem', fontWeight: 500 }}>
                      {u.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-400" style={{ fontSize: '0.9rem' }}>No users found.</p>
          </div>
        )}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
          <p className="text-slate-500" style={{ fontSize: '0.8rem' }}>Showing {filtered.length} of {userList.length} users</p>
        </div>
      </div>
    </div>
  );
}
