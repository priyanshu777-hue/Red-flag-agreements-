import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Mail,
  PenTool,
  Type,
  Upload,
  RefreshCw,
  Printer,
  ChevronRight,
  User,
  CreditCard,
  Building,
  Plus,
  Trash2,
  Camera,
  Award,
  Eraser,
  Sparkles,
  Copy,
  Check,
  QrCode,
} from 'lucide-react';

export const OFFICIAL_PAYMENT_QR_URL =
  '/assets/aistudio/Cachessm-qr-1792916128716_188686eb.png';
import { AgreementData, AuditTrail, AssetDetail } from '../../types/crm';
import { renderMouText } from '../../utils/mouTemplate';
import { createAuditCertificate, getClientIp, generateQrCodeDataUrl } from '../../utils/auditTrail';
import { RedFlagLogo, DigitalCompanySeal, DocumentAuditStamp } from '../common/RedFlagLogo';

interface PublicSigningPortalProps {
  agreement: AgreementData;
  onCompleteSigning: (signedAgreement: AgreementData, auditTrail: AuditTrail) => void;
  onBackToCRM?: () => void;
}

export const PublicSigningPortal: React.FC<PublicSigningPortalProps> = ({
  agreement: initialAgreement,
  onCompleteSigning,
  onBackToCRM,
}) => {
  const [agreement, setAgreement] = useState<AgreementData>(initialAgreement);

  const [step, setStep] = useState<'details' | 'selfie' | 'payment' | 'review' | 'sign' | 'completed'>(
    initialAgreement.status === 'Signed' ? 'completed' : 'details'
  );

  // Client Details Form State
  const [clientName, setClientName] = useState(agreement.partyAName || '');
  const [clientEmail, setClientEmail] = useState(agreement.partyAEmail || '');
  const [clientMobile, setClientMobile] = useState(agreement.partyAMobile || '');

  // Multi-Asset / Property List
  const [assets, setAssets] = useState<AssetDetail[]>(
    agreement.assets && agreement.assets.length > 0
      ? agreement.assets
      : [
          {
            id: `asset_${Date.now()}`,
            propertyAddress: agreement.propertyAddress || '',
            bhkCount: '3 BHK Apartment',
          },
        ]
  );

  const [govtIdType, setGovtIdType] = useState<'Aadhaar' | 'PAN' | 'Passport' | 'Driving Licence'>(
    agreement.partyAGovtIdType || 'Aadhaar'
  );
  const [govtIdNumber, setGovtIdNumber] = useState(agreement.partyAGovtIdNumber || '');
  const [uploadedGovtIdName, setUploadedGovtIdName] = useState<string | null>(null);
  const [uploadedGovtIdUrl, setUploadedGovtIdUrl] = useState<string | null>(agreement.partyAGovtIdDocUrl || null);

  // Bank Details State
  const [bankHolderName, setBankHolderName] = useState(agreement.partyABankDetails?.accountName || agreement.partyAName || '');
  const [bankName, setBankName] = useState(agreement.partyABankDetails?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(agreement.partyABankDetails?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(agreement.partyABankDetails?.ifscCode || '');

  // Selfie State
  const [selfieUrl, setSelfieUrl] = useState<string | null>(agreement.clientSelfieUrl || null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Onboarding Fee Payment State
  const [paymentTxId, setPaymentTxId] = useState(agreement.paymentTransactionId || '');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(
    agreement.paymentScreenshotUrl || null
  );
  const [paymentScreenshotName, setPaymentScreenshotName] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState('');

  // Terms Acceptance & Signature states
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signatureType, setSignatureType] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState(clientName);
  const [selectedFont, setSelectedFont] = useState("'Dancing Script', cursive");
  const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState<string | null>(null);

  // react-signature-canvas Ref
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);
  const [penColor, setPenColor] = useState('#DC2626');
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signError, setSignError] = useState('');

  // Audit Trail & QR Code
  const [finalAuditTrail, setFinalAuditTrail] = useState<AuditTrail | null>(agreement.auditTrail || null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentQrCodeUrl, setPaymentQrCodeUrl] = useState(OFFICIAL_PAYMENT_QR_URL);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [clientIp, setClientIp] = useState('157.48.210.14');

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('red.media@superyes');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  useEffect(() => {
    const fullSignUrl = window.location.href;
    generateQrCodeDataUrl(fullSignUrl).then(setQrCodeUrl);

    // Official UPI Payment QR parameters for RED FLAG MEDIA
    const upiUri = `upi://pay?pa=red.media@superyes&pn=RED%20FLAG%20MEDIA&cu=INR&tn=Onboarding%20Fee%20MOU%20${agreement.id}`;
    // If needed as a dynamic fallback:
    if (!OFFICIAL_PAYMENT_QR_URL) {
      generateQrCodeDataUrl(upiUri).then(setPaymentQrCodeUrl);
    }

    getClientIp().then(setClientIp);
  }, [agreement]);

  const clearCanvas = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setHasDrawn(false);
      setSignError('');
    }
  };

  // Asset Handlers
  const handleAddAsset = () => {
    const newAsset: AssetDetail = {
      id: `asset_${Date.now()}`,
      propertyAddress: '',
      bhkCount: '3 BHK',
    };
    setAssets([...assets, newAsset]);
  };

  const handleRemoveAsset = (id: string) => {
    if (assets.length === 1) return;
    setAssets(assets.filter((a) => a.id !== id));
  };

  const handleAssetChange = (id: string, field: 'propertyAddress' | 'bhkCount', val: string) => {
    setAssets(assets.map((a) => (a.id === id ? { ...a, [field]: val } : a)));
  };

  // Step 1 Submit -> Proceed to Selfie Step
  const handleSaveClientDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryAddress = assets[0]?.propertyAddress || agreement.propertyAddress;

    const updatedAgr: AgreementData = {
      ...agreement,
      partyAName: clientName,
      partyAEmail: clientEmail,
      partyAMobile: clientMobile,
      propertyAddress: primaryAddress,
      assets,
      partyAGovtIdType: govtIdType,
      partyAGovtIdNumber: govtIdNumber,
      partyAGovtIdDocUrl: uploadedGovtIdUrl || undefined,
      partyABankDetails: {
        accountName: bankHolderName || clientName,
        bankName: bankName,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
      },
      status: 'Viewed',
    };
    setAgreement(updatedAgr);
    setTypedName(clientName);
    setStep('selfie');
  };

  // Live Selfie Camera Capture
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // Fallback if camera denied/unavailable
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0, 320, 240);
      const dataUrl = canvas.toDataURL('image/png');
      setSelfieUrl(dataUrl);

      // Stop camera stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  const handleSelfieFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelfieUrl(reader.result);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleGovtIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setUploadedGovtIdName(file.name);
      setUploadedGovtIdUrl(URL.createObjectURL(file));
    }
  };

  const handlePaymentScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setPaymentScreenshotName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPaymentScreenshotUrl(reader.result);
          setPaymentError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUploadedSignatureUrl(reader.result);
          setSignError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Confirm Signature & Execute Contract
  const handleConfirmSignature = async () => {
    setSignError('');
    let signatureData = '';

    if (signatureType === 'draw') {
      if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
        setSignError('Please draw your hand signature on screen before proceeding.');
        return;
      }
      signatureData = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
    } else if (signatureType === 'type') {
      if (!typedName.trim()) {
        setSignError('Please enter your full legal name.');
        return;
      }
      signatureData = typedName;
    } else if (signatureType === 'upload') {
      if (!uploadedSignatureUrl) {
        setSignError('Please upload a signature image file.');
        return;
      }
      signatureData = uploadedSignatureUrl;
    }

    const ip = await getClientIp();

    const audit = createAuditCertificate(
      agreement,
      signatureType,
      signatureData,
      ip,
      undefined,
      paymentTxId,
      paymentScreenshotUrl || undefined
    );

    const updatedAgreement: AgreementData = {
      ...agreement,
      status: 'Signed',
      signedAt: audit.signedTimestamp,
      clientSelfieUrl: selfieUrl || undefined,
      paymentTransactionId: paymentTxId || undefined,
      paymentScreenshotUrl: paymentScreenshotUrl || undefined,
      auditTrail: audit,
    };

    setFinalAuditTrail(audit);
    setAgreement(updatedAgreement);
    setStep('completed');

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#DC2626', '#10B981', '#FFFFFF', '#F59E0B'],
      });
    } catch (e) {
      console.log('Confetti', e);
    }

    onCompleteSigning(updatedAgreement, audit);

    // Send emails from agreements@redflaghomes.in
    fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: clientEmail || agreement.salesExecutiveEmail,
        subject: `Welcome to Red Flag Homes! Executed MOU - ${agreement.title}`,
        agreementId: agreement.id,
        bodyText: `Welcome ${clientName}! Your Memorandum of Understanding has been successfully executed with Red Flag Homes. Payment Transaction ID: ${paymentTxId || 'Verified'}. Verified audit stamp & digital company seal applied.`,
        attachments: ['Signed_MOU_Agreement.pdf', 'Audit_Certificate.pdf'],
      }),
    }).catch(console.error);
  };

  const fullMouText = renderMouText(agreement);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Portal Navigation Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <RedFlagLogo size="md" />

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline-block">
            Doc ID: <strong className="text-red-400">{agreement.id}</strong>
          </span>

          {onBackToCRM && (
            <button
              onClick={onBackToCRM}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
            >
              Back to CRM Desk
            </button>
          )}
        </div>
      </header>

      {/* Main Stepper Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Step Progression Bar */}
        <div className="grid grid-cols-5 gap-1.5 bg-zinc-900 border border-zinc-800 p-2 rounded-2xl text-center text-[11px] font-semibold">
          <div
            className={`py-2 rounded-xl transition-all ${
              step === 'details' ? 'bg-red-600 text-white shadow' : 'bg-zinc-950 text-zinc-400'
            }`}
          >
            1. Client & Assets
          </div>
          <div
            className={`py-2 rounded-xl transition-all ${
              step === 'selfie' ? 'bg-red-600 text-white shadow' : 'bg-zinc-950 text-zinc-400'
            }`}
          >
            2. Live Selfie
          </div>
          <div
            className={`py-2 rounded-xl transition-all ${
              step === 'payment' ? 'bg-red-600 text-white shadow' : 'bg-zinc-950 text-zinc-400'
            }`}
          >
            3. Onboarding Fee
          </div>
          <div
            className={`py-2 rounded-xl transition-all ${
              step === 'review' ? 'bg-red-600 text-white shadow' : 'bg-zinc-950 text-zinc-400'
            }`}
          >
            4. Read MOU
          </div>
          <div
            className={`py-2 rounded-xl transition-all ${
              step === 'sign' || step === 'completed' ? 'bg-red-600 text-white shadow' : 'bg-zinc-950 text-zinc-400'
            }`}
          >
            5. E-Sign & Seal
          </div>
        </div>

        {/* STEP 1: CLIENT DETAILS & MULTI-ASSET PROPERTY ENTRY */}
        {step === 'details' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="border-b border-zinc-800 pb-4 space-y-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                Step 1 of 5
              </span>
              <h2 className="text-lg font-extrabold text-white">
                Owner Details & Property Asset Setup
              </h2>
              <p className="text-xs text-zinc-400">
                Please enter your owner information, property addresses, and BHK room counts.
              </p>
            </div>

            <form onSubmit={handleSaveClientDetails} className="space-y-6">
              {/* Owner Identity */}
              <div className="space-y-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider border-b border-zinc-800/80 pb-2">
                  <User className="w-4 h-4" />
                  <span>Property Owner Personal Info</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Rohan Oberoi"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientMobile}
                      onChange={(e) => setClientMobile(e.target.value)}
                      placeholder="+91 98112 34567"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="rohan.oberoi@domain.com"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Asset / Property Details */}
              <div className="space-y-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                    <Building className="w-4 h-4" />
                    <span>Registered Property Assets & Room Counts</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAsset}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Property</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {assets.map((asset, index) => (
                    <div
                      key={asset.id}
                      className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-red-400">
                          Property Asset #{index + 1}
                        </span>

                        {assets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAsset(asset.id)}
                            className="text-zinc-500 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
                            Full Property Address *
                          </label>
                          <input
                            type="text"
                            required
                            value={asset.propertyAddress}
                            onChange={(e) =>
                              handleAssetChange(asset.id, 'propertyAddress', e.target.value)
                            }
                            placeholder="Penthouse 4B, Golf Course Road, Gurugram"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
                            Room Count / BHK Config *
                          </label>
                          <input
                            type="text"
                            required
                            value={asset.bhkCount}
                            onChange={(e) =>
                              handleAssetChange(asset.id, 'bhkCount', e.target.value)
                            }
                            placeholder="e.g. 3 BHK, 4 BHK Villa, Studio"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Govt ID & Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Govt ID */}
                <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-3">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                    Government ID Verification
                  </span>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
                      ID Type
                    </label>
                    <select
                      value={govtIdType}
                      onChange={(e) => setGovtIdType(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white"
                    >
                      <option value="Aadhaar">Aadhaar Card</option>
                      <option value="PAN">PAN Card</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving Licence">Driving Licence</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
                      ID Number
                    </label>
                    <input
                      type="text"
                      required
                      value={govtIdNumber}
                      onChange={(e) => setGovtIdNumber(e.target.value)}
                      placeholder="4589-1234-9012"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-2 text-xs text-zinc-300 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-red-400" />
                      <span className="truncate max-w-[140px]">
                        {uploadedGovtIdName || 'Upload Govt ID Photo'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleGovtIdUpload}
                        accept="image/*,application/pdf"
                      />
                    </label>
                  </div>
                </div>

                {/* Bank Payout */}
                <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-3">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                    Bank Payout Settlement Account
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Holder Name</label>
                      <input
                        type="text"
                        required
                        value={bankHolderName}
                        onChange={(e) => setBankHolderName(e.target.value)}
                        placeholder="Rohan Oberoi"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Bank Name</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="HDFC Bank"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Account No.</label>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="002101584930"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        required
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="HDFC0000021"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-extrabold text-xs shadow-xl shadow-red-950 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Proceed to Live Selfie Identity Verification</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: LIVE SELFIE PHOTO VERIFICATION */}
        {step === 'selfie' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6 max-w-lg mx-auto text-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                Step 2 of 5
              </span>
              <h2 className="text-lg font-extrabold text-white">Live Selfie Verification</h2>
              <p className="text-xs text-zinc-400">
                Capture a quick live selfie photo with your webcam or upload a photo to verify your identity.
              </p>
            </div>

            {/* Selfie Preview or Camera Box */}
            <div className="relative w-64 h-64 mx-auto rounded-2xl bg-zinc-950 border-2 border-red-500/50 flex flex-col items-center justify-center overflow-hidden shadow-inner">
              {selfieUrl ? (
                <img src={selfieUrl} alt="Live Selfie" className="w-full h-full object-cover" />
              ) : isCameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="space-y-2 p-4 text-center">
                  <Camera className="w-10 h-10 text-red-500 mx-auto" />
                  <span className="text-xs text-zinc-400 block font-mono">Camera Ready</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              {!isCameraActive && !selfieUrl && (
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow"
                >
                  Start Webcam
                </button>
              )}

              {isCameraActive && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow"
                >
                  Capture Photo
                </button>
              )}

              <label className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-zinc-700 cursor-pointer">
                <span>Upload Photo</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleSelfieFileUpload}
                  accept="image/*"
                />
              </label>
            </div>

            <button
              onClick={() => setStep('payment')}
              disabled={!selfieUrl}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                selfieUrl
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-950'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <span>Verify Selfie & Proceed to Onboarding Fee Payment</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: ONBOARDING FEE PAYMENT VERIFICATION */}
        {step === 'payment' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6 max-w-xl mx-auto">
            <div className="text-center space-y-1 border-b border-zinc-800 pb-4">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                Step 3 of 5
              </span>
              <h2 className="text-lg font-extrabold text-white">
                Pay the Onboarding Fees As Discussed
              </h2>
              <p className="text-xs text-zinc-400">
                Scan the official RED FLAG MEDIA UPI QR code or transfer directly to our UPI ID, then enter your Transaction / UTR ID & upload a receipt screenshot.
              </p>
            </div>

            {/* QR Code & Payment Information Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 items-center">
              {/* Payment QR Code Image Slot */}
              <div className="text-center space-y-2 bg-white p-3 rounded-2xl shadow-xl border border-zinc-200">
                <div className="overflow-hidden rounded-xl bg-white flex items-center justify-center">
                  <img
                    src="/assets/aistudio/Cachessm-qr-1792916128716_188686eb.png"
                    alt="Official UPI Payment QR - RED FLAG MEDIA"
                    className="w-full max-w-[210px] h-auto object-contain mx-auto transition-transform hover:scale-105 duration-200"
                  />
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold text-red-600 uppercase tracking-wider font-sans">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan via Any UPI App</span>
                </div>
              </div>

              {/* Payment Account Details */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold mb-0.5">
                    Beneficiary Name
                  </span>
                  <strong className="text-white font-extrabold text-sm tracking-wide block">
                    RED FLAG MEDIA
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold mb-0.5">
                        Official UPI ID
                      </span>
                      <strong className="text-red-400 font-mono font-bold text-sm truncate block">
                        red.media@superyes
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold border border-zinc-700 flex items-center gap-1 transition-all shrink-0 active:scale-95"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                    Supported Payment Apps
                  </span>
                  <p className="text-[11px] text-zinc-300 mt-0.5">
                    super.money, Google Pay, PhonePe, Paytm, BHIM, CRED & all UPI apps
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                    Official Corporate Email
                  </span>
                  <strong className="text-zinc-300 font-mono text-[11px]">
                    agreements@redflaghomes.in
                  </strong>
                </div>
              </div>
            </div>

            {/* Payment Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!paymentTxId.trim()) {
                  setPaymentError('Please enter your payment Transaction ID / UTR number.');
                  return;
                }
                setPaymentError('');
                setStep('review');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">
                  Payment Transaction ID / UTR Number *
                </label>
                <input
                  type="text"
                  required
                  value={paymentTxId}
                  onChange={(e) => setPaymentTxId(e.target.value)}
                  placeholder="e.g. UPI/429104812390 or UTR-982104"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">
                  Upload Payment Confirmation Screenshot
                </label>
                <label className="flex items-center justify-between bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="truncate max-w-[200px]">
                      {paymentScreenshotName || 'Upload Screenshot (PNG / JPG)'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800/40">
                    Browse File
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handlePaymentScreenshotUpload}
                    accept="image/*"
                  />
                </label>

                {paymentScreenshotUrl && (
                  <div className="mt-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                    <img
                      src={paymentScreenshotUrl}
                      alt="Payment Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-red-500/50"
                    />
                    <div className="text-[11px] text-emerald-400 font-mono font-bold">
                      ✓ Payment Receipt Screenshot Attached
                    </div>
                  </div>
                )}
              </div>

              {paymentError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 text-center">
                  {paymentError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-extrabold text-xs shadow-xl shadow-red-950 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Submit Payment Details & Review Agreement</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: REVIEW AGREEMENT */}
        {step === 'review' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                  Step 4 of 5
                </span>
                <h2 className="text-lg font-extrabold text-white">
                  Review Memorandum of Understanding (MOU)
                </h2>
                <p className="text-xs text-zinc-400">
                  Property Owner: <strong>{agreement.partyAName}</strong> ({assets.length} Property Asset Registered)
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-3 py-2 rounded-xl border border-zinc-700 transition-colors shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
            </div>

            {/* Document Scroll Box */}
            <div className="bg-white text-zinc-900 p-6 sm:p-8 rounded-xl border border-zinc-300 max-h-96 overflow-y-auto font-serif text-xs leading-relaxed whitespace-pre-wrap shadow-inner select-none relative">
              {fullMouText}

              {/* Bottom-Right Verified Audit Stamp inside Preview Box */}
              <div className="mt-6 flex justify-end">
                <DocumentAuditStamp
                  clientName={agreement.partyAName}
                  ipAddress={clientIp}
                  timestamp={new Date().toISOString()}
                />
              </div>
            </div>

            {/* Terms Acceptance Checkbox */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-zinc-700 text-red-600 focus:ring-red-500"
                />
                <span className="text-xs text-zinc-300 leading-normal">
                  I, <strong>{agreement.partyAName}</strong>, hereby confirm that I have read, understood, and agreed to all terms, clauses, and payout splits (83% Owner / 17% Red Flag Homes) set forth in this Memorandum of Understanding.
                </span>
              </label>

              <button
                disabled={!acceptedTerms}
                onClick={() => setStep('sign')}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  acceptedTerms
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-950'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <span>Proceed to Digital Signature & Seal</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: DIGITAL HAND SIGNATURE CAPTURE */}
        {step === 'sign' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                  Final Step
                </span>
                <h2 className="text-lg font-extrabold text-white">Capture Hand Signature</h2>
                <p className="text-xs text-zinc-400">
                  Sign for: <strong>{agreement.partyAName}</strong> (Property Owner)
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Identity Verified</span>
              </div>
            </div>

            {/* Signature Type Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-semibold">
              <button
                onClick={() => {
                  setSignatureType('draw');
                  setSignError('');
                }}
                className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  signatureType === 'draw' ? 'bg-red-600 text-white shadow' : 'text-zinc-400'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Draw Hand Signature</span>
              </button>
              <button
                onClick={() => {
                  setSignatureType('upload');
                  setSignError('');
                }}
                className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  signatureType === 'upload' ? 'bg-red-600 text-white shadow' : 'text-zinc-400'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Signature Image</span>
              </button>
            </div>

            {/* DRAW HAND SIGNATURE CANVAS WITH react-signature-canvas */}
            {signatureType === 'draw' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-3">
                    <span>Pen Ink Color:</span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { label: 'Crimson Red', color: '#DC2626' },
                        { label: 'Navy Blue', color: '#1E3A8A' },
                        { label: 'Midnight Black', color: '#09090B' },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => setPenColor(c.color)}
                          className={`w-5 h-5 rounded-full border border-zinc-600 transition-transform ${
                            penColor === c.color ? 'scale-125 ring-2 ring-red-500' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-red-400 hover:text-red-300 font-semibold underline text-xs flex items-center gap-1"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Clear Canvas</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-2 border-2 border-red-500/50 shadow-inner relative">
                  <SignatureCanvas
                    ref={sigCanvasRef}
                    penColor={penColor}
                    minWidth={1.8}
                    maxWidth={3.8}
                    velocityFilterWeight={0.7}
                    canvasProps={{
                      className: 'w-full h-44 rounded-xl cursor-crosshair touch-none bg-white',
                    }}
                    onBegin={() => {
                      setHasDrawn(true);
                      setSignError('');
                    }}
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-400 text-xs font-mono">
                      Draw your hand signature here on touch screen or mouse
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* UPLOAD SIGNATURE */}
            {signatureType === 'upload' && (
              <div className="space-y-3">
                <label className="block border-2 border-dashed border-zinc-700 hover:border-red-500 rounded-2xl p-8 text-center cursor-pointer bg-zinc-950 transition-colors">
                  <Upload className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <span className="text-xs font-bold text-white block">Upload Signature Image</span>
                  <span className="text-[10px] text-zinc-400">PNG or JPG file with transparent/white background</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleUploadSignature}
                    accept="image/*"
                  />
                </label>

                {uploadedSignatureUrl && (
                  <div className="p-3 bg-white rounded-xl border border-zinc-300 text-center space-y-1">
                    <span className="text-[10px] text-zinc-500 block">Uploaded Signature Preview:</span>
                    <img
                      src={uploadedSignatureUrl}
                      alt="Uploaded Signature"
                      className="h-20 mx-auto object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {signError && (
              <p className="text-xs text-red-400 font-semibold text-center bg-red-950/50 p-2.5 rounded-xl border border-red-800/40">
                {signError}
              </p>
            )}

            {/* Confirm & Execute Button */}
            <button
              onClick={handleConfirmSignature}
              className="w-full bg-gradient-to-r from-red-700 via-red-600 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-extrabold text-sm py-4 rounded-xl shadow-2xl shadow-red-950 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Award className="w-5 h-5" />
              <span>Confirm & Execute MOU Signature</span>
            </button>
          </div>
        )}

        {/* COMPLETED - DISPLAY EXECUTED AGREEMENT WITH DIGITAL SEAL & BOTTOM-RIGHT VERIFIED STAMP */}
        {step === 'completed' && finalAuditTrail && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                MOU Fully Executed
              </span>
              <h2 className="text-2xl font-black text-white">Agreement Signed & Officially Sealed!</h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Welcome dispatches emailed from <strong>agreements@redflaghomes.in</strong> to <strong>{clientEmail}</strong> and onboarding team <strong>hello@redflaghomes.in</strong>.
              </p>
            </div>

            {/* Official Digital Company Seal Card */}
            <DigitalCompanySeal
              agreementId={agreement.id}
              timestamp={finalAuditTrail.signedTimestamp}
              qrCodeUrl={qrCodeUrl}
            />

            {/* Audit Trail Certificate Card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-left text-xs space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-sans flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" /> Digital Audit Certificate
                </span>
                <span className="text-emerald-400 font-bold">{finalAuditTrail.certificateId}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-300">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Client / Party A:</span>
                  <span className="text-white font-bold">{agreement.partyAName}</span>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[10px]">Signed Timestamp:</span>
                  <span className="text-white">{new Date(finalAuditTrail.signedTimestamp).toLocaleString('en-IN')}</span>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[10px]">Client IP Address:</span>
                  <span className="text-white">{finalAuditTrail.ipAddress}</span>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[10px]">Browser & Device:</span>
                  <span className="text-white">{finalAuditTrail.browser}</span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-zinc-500 block text-[10px]">Document Hash (SHA-256):</span>
                  <span className="text-red-400 truncate block text-[10px]">{finalAuditTrail.documentHash}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-red-950"
              >
                <Download className="w-4 h-4" />
                <span>Download Signed MOU PDF</span>
              </button>

              {onBackToCRM && (
                <button
                  onClick={onBackToCRM}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs px-5 py-3 rounded-xl border border-zinc-700"
                >
                  Return to Internal Sales Desk
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
