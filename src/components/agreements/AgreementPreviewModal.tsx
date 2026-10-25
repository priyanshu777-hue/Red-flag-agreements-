import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { AgreementData } from '../../types/crm';
import { renderMouText, RED_FLAG_HOMES_COMPANY_INFO } from '../../utils/mouTemplate';
import { generateQrCodeDataUrl } from '../../utils/auditTrail';
import { RedFlagLogo, DigitalCompanySeal } from '../common/RedFlagLogo';

interface AgreementPreviewModalProps {
  agreement: AgreementData | null;
  onClose: () => void;
  onSendEmailToClient: (agreement: AgreementData) => void;
  onOpenSigningPortal: (agreement: AgreementData) => void;
}

export const AgreementPreviewModal: React.FC<AgreementPreviewModalProps> = ({
  agreement,
  onClose,
  onSendEmailToClient,
  onOpenSigningPortal,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  useEffect(() => {
    if (agreement) {
      const fullSignUrl = `${window.location.origin}${agreement.publicSignUrl}`;
      generateQrCodeDataUrl(fullSignUrl).then(setQrCodeUrl);
    }
  }, [agreement]);

  if (!agreement) return null;

  const fullMouText = renderMouText(agreement);
  const fullSignUrl = `${window.location.origin}${agreement.publicSignUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullSignUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendEmail = () => {
    onSendEmailToClient(agreement);
    setEmailSentNotice(true);
    setTimeout(() => setEmailSentNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden">
        {/* Modal Top Actions Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-red-400 bg-red-950/80 px-2.5 py-1 rounded border border-red-800/40">
              {agreement.id}
            </span>
            <span className="text-xs text-zinc-300 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {agreement.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-3 py-1.5 rounded-xl border border-zinc-700 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Signing Link'}</span>
            </button>

            <button
              onClick={handleSendEmail}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-3 py-1.5 rounded-xl border border-zinc-700 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-red-400" />
              <span>{emailSentNotice ? 'Sent Email!' : 'Email Client'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-3 py-1.5 rounded-xl border border-zinc-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>

            <button
              onClick={() => onOpenSigningPortal(agreement)}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition-all shadow-md shadow-red-950"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Signing Portal</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Document Preview Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-zinc-900 font-sans selection:bg-red-200 shadow-inner relative border-8 border-double border-zinc-200 m-2 sm:m-4 rounded-xl">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] rotate-[-30deg]">
            <span className="text-8xl font-black tracking-widest text-zinc-900 uppercase">
              RED FLAG HOMES
            </span>
          </div>

          {/* Document Header */}
          <div className="border-b-2 border-red-600 pb-6 mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <RedFlagLogo size="lg" variant="dark" />
              <p className="text-xs text-zinc-600 font-medium max-w-md pt-2 leading-relaxed">
                <span className="font-bold text-zinc-900">{RED_FLAG_HOMES_COMPANY_INFO.address}</span>
                <br />
                Official Desk: {RED_FLAG_HOMES_COMPANY_INFO.email} · Web: {RED_FLAG_HOMES_COMPANY_INFO.website}
              </p>
            </div>

            {/* Document Metadata & QR Code */}
            <div className="flex items-start gap-4">
              <div className="text-right text-xs space-y-1 font-mono">
                <div className="font-black text-red-600 text-base">{agreement.id}</div>
                <div className="text-zinc-600">Effective: {agreement.effectiveDate}</div>
                <div className="text-zinc-500 text-[10px] uppercase font-sans font-bold">
                  Status: <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{agreement.status}</span>
                </div>
              </div>

              {qrCodeUrl && (
                <div className="p-1 bg-white border border-zinc-300 rounded shadow-sm text-center">
                  <img src={qrCodeUrl} alt="QR Verification" className="w-16 h-16" />
                  <span className="text-[8px] font-mono text-zinc-500 block leading-tight">
                    Scan to Verify
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Commercial Split Highlights Card */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 via-zinc-50 to-amber-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 text-white rounded-lg font-black text-xs">MOU</div>
              <div>
                <span className="font-extrabold text-zinc-900 text-sm block">Memorandum of Understanding</span>
                <span className="text-zinc-600">Listing & Property Management Agreement</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-white border border-zinc-300 font-mono font-bold text-zinc-800">
                Owner Share: <strong className="text-red-600">{agreement.ownerPercent || 83}%</strong>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white border border-zinc-300 font-mono font-bold text-zinc-800">
                Red Flag Homes Share: <strong className="text-zinc-900">{agreement.commissionPercent || agreement.coHostPercent || 17}%</strong>
              </span>
            </div>
          </div>

          {/* MOU Text Body */}
          <div className="prose prose-sm max-w-none text-zinc-800 leading-relaxed font-serif whitespace-pre-wrap text-justify text-xs sm:text-sm">
            {fullMouText}
          </div>

          {/* Signatures & Seal Section */}
          <div className="mt-12 pt-8 border-t-2 border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
            {/* Party A (Client) Signature */}
            <div className="space-y-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 block">
                Party A (Asset Holding Entity / Owner)
              </span>
              <div className="text-sm font-bold text-zinc-900">{agreement.partyAName}</div>

              {agreement.auditTrail ? (
                <div className="space-y-1 border-t border-zinc-300 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-4 h-4" /> Digitally Signed & Verified
                  </div>
                  {agreement.auditTrail.signatureData.startsWith('data:image') ? (
                    <img
                      src={agreement.auditTrail.signatureData}
                      alt="Owner Signature"
                      className="h-12 object-contain"
                    />
                  ) : (
                    <div className="font-serif italic text-lg text-zinc-800 py-1">
                      {agreement.auditTrail.signatureData}
                    </div>
                  )}
                  <div className="text-[10px] font-mono text-zinc-500">
                    Timestamp: {new Date(agreement.auditTrail.signedTimestamp).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    IP: {agreement.auditTrail.ipAddress} · Cert: {agreement.auditTrail.certificateId}
                  </div>
                </div>
              ) : (
                <div className="py-6 border-2 border-dashed border-zinc-300 rounded text-center text-xs text-zinc-400 font-mono italic">
                  Awaiting Digital E-Signature from Client
                </div>
              )}
            </div>

            {/* Party B (Red Flag Homes) Digital Seal */}
            <div className="space-y-3 p-4 rounded-xl bg-zinc-50 text-zinc-900 border border-zinc-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                Party B (Red Flag Homes Network)
              </span>

              <DigitalCompanySeal
                agreementId={agreement.id}
                timestamp={agreement.signedAt || agreement.sentAt}
                qrCodeUrl={qrCodeUrl}
                variant="light"
              />
            </div>
          </div>

          {/* Document Footer */}
          <div className="mt-12 pt-4 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>Red Flag Homes Digital MOU System · Document ID: {agreement.id}</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
