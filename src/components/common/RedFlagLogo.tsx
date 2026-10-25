import React from 'react';

export const RED_FLAG_LOGO_IMAGE_URL =
  '/assets/aistudio/ec40325c1bacec5725a086ea6c3ab3a75283239a10ae149630fc38dec9ae72ca_ec40325c.webp';

interface RedFlagLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'color';
  className?: string;
  showText?: boolean;
}

export const RedFlagLogo: React.FC<RedFlagLogoProps> = ({
  size = 'md',
  variant = 'color',
  className = '',
  showText = true,
}) => {
  const dimensions = {
    sm: { img: 'h-7', box: 'p-1 rounded-xl', title: 'text-xs', sub: 'text-[8px]' },
    md: { img: 'h-9', box: 'p-1.5 rounded-xl', title: 'text-sm', sub: 'text-[9px]' },
    lg: { img: 'h-12', box: 'p-2 rounded-2xl', title: 'text-lg', sub: 'text-[11px]' },
    xl: { img: 'h-16', box: 'p-2.5 rounded-2xl', title: 'text-2xl', sub: 'text-xs' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Official Red Flag Homes Emblem Badge */}
      <div
        className={`bg-white shadow-md shadow-red-950/40 ring-2 ring-red-500/40 shrink-0 flex items-center justify-center overflow-hidden transition-all ${dimensions.box}`}
      >
        <img
          src={RED_FLAG_LOGO_IMAGE_URL}
          alt="Red Flag Homes Network"
          className={`${dimensions.img} w-auto object-contain drop-shadow-sm`}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-black tracking-tight ${dimensions.title} ${
              variant === 'dark' ? 'text-zinc-900' : 'text-white'
            }`}
          >
            RED FLAG <span className="text-red-600">HOMES</span>
          </span>
          <span
            className={`font-bold tracking-widest uppercase ${dimensions.sub} ${
              variant === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
            }`}
          >
            Homes Network
          </span>
        </div>
      )}
    </div>
  );
};

// Official Digital Company Seal Component for Executed Agreements & PDF Overlays
interface DigitalCompanySealProps {
  agreementId: string;
  timestamp?: string;
  qrCodeUrl?: string;
  variant?: 'dark' | 'light';
  className?: string;
}

export const DigitalCompanySeal: React.FC<DigitalCompanySealProps> = ({
  agreementId,
  timestamp,
  qrCodeUrl,
  variant = 'dark',
  className = '',
}) => {
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  const isLight = variant === 'light';

  return (
    <div
      className={`p-4 rounded-2xl border-2 shadow-xl relative overflow-hidden select-none transition-all ${
        isLight
          ? 'bg-zinc-50 border-red-600/80 text-zinc-900'
          : 'bg-gradient-to-br from-red-950/30 via-zinc-900/60 to-zinc-950 border-red-600/70 text-white'
      } ${className}`}
    >
      {/* Background Seal Watermark */}
      <div className="absolute -right-6 -bottom-6 w-36 h-36 opacity-10 pointer-events-none overflow-hidden">
        <img
          src={RED_FLAG_LOGO_IMAGE_URL}
          alt="Watermark"
          className="w-full h-full object-contain filter grayscale"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 relative z-10">
        <div className="flex items-center gap-3.5">
          {/* Official Red Flag Logo Image Badge in Seal */}
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center ring-2 ring-red-500/60 p-1 shadow-lg shadow-red-950/50 shrink-0 overflow-hidden">
            <img
              src={RED_FLAG_LOGO_IMAGE_URL}
              alt="Red Flag Homes Official Seal"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-left space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-red-600 bg-red-100 border border-red-300 dark:bg-red-950/80 dark:text-red-400 dark:border-red-800/60 px-2 py-0.5 rounded">
                Official Company Seal
              </span>
              <span className="text-[9px] font-mono text-emerald-600 font-bold">
                ✓ Executed
              </span>
            </div>

            <h4 className="text-xs font-black tracking-tight uppercase leading-snug">
              Digitally Signed by Red Flag Homes
            </h4>

            <div className="text-[10px] font-mono opacity-80 space-x-2">
              <span>
                ID: <strong className="text-red-600 font-bold">{agreementId}</strong>
              </span>
              <span>·</span>
              <span>
                Timestamp: <strong>{formattedTime} IST</strong>
              </span>
            </div>
          </div>
        </div>

        {qrCodeUrl && (
          <div className="p-1 bg-white rounded-lg border border-zinc-300 text-center shrink-0 shadow-sm">
            <img src={qrCodeUrl} alt="Verification QR" className="w-12 h-12" />
            <span className="text-[7px] font-mono text-zinc-600 block leading-none pt-0.5">
              Verify Seal
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Document Verified Audit Stamp (Right Bottom Corner)
interface DocumentAuditStampProps {
  clientName: string;
  ipAddress?: string;
  location?: string;
  device?: string;
  timestamp?: string;
  className?: string;
}

export const DocumentAuditStamp: React.FC<DocumentAuditStampProps> = ({
  clientName,
  ipAddress = '157.48.210.14',
  location = 'New Delhi, India',
  device = 'Desktop / Mobile Device',
  timestamp,
  className = '',
}) => {
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  return (
    <div
      className={`p-3 rounded-xl bg-zinc-50 border-2 border-emerald-600 text-zinc-900 font-mono text-[10px] shadow-lg space-y-1 relative select-none ${className}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-200 pb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 font-sans flex items-center gap-1">
          <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Verification Audit
        </span>
        <span className="text-[9px] font-bold text-emerald-800 uppercase">Verified</span>
      </div>

      <div className="space-y-0.5 leading-tight">
        <div>
          Client: <strong className="text-zinc-900">{clientName}</strong>
        </div>
        <div>
          IP Address: <strong className="text-zinc-800">{ipAddress}</strong>
        </div>
        <div>
          Location: <strong className="text-zinc-800">{location}</strong>
        </div>
        <div>
          Device: <strong className="text-zinc-800 truncate block max-w-[180px]">{device}</strong>
        </div>
        <div>
          Time: <strong className="text-zinc-800">{formattedTime}</strong>
        </div>
      </div>
    </div>
  );
};

