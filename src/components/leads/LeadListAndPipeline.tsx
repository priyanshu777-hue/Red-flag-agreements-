import React, { useState } from 'react';
import {
  Kanban,
  Table as TableIcon,
  Search,
  Plus,
  Filter,
  FileSignature,
  MessageSquare,
  Phone,
  ChevronRight,
  MoreHorizontal,
  Building,
  User,
  ExternalLink,
  ArrowUpDown,
} from 'lucide-react';
import { Lead, LeadStage, StaffUser } from '../../types/crm';

interface LeadListAndPipelineProps {
  leads: Lead[];
  staffList: StaffUser[];
  onSelectLead: (lead: Lead) => void;
  onOpenNewLeadModal: () => void;
  onOpenAgreementForLead: (lead: Lead) => void;
  onUpdateLeadStage: (leadId: string, newStage: LeadStage) => void;
}

export const LeadListAndPipeline: React.FC<LeadListAndPipelineProps> = ({
  leads,
  staffList,
  onSelectLead,
  onOpenNewLeadModal,
  onOpenAgreementForLead,
  onUpdateLeadStage,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedExecutive, setSelectedExecutive] = useState<string>('ALL');

  const stages: LeadStage[] = [
    'New Lead',
    'Contacted',
    'Interested',
    'Meeting Scheduled',
    'Negotiation',
    'Agreement Sent',
    'Signed',
    'Onboarded',
    'Lost',
  ];

  const cities = Array.from(new Set(leads.map((l) => l.city))).filter(Boolean);

  // Filtering
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.mobileNumber.includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = selectedStage === 'ALL' || lead.stage === selectedStage;
    const matchesCity = selectedCity === 'ALL' || lead.city === selectedCity;
    const matchesExec = selectedExecutive === 'ALL' || lead.salesExecutiveId === selectedExecutive;

    return matchesSearch && matchesStage && matchesCity && matchesExec;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl shadow-lg">
        {/* Left: Title & Mode Switcher */}
        <div className="flex items-center justify-between lg:justify-start gap-4">
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">Lead Pipeline & CRM</h1>
            <p className="text-xs text-zinc-400">
              Showing <strong className="text-white font-mono">{filteredLeads.length}</strong> of {leads.length} total properties
            </p>
          </div>

          {/* Kanban / Table Segmented Button */}
          <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Right: Search, Filters & Add Lead */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Executive Filter */}
          <select
            value={selectedExecutive}
            onChange={(e) => setSelectedExecutive(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Sales Execs</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <button
            onClick={onOpenNewLeadModal}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-red-950/50 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x">
          {stages.map((stg) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stg);
            const stageRevenue = stageLeads.reduce((sum, l) => sum + (l.expectedRevenue || 0), 0);

            return (
              <div
                key={stg}
                className="w-72 shrink-0 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl flex flex-col max-h-[75vh] shadow-lg snap-start"
              >
                {/* Stage Header */}
                <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        stg === 'Signed' || stg === 'Onboarded'
                          ? 'bg-emerald-500'
                          : stg === 'Lost'
                          ? 'bg-zinc-600'
                          : stg === 'Agreement Sent'
                          ? 'bg-indigo-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <h3 className="text-xs font-bold text-zinc-200">{stg}</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-bold">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                {/* Stage Revenue Sub-header */}
                <div className="px-3.5 py-1.5 bg-zinc-900/20 border-b border-zinc-800/40 text-[10px] text-zinc-400 font-mono flex justify-between">
                  <span>Target MRR:</span>
                  <span className="text-zinc-200 font-bold">₹{(stageRevenue / 100000).toFixed(1)}L</span>
                </div>

                {/* Cards Column */}
                <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-zinc-500 border border-dashed border-zinc-900 rounded-xl">
                      No leads in this stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3 shadow-md space-y-2 cursor-pointer transition-all hover:scale-[1.01] group relative"
                        onClick={() => onSelectLead(lead)}
                      >
                        {/* Top info */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                              {lead.city}
                            </span>
                            <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                              {lead.fullName}
                            </h4>
                          </div>

                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40 shrink-0">
                            ₹{(lead.expectedRevenue / 100000).toFixed(1)}L
                          </span>
                        </div>

                        {/* Property Address */}
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-snug">
                          {lead.propertyAddress}
                        </p>

                        {/* Executive & WhatsApp badge */}
                        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                          <span className="truncate">{lead.salesExecutiveName}</span>
                          <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                            {lead.whatsappStatus}
                          </span>
                        </div>

                        {/* Card Quick Actions */}
                        <div className="pt-1 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onOpenAgreementForLead(lead)}
                            className="bg-red-950/80 hover:bg-red-900 text-red-300 text-[10px] font-medium px-2 py-1 rounded border border-red-800/50 flex items-center gap-1"
                            title="Generate MOU"
                          >
                            <FileSignature className="w-2.5 h-2.5" />
                            <span>MOU</span>
                          </button>

                          {/* Quick Stage Move Dropdown */}
                          <select
                            value={lead.stage}
                            onChange={(e) => onUpdateLeadStage(lead.id, e.target.value as LeadStage)}
                            className="bg-zinc-950 text-zinc-300 text-[10px] rounded p-1 border border-zinc-800 focus:outline-none"
                          >
                            {stages.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Owner Name</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Property Address</th>
                  <th className="py-3 px-4">Expected Revenue</th>
                  <th className="py-3 px-4">Sales Exec</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-bold text-white">{lead.fullName}</td>
                    <td className="py-3 px-4 font-mono text-zinc-300">
                      <div>{lead.mobileNumber}</div>
                      <div className="text-[10px] text-zinc-500">{lead.email}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{lead.city}</td>
                    <td className="py-3 px-4 truncate max-w-[200px] text-zinc-400">
                      {lead.propertyAddress}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                      ₹{lead.expectedRevenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{lead.salesExecutiveName}</td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.stage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdateLeadStage(lead.id, e.target.value as LeadStage)}
                        className="bg-zinc-950 text-zinc-200 border border-zinc-800 text-[11px] rounded-lg px-2 py-1 font-semibold"
                      >
                        {stages.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenAgreementForLead(lead)}
                        className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
                      >
                        Generate MOU
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
