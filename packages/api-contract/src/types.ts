import { z } from 'zod';

// Waitlist Submission Schema
export const WaitlistSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contact: z.string().min(5, 'Please provide a valid Indian mobile number or email address'),
  language: z.enum(['en', 'hi', 'gu']),
  elderCount: z.number().min(1).max(10).default(1),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must consent to receive project updates and safety alerts' }),
  }),
  honeypot: z.string().max(0, 'Bot submission rejected').optional(), // Anti-spam honeypot
});

export type WaitlistSubmission = z.infer<typeof WaitlistSubmissionSchema>;

// Coupon validation
export interface Coupon {
  code: string;
  discountPercent: number;
  valid: boolean;
  message: string;
}

// User / Guardian profile
export interface GuardianProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  telegramChatId?: string;
  voiceCloned: boolean;
  voiceConsentDate?: string;
  elders: ElderProfile[];
  devices: DeviceProfile[];
  planTier: 'free' | 'plus' | 'family';
  monthlyQuotaMinutes: number;
  usedMinutesThisMonth: number;
  emergencyReserveMinutes: number;
}

export interface ElderProfile {
  id: string;
  name: string;
  preferredLanguage: 'en' | 'hi' | 'gu';
  relation: string;
  deviceId?: string;
  consentSigned: boolean;
  consentDate: string;
}

export interface DeviceProfile {
  id: string;
  name: string;
  pairingCode: string;
  status: 'armed' | 'listening' | 'offline' | 'reconnecting';
  lastHeartbeat: string;
  batteryLevel?: number;
  isHandsFreeVadEnabled: boolean;
  elderId: string;
}

export interface AlertIncident {
  id: string;
  elderId: string;
  elderName: string;
  timestamp: string;
  level: 1 | 2 | 3;
  score: number;
  scamFamily: string;
  reasonHi: string;
  reasonEn: string;
  transcriptExcerpt: string;
  actionTaken?: 'intercom' | 'phone_call' | 'cloned_voice_played';
  feedbackVerifiedScam?: boolean;
}

export interface UsageRecord {
  id: string;
  timestamp: string;
  elderName: string;
  durationSeconds: number;
  minutesDeducted: number;
  levelReached: number;
  wasEmergencyReserveUsed: boolean;
}

export interface TaxInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  taxAmountGst: number;
  planName: string;
  status: 'paid' | 'pending';
  downloadUrl: string;
}
