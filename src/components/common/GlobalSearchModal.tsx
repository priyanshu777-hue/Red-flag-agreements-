import React, { useState, useEffect } from 'react';
import { Search, X, Users, FileSignature, ArrowRight } from 'lucide-react';
import { Lead, AgreementData } from '../../types/crm';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  agreements: AgreementData[];
  onSelectLead: (lead: Lead) => void;
  onSelectAgreement: (agreement: AgreementData) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  leads,
  agreements,
  onSelectLead,
  onSelectAgreement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredLeads = searchTerm
    ? leads.filter(
        (l) =>
          l.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.mobileNumber.includes(searchTerm) ||
          l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const filteredAgreements = searchTerm
    ? agreements.filter(
        (a) =>
          a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.partyAName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-150">
        {/* Input Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950">
          <Search className="w-5 h-5 text-red-500" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads, clients, phone numbers, agreement IDs..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!searchTerm ? (
            <div className="text-center py-10 text-xs text-zinc-500 space-y-1">
              <p>Type to search across Red Flag Homes CRM records.</p>
              <p className="font-mono text-[10px] text-zinc-600">Try "Rohan", "Golf Course", "+91 98112", "RFH-MOU"</p>
            </div>
          ) : (
            <>
              {/* Leads Results */}
              {filteredLeads.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
                    Leads ({filteredLeads.length})
                  </span>
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => {
                        onSelectLead(lead);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-red-400" />
                        <div>
                          <span className="font-bold text-white block">{lead.fullName}</span>
                          <span className="text-zinc-400 text-[10px]">{lead.mobileNumber} · {lead.city}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                  ))}
                </div>
              )}

              {/* Agreements Results */}
              {filteredAgreements.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
                    Agreements ({filteredAgreements.length})
                  </span>
                  {filteredAgreements.map((agr) => (
                    <div
                      key={agr.id}
                      onClick={() => {
                        onSelectAgreement(agr);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileSignature className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="font-mono font-bold text-red-400 block">{agr.id}</span>
                          <span className="text-zinc-300 text-[11px]">{agr.partyAName}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                  ))}
                </div>
              )}

              {filteredLeads.length === 0 && filteredAgreements.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-8">
                  No matching leads or agreements found.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
