import {
  WaitlistSubmission,
  WaitlistSubmissionSchema,
  Coupon,
  GuardianProfile,
  AlertIncident,
  UsageRecord,
  TaxInvoice,
} from './types';

// Mock in-memory state
const MOCK_WAITLIST: WaitlistSubmission[] = [];

const MOCK_COUPONS: Record<string, Coupon> = {
  KAVACH50: {
    code: 'KAVACH50',
    discountPercent: 50,
    valid: true,
    message: '50% inaugural community discount applied!',
  },
  BETAFAMILY: {
    code: 'BETAFAMILY',
    discountPercent: 100,
    valid: true,
    message: '100% full sponsorship beta pass applied!',
  },
};

const MOCK_GUARDIAN: GuardianProfile = {
  id: 'g-7819',
  name: 'Rahul Sharma',
  phone: '+91 98765 43210',
  email: 'rahul.sharma@example.com',
  telegramChatId: '@rahul_kavach_bot',
  voiceCloned: true,
  voiceConsentDate: '2026-10-15',
  planTier: 'plus',
  monthlyQuotaMinutes: 150,
  usedMinutesThisMonth: 42,
  emergencyReserveMinutes: 30,
  elders: [
    {
      id: 'elder-01',
      name: 'Kamla Sharma (Mummy)',
      preferredLanguage: 'hi',
      relation: 'Mother',
      deviceId: 'dev-living-room',
      consentSigned: true,
      consentDate: '2026-10-15',
    },
    {
      id: 'elder-02',
      name: 'Satish Sharma (Papa)',
      preferredLanguage: 'hi',
      relation: 'Father',
      deviceId: 'dev-bedroom',
      consentSigned: true,
      consentDate: '2026-10-15',
    },
  ],
  devices: [
    {
      id: 'dev-living-room',
      name: 'Living Room Tablet',
      pairingCode: 'KV-8821',
      status: 'listening',
      lastHeartbeat: new Date().toISOString(),
      batteryLevel: 94,
      isHandsFreeVadEnabled: false,
      elderId: 'elder-01',
    },
    {
      id: 'dev-bedroom',
      name: 'Bedside Phone',
      pairingCode: 'KV-4190',
      status: 'armed',
      lastHeartbeat: new Date().toISOString(),
      batteryLevel: 88,
      isHandsFreeVadEnabled: false,
      elderId: 'elder-02',
    },
  ],
};

const MOCK_ALERTS: AlertIncident[] = [
  {
    id: 'inc-992',
    elderId: 'elder-01',
    elderName: 'Kamla Sharma (Mummy)',
    timestamp: 'Today, 2:45 PM',
    level: 3,
    score: 85,
    scamFamily: 'digital_arrest',
    reasonHi: 'सीबीआई और अरेस्ट वारंट का डर दिखाकर तुरंत पैसे ट्रांसफर करने को कहा गया',
    reasonEn: 'Caller impersonated CBI authority and demanded safe account verification transfer',
    transcriptExcerpt: 'CBI office se bol raha hoon, aapke naam par non-bailable warrant hai, safe account mein transfer karo...',
    actionTaken: 'intercom',
    feedbackVerifiedScam: true,
  },
  {
    id: 'inc-980',
    elderId: 'elder-02',
    elderName: 'Satish Sharma (Papa)',
    timestamp: 'Yesterday, 11:15 AM',
    level: 2,
    score: 70,
    scamFamily: 'electricity',
    reasonHi: 'बिजली कटने का दबाव बनाया गया',
    reasonEn: 'Power disconnection within hours threat detected',
    transcriptExcerpt: 'Aapka bijli ka bill baki hai, raat ko 9 baje light cut ho jayegi...',
    actionTaken: 'phone_call',
    feedbackVerifiedScam: true,
  },
];

const MOCK_USAGE: UsageRecord[] = [
  {
    id: 'usg-01',
    timestamp: 'Today, 2:45 PM',
    elderName: 'Kamla Sharma',
    durationSeconds: 180,
    minutesDeducted: 3,
    levelReached: 3,
    wasEmergencyReserveUsed: false,
  },
  {
    id: 'usg-02',
    timestamp: 'Yesterday, 11:15 AM',
    elderName: 'Satish Sharma',
    durationSeconds: 120,
    minutesDeducted: 2,
    levelReached: 2,
    wasEmergencyReserveUsed: false,
  },
  {
    id: 'usg-03',
    timestamp: '14 Oct 2026, 4:20 PM',
    elderName: 'Kamla Sharma',
    durationSeconds: 60,
    minutesDeducted: 1,
    levelReached: 0,
    wasEmergencyReserveUsed: false,
  },
];

const MOCK_INVOICES: TaxInvoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'KV-2026-0041',
    date: '01 Oct 2026',
    amount: 149,
    taxAmountGst: 22.73,
    planName: 'Plus Plan (Monthly)',
    status: 'paid',
    downloadUrl: '#',
  },
  {
    id: 'inv-092',
    invoiceNumber: 'KV-2026-0018',
    date: '01 Sep 2026',
    amount: 149,
    taxAmountGst: 22.73,
    planName: 'Plus Plan (Monthly)',
    status: 'paid',
    downloadUrl: '#',
  },
];

export const mockApi = {
  // Waitlist
  submitWaitlist: async (data: unknown) => {
    await new Promise((r) => setTimeout(r, 400));
    const parsed = WaitlistSubmissionSchema.parse(data);
    MOCK_WAITLIST.push(parsed);
    return {
      success: true,
      message: 'Thank you for joining the Kavach early protection waitlist! We will reach out via WhatsApp/SMS.',
      position: 1420 + MOCK_WAITLIST.length,
    };
  },

  // Validate coupon
  validateCoupon: async (code: string): Promise<Coupon> => {
    await new Promise((r) => setTimeout(r, 300));
    const upper = code.trim().toUpperCase();
    if (MOCK_COUPONS[upper]) {
      return MOCK_COUPONS[upper];
    }
    return {
      code: upper,
      discountPercent: 0,
      valid: false,
      message: 'Invalid or expired coupon code.',
    };
  },

  // Guardian profile
  getGuardianProfile: async (): Promise<GuardianProfile> => {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_GUARDIAN;
  },

  // Alerts
  getAlerts: async (): Promise<AlertIncident[]> => {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_ALERTS;
  },

  // Usage ledger
  getUsageLedger: async (): Promise<UsageRecord[]> => {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_USAGE;
  },

  // Tax Invoices
  getInvoices: async (): Promise<TaxInvoice[]> => {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_INVOICES;
  },
};
