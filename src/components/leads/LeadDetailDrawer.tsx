import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  Globe,
  IndianRupee,
  FileSignature,
  MessageSquare,
  Paperclip,
  Clock,
  Plus,
  Send,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Upload,
} from 'lucide-react';
import { Lead, LeadStage, CallLog, LeadDocument } from '../../types/crm';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onOpenAgreementForLead: (lead: Lead) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  onClose,
  onUpdateLead,
  onDeleteLead,
  onOpenAgreementForLead,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'calls' | 'documents' | 'notes'>('details');
  const [newNote, setNewNote] = useState('');
  const [showAddCall, setShowAddCall] = useState(false);
  const [callSummary, setCallSummary] = useState('');
  const [callOutcome, setCallOutcome] = useState<CallLog['outcome']>('Connected');
  const [callDuration, setCallDuration] = useState('15 min');

  if (!lead) return null;

  const stages: LeadStage[] = [
    'New Lead',
    'Contacted',
    'Interested',
    'Meeting Scheduled',
    'Negotiation',
    'Agreement Sent',
    'Signed',
    'Onboarded',
  ];

  const currentStageIndex = stages.indexOf(lead.stage);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const updated = {
      ...lead,
      notes: [newNote, ...lead.notes],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateLead(updated);
    setNewNote('');
  };

  const handleAddCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callSummary.trim()) return;
    const newCall: CallLog = {
      id: `call_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      duration: callDuration,
      summary: callSummary,
      outcome: callOutcome,
      executiveName: lead.salesExecutiveName,
    };
    const updated = {
      ...lead,
      callHistory: [newCall, ...lead.callHistory],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateLead(updated);
    setCallSummary('');
    setShowAddCall(false);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const newDoc: LeadDocument = {
      id: `doc_${Date.now()}`,
      name: file.name,
      type: file.name.toLowerCase().includes('aadhaar')
        ? 'Aadhaar'
        : file.name.toLowerCase().includes('pan')
        ? 'PAN'
        : 'Ownership Proof',
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString().split('T')[0],
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    };
    const updated = {
      ...lead,
      documents: [...lead.documents, newDoc],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateLead(updated);
  };

  const cleanPhone = lead.mobileNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${lead.fullName}, this is ${lead.salesExecutiveName} from Red Flag Homes. Following up regarding your property at ${lead.city}.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div className="bg-zinc-950 border-l border-zinc-800 w-full max-w-2xl h-full flex flex-col shadow-2xl relative">
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/40">
                {lead.city}
              </span>
              <span className="text-xs text-zinc-400">ID: {lead.id}</span>
            </div>
            <h2 className="text-lg font-extrabold text-white">{lead.fullName}</h2>
            <p className="text-xs text-zinc-400 truncate max-w-md">{lead.propertyAddress}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAgreementForLead(lead)}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-red-950/50"
            >
              <FileSignature className="w-3.5 h-3.5" />
              <span>Generate MOU</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stage Progression Bar */}
        <div className="bg-zinc-900/80 border-b border-zinc-800 px-5 py-3">
          <div className="flex items-center justify-between mb-2 text-xs font-semibold text-zinc-300">
            <span>Pipeline Progression</span>
            <span className="text-red-400 font-mono">{lead.stage}</span>
          </div>
          <div className="grid grid-cols-8 gap-1">
            {stages.map((stg, i) => {
              const isPastOrCurrent = i <= currentStageIndex && lead.stage !== 'Lost';
              return (
                <div
                  key={stg}
                  title={stg}
                  className={`h-2 rounded-full transition-all ${
                    isPastOrCurrent
                      ? 'bg-gradient-to-r from-red-700 to-red-500 shadow-sm shadow-red-900'
                      : 'bg-zinc-800'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Drawer Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-zinc-800 bg-zinc-950">
          {[
            { id: 'details', label: 'Overview' },
            { id: 'calls', label: `Call History (${lead.callHistory.length})` },
            { id: 'documents', label: `Docs (${lead.documents.length})` },
            { id: 'notes', label: `Notes (${lead.notes.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-400 font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Key Quick Contact Cards */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${lead.mobileNumber}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Call Mobile</span>
                    <span className="text-xs font-mono font-bold text-white">{lead.mobileNumber}</span>
                  </div>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-semibold">WhatsApp Chat</span>
                    <span className="text-xs font-semibold text-emerald-400 truncate block">{lead.whatsappStatus}</span>
                  </div>
                </a>
              </div>

              {/* Attributes Grid */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
                  Lead Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Email Address</span>
                    <span className="font-mono text-zinc-200">{lead.email}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Assigned Executive</span>
                    <span className="font-semibold text-zinc-200">{lead.salesExecutiveName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Lead Source</span>
                    <span className="text-zinc-300">{lead.source}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">No. of Properties</span>
                    <span className="font-mono text-zinc-200">{lead.numberOfProperties} Units</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Expected Monthly Revenue</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ₹{lead.expectedRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Follow-up Date</span>
                    <span className="font-mono text-amber-400">{lead.followUpDate || 'None Set'}</span>
                  </div>
                </div>

                {lead.airbnbUrl && (
                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500 block text-xs mb-1">Airbnb Listing URL</span>
                    <a
                      href={lead.airbnbUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-red-400 hover:text-red-300 font-mono flex items-center gap-1 underline truncate"
                    >
                      {lead.airbnbUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-300">Call Logs</h3>
                <button
                  onClick={() => setShowAddCall(!showAddCall)}
                  className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700"
                >
                  <Plus className="w-3 h-3" /> Log Call
                </button>
              </div>

              {showAddCall && (
                <form onSubmit={handleAddCall} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Outcome</label>
                      <select
                        value={callOutcome}
                        onChange={(e) => setCallOutcome(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="Connected">Connected</option>
                        <option value="Busy">Busy</option>
                        <option value="Follow-up Needed">Follow-up Needed</option>
                        <option value="Scheduled Meeting">Scheduled Meeting</option>
                        <option value="Not Interested">Not Interested</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Duration</label>
                      <input
                        type="text"
                        value={callDuration}
                        onChange={(e) => setCallDuration(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Call Notes / Summary</label>
                    <textarea
                      required
                      value={callSummary}
                      onChange={(e) => setCallSummary(e.target.value)}
                      placeholder="Discussed commission split and property access terms..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white h-16"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold text-xs py-2 rounded-lg"
                  >
                    Save Call Log
                  </button>
                </form>
              )}

              <div className="space-y-2">
                {lead.callHistory.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">No call logs recorded yet.</p>
                ) : (
                  lead.callHistory.map((call) => (
                    <div key={call.id} className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-200">{call.outcome}</span>
                        <span className="text-zinc-500 font-mono text-[10px]">{call.date} ({call.duration})</span>
                      </div>
                      <p className="text-xs text-zinc-400">{call.summary}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-300">Uploaded Verification Documents</h3>
                <label className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Doc</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleDocumentUpload}
                    accept="image/*,application/pdf"
                  />
                </label>
              </div>

              <div className="space-y-2">
                {lead.documents.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-6 text-center border border-dashed border-zinc-800 rounded-xl">
                    No documents uploaded yet (e.g. Aadhaar, PAN, Passport).
                  </p>
                ) : (
                  lead.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-4 h-4 text-red-400" />
                        <div>
                          <span className="text-xs font-bold text-zinc-200 block truncate max-w-xs">{doc.name}</span>
                          <span className="text-[10px] text-zinc-500">{doc.type} · {doc.size}</span>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-red-400 hover:underline"
                      >
                        View
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type a internal lead note..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 h-20"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Add Note
                </button>
              </form>

              <div className="space-y-2">
                {lead.notes.map((note, i) => (
                  <div key={i} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-300">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <button
            onClick={() => onDeleteLead(lead.id)}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Lead</span>
          </button>

          <button
            onClick={() => onOpenAgreementForLead(lead)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-950"
          >
            <FileSignature className="w-4 h-4" />
            <span>Generate Digital MOU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
