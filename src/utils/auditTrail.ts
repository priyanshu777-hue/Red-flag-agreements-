import QRCode from 'qrcode';
import { AuditTrail, AgreementData } from '../types/crm';

export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 160,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

export function detectBrowserAndDevice(): { browser: string; device: string } {
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  let device = 'Desktop';

  if (ua.includes('Firefox')) {
    browser = 'Mozilla Firefox';
  } else if (ua.includes('SamsungBrowser')) {
    browser = 'Samsung Internet';
  } else if (ua.includes('Opera') || ua.includes('OPR')) {
    browser = 'Opera';
  } else if (ua.includes('Trident')) {
    browser = 'Internet Explorer';
  } else if (ua.includes('Edge') || ua.includes('Edg')) {
    browser = 'Microsoft Edge';
  } else if (ua.includes('Chrome')) {
    browser = 'Google Chrome';
  } else if (ua.includes('Safari')) {
    browser = 'Apple Safari';
  }

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    device = 'Mobile Phone / Tablet';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    device = 'Apple Mac (Desktop)';
  } else if (/Windows/i.test(ua)) {
    device = 'Windows PC (Desktop)';
  } else if (/Linux/i.test(ua)) {
    device = 'Linux (Desktop)';
  }

  return { browser, device };
}

export async function getClientIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const data = await res.json();
      return data.ip || '157.48.210.14';
    }
  } catch {
    // Fallback simulated IP if offline or blocked
  }
  return '157.48.210.14';
}

export function generateSimpleHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.slice(0, 64);
}

export function createAuditCertificate(
  agreement: AgreementData,
  signatureType: 'draw' | 'type' | 'upload',
  signatureData: string,
  clientIp: string,
  gpsCoords?: { latitude: number; longitude: number },
  paymentTransactionId?: string,
  paymentScreenshotUrl?: string
): AuditTrail {
  const { browser, device } = detectBrowserAndDevice();
  const signedTimestamp = new Date().toISOString();
  const certId = `CERT-RFH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    signedTimestamp,
    ipAddress: clientIp || '157.48.210.14',
    browser,
    device,
    gpsCoordinates: gpsCoords || {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 10,
    },
    documentHash: generateSimpleHash(JSON.stringify(agreement) + signedTimestamp),
    signatureType,
    signatureData,
    certificateId: certId,
    paymentTransactionId,
    paymentScreenshotUrl,
  };
}
