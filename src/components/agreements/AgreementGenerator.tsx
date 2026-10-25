import React, { useState, useEffect } from 'react';
import {
  FileSignature,
  User,
  Phone,
  Send,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Link2,
} from 'lucide-react';
import { Lead, AgreementData, StaffUser } from '../../types/crm';
import { RedFlagLogo } from '../common/RedFlagLogo';

interface AgreementGeneratorProps {
  selectedLead: Lead | null;
  staffList: StaffUser[];
  onGenerateAgreement: (agreement: AgreementData) => void;
  onClose?: () => void;
}

interface CustomTemplate {
  id: string;
  title: string;
  type: string;
  description: string;
  ownerPercent: number;
  commissionPercent: number;
}

export const AgreementGenerator: React.FC<AgreementGeneratorProps> = ({
  selectedLead,
  staffList,
  onGenerateAgreement,
  onClose,
}) => {
  const [partyAName, setPartyAName] = useState('');
  const [partyAMobile, setPartyAMobile] = useState('');
  const [createdAgreement, setCreatedAgreement] = useState<AgreementData | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Template State & Selection
  const [templates, setTemplates] = useState<CustomTemplate[]>([
    {
      id: 'mou',
      title: 'Listing & Property Management MOU (Master 83/17 Split)',
      type: 'mou',
      description: 'Standard Red Flag Homes property management memorandum of understanding.',
      ownerPercent: 83,
      commissionPercent: 17,
    },
    {
      id: 'nda',
      title: 'Non-Disclosure & Confidentiality Agreement (NDA)',
      type: 'nda',
      description: 'Protects proprietary Airbnb pricing algorithms, guest database, and financial terms.',
      ownerPercent: 100,
      commissionPercent: 0,
    },
    {
      id: 'partnership',
      title: 'Co-Hosting & Profit Share Partnership Contract',
      type: 'partnership',
      description: 'Special co-hosting arrangement for multi-property real estate portfolio owners.',
      ownerPercent: 80,
      commissionPercent: 20,
    },
  ]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('mou');
  const [showAddTemplate, setShowAddTemplate] = useState(false);

  // New Template Form State
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateOwnerPercent, setNewTemplateOwnerPercent] = useState(85);
  const [newTemplateCommissionPercent, setNewTemplateCommissionPercent] = useState(15);
  const [newTemplateDescription, setNewTemplateDescription] = useState('');

  useEffect(() => {
    if (selectedLead) {
      setPartyAName(selectedLead.fullName || '');
      setPartyAMobile(selectedLead.mobileNumber || '');
    }
  }, [selectedLead]);

  const handleCreateNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateTitle.trim()) return;

    const templateId = `tpl_${Date.now()}`;
    const createdTpl: CustomTemplate = {
      id: templateId,
      title: newTemplateTitle.trim(),
      type: 'mou',
      description: newTemplateDescription.trim() || 'Custom template created by sales executive.',
      ownerPercent: newTemplateOwnerPercent,
      commissionPercent: newTemplateCommissionPercent,
    };

    setTemplates([...templates, createdTpl]);
    setSelectedTemplateId(templateId);
    setShowAddTemplate(false);
    setNewTemplateTitle('');
    setNewTemplateDescription('');
  };

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyAName.trim() || !partyAMobile.trim()) return;

    // Generate unique, secure token for signing link
    const uniqueToken = `RFH-MOU-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create agreement with 'Inactive' status until client completes their full profile
    const newAgreement: AgreementData = {
      id: uniqueToken,
      leadId: selectedLead?.id || `lead_${Date.now()}`,
      templateType: (activeTemplate.type as any) || 'mou',
      title: `${activeTemplate.title} - ${partyAName}`,
      partyAName: partyAName.trim(),
      partyAMobile: partyAMobile.trim(),
      propertyAddress: selectedLead?.propertyAddress || 'Address to be completed by client',
      effectiveDate: new Date().toISOString().split('T')[0],
      place: selectedLead?.city ? `${selectedLead.city}, India` : 'New Delhi, India',
      commissionPercent: activeTemplate.commissionPercent,
      ownerPercent: activeTemplate.ownerPercent,
      coHostPercent: activeTemplate.commissionPercent,
      occupancyTarget: '60%–70%',
      noticePeriod: '15 days',
      lockInPeriod: '6 months',
      salesExecutiveName: selectedLead?.salesExecutiveName || staffList[0]?.name || 'Rahul Sharma',
      salesExecutiveMobile: staffList[0]?.phone || '+91 98765 43210',
      salesExecutiveEmail: staffList[0]?.email || 'agreements@redflaghomes.com',
      status: 'Inactive', // Explicit 'Inactive' status until client completes details
      sentAt: new Date().toISOString(),
      publicSignUrl: `/sign/${uniqueToken}`,
    };

    setCreatedAgreement(newAgreement);
    onGenerateAgreement(newAgreement);
  };

  const handleCopyLink = () => {
    if (!createdAgreement) return;
    const fullUrl = `${window.location.origin}${createdAgreement.publicSignUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl max-w-xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <RedFlagLogo size="sm" />
        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-red-400 bg-red-950/80 px-2.5 py-1 rounded border border-red-800/40">
          Executive Agreement Dispatch
        </span>
      </div>

      {!createdAgreement ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-white">Issue Client Agreement Signing Link</h2>
            <p className="text-xs text-zinc-400">
              Select an agreement template or create a new custom template. Enter client details to generate an <strong>Inactive</strong> signing link.
            </p>
          </div>

          {/* Agreement Template Selector */}
          <div className="space-y-2 p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-red-400 uppercase tracking-wider">
                Select Agreement Template
              </label>
              <button
                type="button"
                onClick={() => setShowAddTemplate(!showAddTemplate)}
                className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 bg-red-950/80 px-2.5 py-1 rounded-lg border border-red-800/40"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showAddTemplate ? 'Cancel' : '+ Add New Template'}</span>
              </button>
            </div>

            {showAddTemplate ? (
              /* Add New Template Form */
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-red-600/60 space-y-3 animate-in fade-in duration-150">
                <span className="text-xs font-extrabold text-white block">
                  Create Custom Agreement Template
                </span>

                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Template Title *</label>
                  <input
                    type="text"
                    required
                    value={newTemplateTitle}
                    onChange={(e) => setNewTemplateTitle(e.target.value)}
                    placeholder="e.g. Luxury Villa Co-Hosting Agreement"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Owner Share %</label>
                    <input
                      type="number"
                      required
                      value={newTemplateOwnerPercent}
                      onChange={(e) => setNewTemplateOwnerPercent(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Red Flag Share %</label>
                    <input
                      type="number"
                      required
                      value={newTemplateCommissionPercent}
                      onChange={(e) => setNewTemplateCommissionPercent(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Description / Custom Terms</label>
                  <input
                    type="text"
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    placeholder="Brief description of commercial terms"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreateNewTemplate}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow"
                >
                  Save & Select Template
                </button>
              </div>
            ) : (
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-medium focus:outline-none focus:border-red-500"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title} ({tpl.ownerPercent}% / {tpl.commissionPercent}%)
                  </option>
                ))}
              </select>
            )}

            <p className="text-[11px] text-zinc-400 pt-1 leading-snug">
              {activeTemplate.description}
            </p>
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Client Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={partyAName}
                onChange={(e) => setPartyAName(e.target.value)}
                placeholder="e.g. Rohan Oberoi"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Client Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Client Mobile Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={partyAMobile}
                onChange={(e) => setPartyAMobile(e.target.value)}
                placeholder="e.g. +91 98112 34567"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {/* Master Terms Note */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Master Commercial Split:</span>
            <span className="font-mono font-bold text-red-400">
              83% Owner / 17% Red Flag
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-xl shadow-red-950 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Generate Signing Link (Inactive)</span>
            </button>
          </div>
        </form>
      ) : (
        /* GENERATED SIGNING LINK CARD WITH INACTIVE STATUS */
        <div className="space-y-5 text-center py-2 animate-in zoom-in-95 duration-150">
          <div className="w-12 h-12 bg-amber-950/80 text-amber-400 border border-amber-800/60 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Link2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/50">
              <Lock className="w-3.5 h-3.5" />
              <span>Status: Inactive (Awaiting Client Profile Entry)</span>
            </div>
            <h3 className="text-base font-extrabold text-white">Unique Signing Link Generated!</h3>
            <p className="text-xs text-zinc-400">
              Agreement <strong className="text-red-400 font-mono">{createdAgreement.id}</strong> created for <strong>{createdAgreement.partyAName}</strong> ({createdAgreement.partyAMobile}).
            </p>
          </div>

          {/* Link Display Box */}
          <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 text-left font-mono text-xs">
            <span className="text-[10px] text-zinc-500 block uppercase">Client Secure Signing Portal Link:</span>
            <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800 text-red-400 text-[11px] truncate font-bold">
              {window.location.origin}{createdAgreement.publicSignUrl}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all"
            >
              {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Signing Link'}</span>
            </button>

            <a
              href={createdAgreement.publicSignUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-zinc-700 transition-colors"
            >
              <span>Open Sign Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
