export type Role = 'Admin' | 'Sales Manager' | 'Sales Executive' | 'Viewer';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  phone: string;
  totalClosed: number;
  totalRevenue: number;
}

export type LeadStage =
  | 'New Lead'
  | 'Contacted'
  | 'Interested'
  | 'Meeting Scheduled'
  | 'Negotiation'
  | 'Agreement Sent'
  | 'Signed'
  | 'Onboarded'
  | 'Lost';

export interface LeadDocument {
  id: string;
  name: string;
  type: 'Aadhaar' | 'PAN' | 'Passport' | 'Driving Licence' | 'Property Photo' | 'Ownership Proof' | 'Other';
  url: string;
  uploadedAt: string;
  size: string;
}

export interface CallLog {
  id: string;
  date: string;
  duration: string;
  summary: string;
  outcome: 'Connected' | 'Busy' | 'Follow-up Needed' | 'Not Interested' | 'Scheduled Meeting';
  executiveName: string;
}

export interface Lead {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  city: string;
  propertyAddress: string;
  airbnbUrl?: string;
  numberOfProperties: number;
  expectedRevenue: number; // in INR
  source: 'Website' | 'WhatsApp Inbound' | 'Referral' | 'Cold Outreach' | 'Instagram' | 'LinkedIn' | 'Direct Call';
  salesExecutiveId: string;
  salesExecutiveName: string;
  stage: LeadStage;
  notes: string[];
  documents: LeadDocument[];
  followUpDate?: string;
  callHistory: CallLog[];
  whatsappStatus: 'Not Contacted' | 'Message Sent' | 'Replied' | 'Negotiating' | 'Shared MOU';
  createdAt: string;
  updatedAt: string;
  agreementId?: string;
}

export type AgreementStatus =
  | 'Draft'
  | 'Inactive'
  | 'Agreement Sent'
  | 'Viewed'
  | 'Awaiting Client Details'
  | 'Awaiting Signature'
  | 'Signed'
  | 'Rejected'
  | 'Expired';

export type TemplateType = 'mou' | 'nda' | 'partnership' | 'employment' | 'vendor';

export interface AuditTrail {
  signedTimestamp: string;
  ipAddress: string;
  browser: string;
  device: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  documentHash: string;
  otpVerifiedAt?: string;
  otpMethod?: 'Email OTP' | 'Mobile OTP';
  signatureType: 'draw' | 'type' | 'upload';
  signatureData: string; // Data URL or text
  certificateId: string;
  paymentTransactionId?: string;
  paymentScreenshotUrl?: string;
}

export interface AssetDetail {
  id: string;
  propertyAddress: string;
  bhkCount: string; // e.g. "3 BHK", "2 BHK Apartment", "4 BHK Villa"
  city?: string;
}

export interface AgreementData {
  id: string; // e.g. RFH-MOU-2026-8921
  leadId: string;
  templateType: TemplateType;
  title: string;
  
  // Client (Party A) details
  partyAName: string;
  partyAMobile?: string;
  partyAEmail?: string;
  propertyAddress: string;
  
  // Multiple Assets / Properties added by Client
  assets?: AssetDetail[];
  
  // Verification details
  partyAGovtIdType?: 'Aadhaar' | 'PAN' | 'Passport' | 'Driving Licence';
  partyAGovtIdNumber?: string;
  partyAGovtIdDocUrl?: string;
  clientSelfieUrl?: string; // Live Selfie Photo
  paymentTransactionId?: string; // Onboarding payment transaction / UTR ID
  paymentScreenshotUrl?: string; // Onboarding payment receipt screenshot
  
  partyABankDetails?: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  
  // MOU Terms
  effectiveDate: string;
  place: string;
  commissionPercent: number; // default 17%
  ownerPercent: number; // default 83%
  coHostPercent: number; // default 17%
  occupancyTarget: string; // e.g. "60% - 70%"
  noticePeriod: string; // e.g. "15 days"
  lockInPeriod: string; // e.g. "6 months"
  
  salesExecutiveName: string;
  salesExecutiveMobile: string;
  salesExecutiveEmail: string;
  
  status: AgreementStatus;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  expiresAt?: string;
  
  publicSignUrl: string;
  qrCodeUrl?: string;
  
  auditTrail?: AuditTrail;
  rejectionReason?: string;
}

export interface EmailLog {
  id: string;
  sender: string;
  recipient: string;
  recipientType: 'Client' | 'Internal Onboarding';
  subject: string;
  agreementId: string;
  status: 'Sent' | 'Delivered' | 'Opened' | 'Failed';
  sentAt: string;
  attachments: string[];
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'opened' | 'signed' | 'rejected' | 'reminder' | 'lead_assigned';
  agreementId?: string;
  leadId?: string;
  read: boolean;
}
