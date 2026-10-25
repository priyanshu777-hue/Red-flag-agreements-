import React from 'react';
import { Shield, Users, Lock, CheckCircle2, XCircle, Plus, Mail } from 'lucide-react';
import { StaffUser, Role } from '../../types/crm';

interface StaffSettingsProps {
  staffList: StaffUser[];
  currentUser: StaffUser;
}

export const StaffSettings: React.FC<StaffSettingsProps> = ({
  staffList,
  currentUser,
}) => {
  const permissionsMatrix = [
    { feature: 'View Dashboard & Leads', Admin: true, 'Sales Manager': true, 'Sales Executive': true, Viewer: true },
    { feature: 'Add & Edit Property Leads', Admin: true, 'Sales Manager': true, 'Sales Executive': true, Viewer: false },
    { feature: 'Delete Property Leads', Admin: true, 'Sales Manager': true, 'Sales Executive': false, Viewer: false },
    { feature: 'Generate Digital MOU Agreements', Admin: true, 'Sales Manager': true, 'Sales Executive': true, Viewer: false },
    { feature: 'Send E-Sign Links & Reminders', Admin: true, 'Sales Manager': true, 'Sales Executive': true, Viewer: false },
    { feature: 'View Full Audit Certificates', Admin: true, 'Sales Manager': true, 'Sales Executive': true, Viewer: true },
    { feature: 'Export CSV Reports & Excel', Admin: true, 'Sales Manager': true, 'Sales Executive': false, Viewer: false },
    { feature: 'Manage Staff Roles & System Settings', Admin: true, 'Sales Manager': false, 'Sales Executive': false, Viewer: false },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">Staff Accounts & RBAC Permissions</h1>
          <p className="text-xs text-zinc-400">
            Role-based access control matrix for Admin, Sales Manager, Sales Executive, and Viewer.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3.5 py-2 rounded-xl text-xs text-zinc-300">
          <Shield className="w-4 h-4 text-red-500" />
          <span>Active Session Role: <strong className="text-white font-mono">{currentUser.role}</strong></span>
        </div>
      </div>

      {/* Staff Team Roster */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
          Red Flag Homes Staff Roster ({staffList.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {staffList.map((user) => (
            <div
              key={user.id}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3.5"
            >
              <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover ring-1 ring-zinc-700" />
              <div className="space-y-0.5 truncate">
                <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                <span className="inline-block bg-red-950 text-red-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-red-800/40">
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Permission Matrix */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
          Role Permission Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">System Capability</th>
                <th className="py-3 px-4 text-center">Admin</th>
                <th className="py-3 px-4 text-center">Sales Manager</th>
                <th className="py-3 px-4 text-center">Sales Executive</th>
                <th className="py-3 px-4 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {permissionsMatrix.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-zinc-200">{row.feature}</td>
                  {(['Admin', 'Sales Manager', 'Sales Executive', 'Viewer'] as Role[]).map((r) => (
                    <td key={r} className="py-3 px-4 text-center">
                      {row[r] ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-zinc-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
