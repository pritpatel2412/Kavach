import plansSlaData from './plans_sla.json';

export const PRICING_CONFIRMED = plansSlaData.pricingConfirmed;
export const GST_RATE = plansSlaData.gstRate;
export const MAX_DISCOUNT_PERCENT = plansSlaData.maxDiscountPercent;
export const SLAS = plansSlaData.slas;

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanTier {
  id: 'free' | 'plus' | 'family';
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  isPopular?: boolean;
  minutesPerMonth: number;
  emergencyReserveMinutes: number;
  eldersCovered: number;
  devicesSupported: number;
  features: PlanFeature[];
  ctaLabel: string;
}

export const PLANS: PlanTier[] = plansSlaData.plans as PlanTier[];


export const PRICING_FAQS = [
  {
    id: 'faq-1',
    question: 'How do listening minutes work? Does Kavach burn minutes when quiet?',
    answer:
      'Never. Kavach employs client-side energy-VAD silence gating. When the room is quiet or normal ambient chatter is below threshold, zero audio is streamed and zero minutes are counted. Quota is consumed only during active, sustained phone conversations on speakerphone.',
  },
  {
    id: 'faq-2',
    question: 'What is the Emergency Scam Reserve?',
    answer:
      'If an elder is in the middle of a suspected multi-stage scam call and their monthly quota runs out, Kavach automatically unlocks the Emergency Reserve so protection never cuts out when money is at risk.',
  },
  {
    id: 'faq-3',
    question: 'Does Kavach record or tap regular phone calls?',
    answer:
      'No. Kavach is a zero-interception second-device guardian. It runs on an old phone or tablet sitting on the table. The elder takes unfamiliar calls on speakerphone, and Kavach listens through the room microphone.',
  },
  {
    id: 'faq-4',
    question: 'Are prices inclusive of GST?',
    answer:
      'Yes, all displayed subscription prices are inclusive of 18% Goods & Services Tax (GST). A compliant tax invoice with GSTIN is generated for every payment.',
  },
  {
    id: 'faq-5',
    question: 'How does voice cloning consent work?',
    answer:
      'Voice cloning is restricted strictly to consenting family caregivers reading single-use randomized Hindi or English liveness challenge sentences. Consent is verifiable and the voice profile can be deleted with 1 click at any time.',
  },
];
