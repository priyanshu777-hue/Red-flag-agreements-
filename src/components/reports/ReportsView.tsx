import React from 'react';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Award,
  Users,
  Calendar,
  FileCheck,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { Lead, AgreementData, StaffUser } from '../../types/crm';

interface ReportsViewProps {
  leads: Lead[];
  agreements: AgreementData[];
  staffList: StaffUser[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  leads,
  agreements,
  staffList,
}) => {
  const totalRevenue = leads
    .filter((l) => l.stage === 'Signed' || l.stage === 'Onboarded')
    .reduce((sum, l) => sum + (l.expectedRevenue || 0) * 12, 0);

  const pendingAgreements = agreements.filter((a) => a.status === 'Awaiting Signature' || a.status === 'Viewed');
  const signedAgreements = agreements.filter((a) => a.status === 'Signed');

  // Export to CSV Function
  const exportToCSV = () => {
    const headers = ['Lead ID', 'Owner Name', 'Mobile', 'Email', 'City', 'Property Address', 'Stage', 'Revenue (INR)'];
    const rows = leads.map((l) => [
      l.id,
      `"${l.fullName}"`,
      `"${l.mobileNumber}"`,
      `"${l.email}"`,
      `"${l.city}"`,
      `"${l.propertyAddress}"`,
      `"${l.stage}"`,
      l.expectedRevenue,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Red_Flag_Homes_Leads_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">Sales Analytics & Revenue Reports</h1>
          <p className="text-xs text-zinc-400">
            Executive performance, conversion funnels, and contract closing metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-red-950 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-zinc-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Annual Contract Revenue</span>
          <div className="text-xl font-extrabold font-mono text-emerald-400">
            ₹{(totalRevenue / 100000).toFixed(1)} Lakhs
          </div>
          <p className="text-[10px] text-zinc-500">Based on closed MOUs</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Avg Closing Speed</span>
          <div className="text-xl font-extrabold font-mono text-white">4.2 Days</div>
          <p className="text-[10px] text-emerald-400">↓ 1.5 days faster than Q2</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">MOU Conversion Rate</span>
          <div className="text-xl font-extrabold font-mono text-red-400">68.4%</div>
          <p className="text-[10px] text-zinc-500">Lead-to-Signed Agreement</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Active MOUs Executed</span>
          <div className="text-xl font-extrabold font-mono text-blue-400">{signedAgreements.length}</div>
          <p className="text-[10px] text-zinc-500">{pendingAgreements.length} pending client sign</p>
        </div>
      </div>

      {/* Executive Performance Detailed Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Sales Executive Performance Breakdown</h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Ranked by Annual Revenue Closed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Sales Executive</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Deals Closed</th>
                <th className="py-3 px-4">Total Revenue</th>
                <th className="py-3 px-4">Conversion Rate</th>
                <th className="py-3 px-4 text-right">Avg Cycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-2 font-bold text-white">
                    <img src={staff.avatar} className="w-6 h-6 rounded-md object-cover" />
                    <span>{staff.name}</span>
                  </td>
                  <td className="py-3 px-4 text-zinc-400">{staff.role}</td>
                  <td className="py-3 px-4 font-mono font-bold text-zinc-200">{staff.totalClosed}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    ₹{(staff.totalRevenue / 100000).toFixed(1)}L
                  </td>
                  <td className="py-3 px-4 font-mono text-red-400">72.1%</td>
                  <td className="py-3 px-4 font-mono text-right text-zinc-300">3.8 Days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
