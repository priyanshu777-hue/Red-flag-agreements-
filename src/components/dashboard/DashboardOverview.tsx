import React from 'react';
import {
  Users,
  UserPlus,
  Clock,
  Briefcase,
  Send,
  FileCheck,
  Trophy,
  XCircle,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Lead, AgreementData, StaffUser, SystemNotification } from '../../types/crm';

interface DashboardOverviewProps {
  leads: Lead[];
  agreements: AgreementData[];
  staffList: StaffUser[];
  onSelectLead: (lead: Lead) => void;
  onOpenNewLead: () => void;
  onOpenNewAgreement: () => void;
  onNavigateToTab: (tab: 'leads' | 'agreements' | 'sign-portal' | 'reports') => void;
  notifications: SystemNotification[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  leads,
  agreements,
  staffList,
  onSelectLead,
  onOpenNewLead,
  onOpenNewAgreement,
  onNavigateToTab,
  notifications,
}) => {
  // KPI Calculations focused exclusively on Signed & Not Signed Agreements
  const signedAgreements = agreements.filter((a) => a.status === 'Signed');
  const notSignedAgreements = agreements.filter((a) => a.status !== 'Signed');
  const totalAgreements = agreements.length;

  const signedPercent = totalAgreements > 0 ? Math.round((signedAgreements.length / totalAgreements) * 100) : 0;
  const notSignedPercent = 100 - signedPercent;

  const kpiCards = [
    {
      title: 'Signed Agreements',
      value: signedAgreements.length.toString(),
      subtext: `${signedPercent}% Executed & Sealed`,
      icon: FileCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/50 border-emerald-800/60 ring-1 ring-emerald-500/20',
    },
    {
      title: 'Not Signed Agreements',
      value: notSignedAgreements.length.toString(),
      subtext: `${notSignedPercent}% Pending Client Entry / Signature`,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-950/50 border-amber-800/60 ring-1 ring-amber-500/20',
    },
    {
      title: 'Total Agreements Issued',
      value: totalAgreements.toString(),
      subtext: 'Master MOUs Generated',
      icon: FileCheck,
      color: 'text-red-400',
      bg: 'bg-zinc-900 border-zinc-800',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-red-500 tracking-wider uppercase bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-800/50">
              Red Flag Homes Executive
            </span>
            <span className="text-xs text-zinc-400">· Live Deals Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Sales Closing & Agreement Command Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Track properties, issue Listing & Property Management MOUs with 83/17 split, and capture digital signatures in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={onOpenNewLead}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-950/50 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Lead</span>
          </button>
          <button
            onClick={onOpenNewAgreement}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>Generate MOU</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border ${kpi.bg} backdrop-blur-sm transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-between shadow-xl`}
              onClick={() => onNavigateToTab('agreements')}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  {kpi.title}
                </span>
                <div className="text-2xl font-black text-white font-mono tabular-nums tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-xs font-medium text-zinc-300">
                  {kpi.subtext}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shrink-0">
                <Icon className={`w-7 h-7 ${kpi.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Signed vs Not Signed Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Executed & Signed Agreements */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Signed Agreements</h3>
                <p className="text-[11px] text-zinc-400">Digitally executed with audit seal & stamp</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800/50">
              {signedAgreements.length} Signed
            </span>
          </div>

          <div className="space-y-2.5">
            {signedAgreements.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs">
                No signed agreements yet.
              </div>
            ) : (
              signedAgreements.map((agr) => (
                <div
                  key={agr.id}
                  className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-3 hover:border-emerald-800/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-red-400">{agr.id}</span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                        Executed
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white mt-1">{agr.partyAName}</div>
                    <div className="text-[11px] text-zinc-400 truncate max-w-xs">{agr.propertyAddress}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-zinc-500 block">Signed At:</span>
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {agr.signedAt ? new Date(agr.signedAt).toLocaleDateString('en-IN') : 'Recently'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel 2: Not Signed / Pending Agreements */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60 flex items-center justify-center font-bold">
                !
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Not Signed Agreements</h3>
                <p className="text-[11px] text-zinc-400">Awaiting client details or hand signature</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-800/50">
              {notSignedAgreements.length} Not Signed
            </span>
          </div>

          <div className="space-y-2.5">
            {notSignedAgreements.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs">
                All issued agreements are signed!
              </div>
            ) : (
              notSignedAgreements.map((agr) => (
                <div
                  key={agr.id}
                  className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-3 hover:border-amber-800/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-red-400">{agr.id}</span>
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800/40">
                        {agr.status}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white mt-1">{agr.partyAName}</div>
                    <div className="text-[11px] text-zinc-400 truncate max-w-xs">{agr.propertyAddress}</div>
                  </div>

                  <a
                    href={agr.publicSignUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow shrink-0"
                  >
                    <span>Sign Link</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
