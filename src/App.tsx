import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/auth/LoginScreen';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { AgreementGenerator } from './components/agreements/AgreementGenerator';
import { AgreementPreviewModal } from './components/agreements/AgreementPreviewModal';
import { AgreementList } from './components/agreements/AgreementList';
import { PublicSigningPortal } from './components/signing/PublicSigningPortal';
import { ReportsView } from './components/reports/ReportsView';
import { EmailLogsView } from './components/email/EmailLogsView';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { TemplateChatbot, GeneratedTemplateData } from './components/chat/TemplateChatbot';

import {
  INITIAL_LEADS,
  INITIAL_AGREEMENTS,
  INITIAL_STAFF_USERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EMAIL_LOGS,
} from './data/initialData';
import { Lead, AgreementData, StaffUser, SystemNotification, EmailLog, AuditTrail } from './types/crm';

export default function App() {
  // Check if opening direct public signing link e.g. /sign/RFH-MOU-2026-8921
  const path = window.location.pathname;
  const isDirectSignLink = path.startsWith('/sign/');
  const directSignAgrId = isDirectSignLink ? path.split('/sign/')[1] : null;

  // Single Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('rfh_authenticated') === 'true';
  });

  // Persistent or seed states
  const [staffList, setStaffList] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('rfh_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_USERS;
  });

  const [currentUser, setCurrentUser] = useState<StaffUser>(() => staffList[0]);

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('rfh_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [agreements, setAgreements] = useState<AgreementData[]>(() => {
    const saved = localStorage.getItem('rfh_agreements');
    return saved ? JSON.parse(saved) : INITIAL_AGREEMENTS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('rfh_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('rfh_email_logs');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_LOGS;
  });

  // UI Navigation states
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isAgreementGeneratorOpen, setIsAgreementGeneratorOpen] = useState(false);
  const [previewAgreement, setPreviewAgreement] = useState<AgreementData | null>(null);

  const [isSigningPortalActive, setIsSigningPortalActive] = useState<boolean>(isDirectSignLink);
  const [signingAgreement, setSigningAgreement] = useState<AgreementData | null>(() => {
    if (directSignAgrId) {
      return agreements.find((a) => a.id === directSignAgrId) || agreements[0];
    }
    return agreements[0];
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('rfh_authenticated', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('rfh_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('rfh_agreements', JSON.stringify(agreements));
  }, [agreements]);

  useEffect(() => {
    localStorage.setItem('rfh_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('rfh_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  // Handle Login
  const handleLoginSuccess = (userEmail: string) => {
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.setItem('rfh_authenticated', 'false');
  };

  // MOU Agreement Operations
  const handleGenerateAgreement = (newAgreement: AgreementData) => {
    setAgreements([newAgreement, ...agreements]);
    setIsAgreementGeneratorOpen(false);
    setPreviewAgreement(newAgreement);

    const newNotif: SystemNotification = {
      id: `notif_${Date.now()}`,
      title: 'Signing Link Dispatched',
      message: `MOU ${newAgreement.id} generated for ${newAgreement.partyAName}. Signing link active.`,
      timestamp: new Date().toISOString(),
      type: 'opened',
      agreementId: newAgreement.id,
      read: false,
    };
    setNotifications([newNotif, ...notifications]);
  };

  // E-Signature Completion Handler
  const handleCompleteSigning = (signedAgr: AgreementData, auditTrail: AuditTrail) => {
    const updatedAgreements = agreements.map((a) => (a.id === signedAgr.id ? signedAgr : a));
    setAgreements(updatedAgreements);

    // Email to Client & hello@redflaghomes.in
    const clientEmailLog: EmailLog = {
      id: `email_${Date.now()}`,
      sender: 'agreements@redflaghomes.in',
      recipient: signedAgr.partyAEmail || signedAgr.partyAName,
      recipientType: 'Client',
      subject: `Welcome to Red Flag Homes! Signed MOU Executed - ${signedAgr.title}`,
      agreementId: signedAgr.id,
      status: 'Delivered',
      sentAt: new Date().toISOString(),
      attachments: ['Signed_MOU_Agreement.pdf', `Audit_Certificate_${auditTrail.certificateId}.pdf`],
    };

    const onboardingEmailLog: EmailLog = {
      id: `email_onboarding_${Date.now()}`,
      sender: 'agreements@redflaghomes.in',
      recipient: 'hello@redflaghomes.in',
      recipientType: 'Internal Onboarding',
      subject: `[NEW CLIENT ONBOARDED] Signed MOU ${signedAgr.id} - ${signedAgr.partyAName}`,
      agreementId: signedAgr.id,
      status: 'Delivered',
      sentAt: new Date().toISOString(),
      attachments: ['Signed_MOU_Agreement.pdf', `Audit_Certificate_${auditTrail.certificateId}.pdf`],
    };

    setEmailLogs([clientEmailLog, onboardingEmailLog, ...emailLogs]);

    const notif: SystemNotification = {
      id: `notif_${Date.now()}`,
      title: 'New Client Onboarded!',
      message: `${signedAgr.partyAName} signed MOU ${signedAgr.id}. Automated welcome email sent.`,
      timestamp: new Date().toISOString(),
      type: 'signed',
      agreementId: signedAgr.id,
      read: false,
    };
    setNotifications([notif, ...notifications]);
  };

  const handleOpenSigningPortalForAgreement = (agr: AgreementData) => {
    setSigningAgreement(agr);
    setIsSigningPortalActive(true);
  };

  const handleTriggerTestEmail = (recipient: string, subject: string, agreementId: string) => {
    fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient,
        subject,
        agreementId,
        bodyText: `Red Flag Homes Listing & Property Management MOU Agreement ${agreementId} executed dispatches.`,
        attachments: ['Signed_MOU_Document.pdf', 'Audit_Certificate.pdf'],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Backend email dispatch response:', data);
      })
      .catch((err) => console.error('Backend email dispatch error:', err));

    const newLog: EmailLog = {
      id: `email_${Date.now()}`,
      sender: 'agreements@redflaghomes.in',
      recipient,
      recipientType: 'Client',
      subject,
      agreementId,
      status: 'Delivered',
      sentAt: new Date().toISOString(),
      attachments: ['Signed_MOU_Document.pdf', 'Audit_Certificate.pdf'],
    };
    setEmailLogs((prev) => [newLog, ...prev]);
  };

  // Direct public client signing portal view (e.g., /sign/:id)
  if (isSigningPortalActive && signingAgreement) {
    return (
      <PublicSigningPortal
        agreement={signingAgreement}
        onCompleteSigning={handleCompleteSigning}
        onBackToCRM={isAuthenticated ? () => setIsSigningPortalActive(false) : undefined}
      />
    );
  }

  // Render Login Screen if unauthenticated
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onRoleChange={(role) => setCurrentUser({ ...currentUser, role })}
        onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        onOpenNewLeadModal={() => setIsAgreementGeneratorOpen(true)}
        onOpenNewAgreementModal={() => setIsAgreementGeneratorOpen(true)}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        staffList={staffList}
        onUserSelect={(u) => setCurrentUser(u)}
        onSignOut={handleSignOut}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'sign-portal') {
              setSigningAgreement(agreements[0]);
              setIsSigningPortalActive(true);
            }
          }}
          pendingAgreementsCount={
            agreements.filter((a) => a.status === 'Inactive' || a.status === 'Awaiting Signature' || a.status === 'Viewed').length
          }
        />

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-zinc-950/60">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              leads={leads}
              agreements={agreements}
              staffList={staffList}
              onSelectLead={() => {}}
              onOpenNewLead={() => setIsAgreementGeneratorOpen(true)}
              onOpenNewAgreement={() => setIsAgreementGeneratorOpen(true)}
              onNavigateToTab={(tab) => {
                if (tab === 'agreements' || tab === 'reports' || tab === 'sign-portal') {
                  setActiveTab(tab);
                } else {
                  setActiveTab('agreements');
                }
              }}
              notifications={notifications}
            />
          )}

          {activeTab === 'agreements' && (
            <div className="space-y-6">
              {isAgreementGeneratorOpen ? (
                <AgreementGenerator
                  selectedLead={null}
                  staffList={staffList}
                  onGenerateAgreement={handleGenerateAgreement}
                  onClose={() => setIsAgreementGeneratorOpen(false)}
                />
              ) : (
                <AgreementList
                  agreements={agreements}
                  onOpenNewAgreementModal={() => setIsAgreementGeneratorOpen(true)}
                  onPreviewAgreement={(a) => setPreviewAgreement(a)}
                  onOpenSigningPortal={handleOpenSigningPortalForAgreement}
                  onSendEmailReminder={(a) => handleTriggerTestEmail(a.partyAEmail || a.salesExecutiveEmail, `Reminder: ${a.title}`, a.id)}
                />
              )}
            </div>
          )}

          {activeTab === 'ai-chat' && (
            <TemplateChatbot
              onSaveTemplateToCRM={(tpl) => {
                const notif: SystemNotification = {
                  id: `notif_tpl_${Date.now()}`,
                  title: 'New AI Template Added',
                  message: `Template "${tpl.title}" created via Gemini AI Architect and added to generator.`,
                  timestamp: new Date().toISOString(),
                  type: 'opened',
                  read: false,
                };
                setNotifications((prev) => [notif, ...prev]);
              }}
            />
          )}

          {activeTab === 'email-logs' && (
            <EmailLogsView
              emailLogs={emailLogs}
              agreements={agreements}
              onTriggerTestEmail={handleTriggerTestEmail}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView leads={leads} agreements={agreements} staffList={staffList} />
          )}
        </main>
      </div>

      {/* Modals & Slide-over Drawers */}
      <AgreementPreviewModal
        agreement={previewAgreement}
        onClose={() => setPreviewAgreement(null)}
        onSendEmailToClient={(a) => handleTriggerTestEmail(a.partyAEmail || a.salesExecutiveEmail, `Executed MOU: ${a.title}`, a.id)}
        onOpenSigningPortal={(a) => {
          setPreviewAgreement(null);
          handleOpenSigningPortalForAgreement(a);
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
      />

      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        leads={leads}
        agreements={agreements}
        onSelectLead={() => {}}
        onSelectAgreement={(a) => setPreviewAgreement(a)}
      />
    </div>
  );
}
