import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Building, Globe, IndianRupee, Sparkles } from 'lucide-react';
import { Lead, LeadStage, StaffUser } from '../../types/crm';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: Partial<Lead>) => void;
  initialLead?: Lead | null;
  staffList: StaffUser[];
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLead,
  staffList,
}) => {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [airbnbUrl, setAirbnbUrl] = useState('');
  const [numberOfProperties, setNumberOfProperties] = useState(1);
  const [expectedRevenue, setExpectedRevenue] = useState(250000);
  const [source, setSource] = useState<Lead['source']>('Website');
  const [salesExecutiveId, setSalesExecutiveId] = useState(staffList[1]?.id || staffList[0]?.id || '');
  const [stage, setStage] = useState<LeadStage>('New Lead');

  useEffect(() => {
    if (initialLead) {
      setFullName(initialLead.fullName || '');
      setMobileNumber(initialLead.mobileNumber || '');
      setEmail(initialLead.email || '');
      setCity(initialLead.city || '');
      setPropertyAddress(initialLead.propertyAddress || '');
      setAirbnbUrl(initialLead.airbnbUrl || '');
      setNumberOfProperties(initialLead.numberOfProperties || 1);
      setExpectedRevenue(initialLead.expectedRevenue || 250000);
      setSource(initialLead.source || 'Website');
      setSalesExecutiveId(initialLead.salesExecutiveId || staffList[0]?.id || '');
      setStage(initialLead.stage || 'New Lead');
    } else {
      setFullName('');
      setMobileNumber('');
      setEmail('');
      setCity('New Delhi');
      setPropertyAddress('');
      setAirbnbUrl('');
      setNumberOfProperties(1);
      setExpectedRevenue(250000);
      setSource('Website');
      setSalesExecutiveId(staffList[1]?.id || staffList[0]?.id || '');
      setStage('New Lead');
    }
  }, [initialLead, isOpen, staffList]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exec = staffList.find((s) => s.id === salesExecutiveId);
    onSave({
      fullName,
      mobileNumber,
      email,
      city,
      propertyAddress,
      airbnbUrl,
      numberOfProperties: Number(numberOfProperties),
      expectedRevenue: Number(expectedRevenue),
      source,
      salesExecutiveId,
      salesExecutiveName: exec?.name || 'Rahul Sharma',
      stage,
    });
    onClose();
  };

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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialLead ? 'Edit Property Lead' : 'Add New Property Lead'}
              </h2>
              <p className="text-xs text-zinc-400">
                Red Flag Homes Lead Pipeline Entry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Owner Full Name & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Owner Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rohan Oberoi"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. +91 98112 34567"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Email & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rohan.oberoi@domain.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                City / Region *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi, Goa, Mumbai"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Property Address */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Property Address *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                placeholder="Penthouse 4B, Golf Course Road, Gurugram"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Airbnb URL & Number of Properties */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Airbnb Listing URL (Optional)
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={airbnbUrl}
                  onChange={(e) => setAirbnbUrl(e.target.value)}
                  placeholder="https://airbnb.com/rooms/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                No. of Properties
              </label>
              <input
                type="number"
                min="1"
                value={numberOfProperties}
                onChange={(e) => setNumberOfProperties(parseInt(e.target.value) || 1)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {/* Expected Revenue & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Expected Monthly Gross Revenue (₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="number"
                  step="10000"
                  value={expectedRevenue}
                  onChange={(e) => setExpectedRevenue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Lead Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as Lead['source'])}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Website">Website</option>
                <option value="WhatsApp Inbound">WhatsApp Inbound</option>
                <option value="Referral">Referral</option>
                <option value="Cold Outreach">Cold Outreach</option>
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Direct Call">Direct Call</option>
              </select>
            </div>
          </div>

          {/* Sales Exec & Pipeline Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Assign Sales Executive
              </label>
              <select
                value={salesExecutiveId}
                onChange={(e) => setSalesExecutiveId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                {staffList.map((exec) => (
                  <option key={exec.id} value={exec.id}>
                    {exec.name} ({exec.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                {stages.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-950/50 transition-all"
            >
              {initialLead ? 'Save Lead Changes' : 'Create Lead Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
