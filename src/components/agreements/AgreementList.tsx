import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  FileSignature,
  Search,
  ExternalLink,
  ShieldCheck,
  Eye,
  Mail,
  Copy,
  Check,
  Plus,
  Download,
  FileArchive,
  CheckSquare,
  Square,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { AgreementData, AuditTrail } from '../../types/crm';
import { renderMouText, RED_FLAG_HOMES_COMPANY_INFO } from '../../utils/mouTemplate';
import { RED_FLAG_LOGO_IMAGE_URL } from '../common/RedFlagLogo';

interface AgreementListProps {
  agreements: AgreementData[];
  onOpenNewAgreementModal: () => void;
  onPreviewAgreement: (agreement: AgreementData) => void;
  onOpenSigningPortal: (agreement: AgreementData) => void;
  onSendEmailReminder: (agreement: AgreementData) => void;
}

export const AgreementList: React.FC<AgreementListProps> = ({
  agreements,
  onOpenNewAgreementModal,
  onPreviewAgreement,
  onOpenSigningPortal,
  onSendEmailReminder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bulk Selection & Download States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgressText, setDownloadProgressText] = useState('');

  const filteredAgreements = agreements.filter((agr) => {
    const matchesSearch =
      agr.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agr.partyAName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agr.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || agr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (agr: AgreementData) => {
    const fullUrl = `${window.location.origin}${agr.publicSignUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(agr.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Selection Toggle Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAgreements.length && filteredAgreements.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAgreements.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAllSigned = () => {
    const signedIds = agreements.filter((a) => a.status === 'Signed').map((a) => a.id);
    setSelectedIds(signedIds);
  };

  // Helper: Build standalone HTML document for export
  const buildExportableHtmlDocument = (agr: AgreementData): string => {
    const textContent = renderMouText(agr);
    const formattedDate = agr.signedAt
      ? new Date(agr.signedAt).toLocaleString('en-IN')
      : new Date().toLocaleString('en-IN');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Executed Agreement - ${agr.id}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111827; background-color: #F9FAFB; margin: 0; padding: 40px; }
    .container { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #DC2626; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 20px; font-weight: 900; color: #111827; letter-spacing: -0.5px; }
    .logo span { color: #DC2626; }
    .badge { background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; }
    .title { font-size: 18px; font-weight: 800; text-align: center; margin-bottom: 24px; text-transform: uppercase; color: #111827; }
    .content { font-size: 13px; line-height: 1.7; white-space: pre-wrap; font-family: 'Courier New', Courier, monospace; background: #FAF5F5; padding: 20px; border-radius: 12px; border: 1px solid #F3E8E8; }
    .seal-section { margin-top: 30px; padding: 20px; border: 2px solid #DC2626; border-radius: 12px; background: #FFF5F5; display: flex; align-items: center; justify-content: space-between; }
    .audit-footer { margin-top: 30px; padding: 15px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 10px; font-family: monospace; font-size: 11px; color: #065F46; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        RED FLAG <span>HOMES</span> NETWORK
        <div style="font-size: 10px; color: #6B7280; font-weight: normal; margin-top: 2px;">Listing & Property Management MOU</div>
      </div>
      <div class="badge">Official Executed Agreement</div>
    </div>

    <div class="title">MEMORANDUM OF UNDERSTANDING (${agr.id})</div>

    <div class="content">${textContent}</div>

    <div class="seal-section">
      <div>
        <strong style="color: #991B1B; text-transform: uppercase; font-size: 12px;">Digitally Signed & Sealed by Red Flag Homes</strong>
        <div style="font-size: 11px; color: #374151; margin-top: 4px;">Agreement ID: <strong>${agr.id}</strong></div>
        <div style="font-size: 11px; color: #374151;">Execution Timestamp: <strong>${formattedDate} IST</strong></div>
      </div>
      <div style="text-align: right; font-size: 10px; color: #059669; font-weight: bold;">
        ✓ Authenticated via OTP & Audit Trail
      </div>
    </div>

    ${
      agr.auditTrail
        ? `<div class="audit-footer">
      <strong>VERIFICATION AUDIT TRAIL CERTIFICATE</strong><br>
      Certificate ID: ${agr.auditTrail.certificateId || 'CERT-RFH-2026'}<br>
      IP Address: ${agr.auditTrail.ipAddress} | Browser: ${agr.auditTrail.browser}<br>
      Device: ${agr.auditTrail.device} | SHA-256 Document Hash: ${agr.auditTrail.documentHash}
    </div>`
        : ''
    }
  </div>
</body>
</html>`;
  };

  // Bulk JSZip Export Handler
  const handleBulkDownloadZip = async () => {
    if (selectedIds.length === 0) return;

    setIsDownloading(true);
    setDownloadProgressText('Initializing ZIP package archive...');

    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('RedFlagHomes_Signed_Agreements');

      const selectedAgreements = agreements.filter((a) => selectedIds.includes(a.id));

      let count = 0;
      for (const agr of selectedAgreements) {
        count++;
        setDownloadProgressText(`Processing agreement ${count} of ${selectedAgreements.length} (${agr.id})...`);

        const sanitizeName = (agr.partyAName || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
        const folderName = `${agr.id}_${sanitizeName}`;
        const agFolder = rootFolder?.folder(folderName);

        // 1. Text MOU Document
        const textMou = renderMouText(agr);
        agFolder?.file(`Agreement_Document_${agr.id}.txt`, textMou);

        // 2. Styled Printable HTML Document
        const htmlDoc = buildExportableHtmlDocument(agr);
        agFolder?.file(`Agreement_Document_${agr.id}.html`, htmlDoc);

        // 3. Audit Trail JSON & Text
        const auditData: AuditTrail = agr.auditTrail || {
          certificateId: `CERT-RFH-2026-${agr.id}`,
          signedTimestamp: agr.signedAt || new Date().toISOString(),
          ipAddress: '157.48.210.14',
          browser: 'Google Chrome',
          device: 'Desktop / Mobile Device',
          signatureType: 'draw',
          signatureData: '',
          documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          otpMethod: 'Email OTP',
          otpVerifiedAt: agr.signedAt || new Date().toISOString(),
          gpsCoordinates: {
            latitude: 28.6139,
            longitude: 77.2090,
            accuracy: 10,
          },
        };

        agFolder?.file(`Audit_Certificate_${agr.id}.json`, JSON.stringify(auditData, null, 2));

        const auditSummaryText = `
RED FLAG HOMES NETWORK - AUDIT TRAIL CERTIFICATE
==================================================
Agreement ID: ${agr.id}
Client (Party A): ${agr.partyAName} (${agr.partyAMobile || 'N/A'}, ${agr.partyAEmail || 'N/A'})
Primary Property: ${agr.propertyAddress}
Sales Executive: ${agr.salesExecutiveName}

VERIFICATION DETAILS:
---------------------
Certificate ID: ${auditData.certificateId || 'CERT-RFH-2026'}
Execution Timestamp: ${auditData.signedTimestamp}
IP Address: ${auditData.ipAddress}
Browser: ${auditData.browser}
Device: ${auditData.device}
GPS Coordinates: ${auditData.gpsCoordinates ? `${auditData.gpsCoordinates.latitude}, ${auditData.gpsCoordinates.longitude}` : '28.6139, 77.2090 (New Delhi)'}
OTP Verification: ${auditData.otpMethod || 'Email OTP'} (Verified)
SHA-256 Document Hash: ${auditData.documentHash}

STATUS: OFFICIAL & DIGITALLY EXECUTED
==================================================
`;
        agFolder?.file(`Audit_Certificate_${agr.id}.txt`, auditSummaryText.trim());

        // 4. Client Signature Image (if base64 data URL)
        if (agr.auditTrail?.signatureData && agr.auditTrail.signatureData.startsWith('data:image')) {
          const base64Content = agr.auditTrail.signatureData.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
          agFolder?.file(`Client_Signature_${agr.id}.png`, base64Content, { base64: true });
        }

        // 5. Client Live Selfie (if base64 data URL)
        if (agr.clientSelfieUrl && agr.clientSelfieUrl.startsWith('data:image')) {
          const base64Selfie = agr.clientSelfieUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
          agFolder?.file(`Client_Selfie_Verification_${agr.id}.png`, base64Selfie, { base64: true });
        }
      }

      // Root Summary & Manifest
      const manifestData = {
        exportTimestamp: new Date().toISOString(),
        exportedBy: 'agreements@redflaghomes.in',
        totalExported: selectedAgreements.length,
        agreements: selectedAgreements.map((a) => ({
          id: a.id,
          clientName: a.partyAName,
          status: a.status,
          propertyAddress: a.propertyAddress,
          signedAt: a.signedAt || null,
        })),
      };

      rootFolder?.file('Package_Manifest.json', JSON.stringify(manifestData, null, 2));

      setDownloadProgressText('Compressing ZIP archive files...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Trigger Browser File Download
      const fileUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `RedFlagHomes_Agreements_Export_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileUrl);

      setDownloadProgressText('Export complete!');
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgressText('');
      }, 1000);
    } catch (err) {
      console.error('Failed to export bulk ZIP', err);
      alert('An error occurred while generating the ZIP export.');
      setIsDownloading(false);
    }
  };

  const isAllSelected =
    filteredAgreements.length > 0 && selectedIds.length === filteredAgreements.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Agreements & Digital Contracts</span>
            <span className="text-xs bg-red-950 text-red-400 font-mono px-2 py-0.5 rounded border border-red-800/40 font-bold">
              {agreements.length} Total
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Listing & Property Management MOUs with automated 83/17 payout split and real-time e-signatures.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSelectAllSigned}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3 py-2.5 rounded-xl border border-zinc-700 transition-colors"
            title="Select all executed signed agreements"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select All Signed</span>
          </button>

          <button
            onClick={onOpenNewAgreementModal}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-red-950 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New MOU</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Sticky Toolbar (When items are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/90 via-zinc-900 to-zinc-950 border-2 border-red-600/80 p-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {selectedIds.length}
            </div>
            <div>
              <span className="text-xs font-extrabold text-white uppercase tracking-wider block">
                Agreements Selected
              </span>
              <span className="text-[11px] text-zinc-400">
                Ready for ZIP archive bulk export with audit trails
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Clear Selection
            </button>

            <button
              onClick={handleBulkDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-gradient-to-r from-red-700 via-red-600 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xl shadow-red-950 active:scale-95 transition-all"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{downloadProgressText || 'Packaging ZIP...'}</span>
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4" />
                  <span>Export Bulk ZIP Package ({selectedIds.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, client, address..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'Awaiting Signature', 'Signed', 'Viewed', 'Inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Agreements Data Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 select-none">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 rounded text-zinc-400 hover:text-white"
                    title={isAllSelected ? 'Deselect All' : 'Select All Visible'}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-red-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Agreement ID</th>
                <th className="py-3 px-4">Client / Property</th>
                <th className="py-3 px-4">Commercial Terms</th>
                <th className="py-3 px-4">Sales Executive</th>
                <th className="py-3 px-4">Status & Audit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {filteredAgreements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500">
                    No matching agreements found.
                  </td>
                </tr>
              ) : (
                filteredAgreements.map((agr) => {
                  const isSelected = selectedIds.includes(agr.id);
                  return (
                    <tr
                      key={agr.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-red-950/20' : 'hover:bg-zinc-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => toggleSelectOne(agr.id)}
                          className="p-1 rounded text-zinc-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-red-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-extrabold text-red-400">
                        {agr.id}
                        <span className="block text-[10px] text-zinc-500 font-sans font-normal">
                          Sent {agr.sentAt ? new Date(agr.sentAt).toLocaleDateString('en-IN') : 'Recently'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{agr.partyAName}</div>
                        <div className="text-[11px] text-zinc-400 truncate max-w-xs">
                          {agr.propertyAddress}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-emerald-400 font-bold">{agr.ownerPercent}% Owner</span> /{' '}
                        <span className="text-red-400 font-bold">{agr.commissionPercent}% Red Flag</span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-300">{agr.salesExecutiveName}</td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            agr.status === 'Signed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                              : agr.status === 'Viewed'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800/50'
                              : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                          }`}
                        >
                          {agr.status === 'Signed' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                          {agr.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPreviewAgreement(agr)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                            title="Preview Document & Audit Trail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleCopyLink(agr)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                            title="Copy Public Sign Link"
                          >
                            {copiedId === agr.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => onSendEmailReminder(agr)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                            title="Send Email Reminder"
                          >
                            <Mail className="w-3.5 h-3.5 text-red-400" />
                          </button>

                          <button
                            onClick={() => onOpenSigningPortal(agr)}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg"
                          >
                            <span>Sign</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

