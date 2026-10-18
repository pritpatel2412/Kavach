/**
 * Kavach Proposed Pricing Plans & Listening Quotas
 * Flag: PRICING_CONFIRMED = false (all prices clearly labeled as "Pricing preview")
 */

export const PRICING_CONFIRMED = false;

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

export const PLANS: PlanTier[] = [
  {
    id: 'free',
    name: 'Free (Caregiver Starter)',
    tagline: 'Basic protection for single elders with manual call check',
    priceMonthly: 0,
    priceYearly: 0,
    currency: '₹',
    minutesPerMonth: 30,
    emergencyReserveMinutes: 10,
    eldersCovered: 1,
    devicesSupported: 1,
    features: [
      { text: '30 live listening minutes / month', included: true },
      { text: '10 min emergency scam reserve', included: true },
      { text: 'Real-time visual elder alert banner', included: true },
      { text: '1 family guardian Telegram alert', included: true },
      { text: 'Generic Timbre warning voice', included: true },
      { text: 'Personalized cloned family voice', included: false },
      { text: 'Live Push-to-Talk intercom', included: false },
    ],
    ctaLabel: 'Start Free',
  },
  {
    id: 'plus',
    name: 'Plus (Individual Elder)',
    tagline: 'Full scam guardian with personalized cloned family voice',
    priceMonthly: 149,
    priceYearly: 1299,
    currency: '₹',
    isPopular: true, // Middle card highlighted!
    minutesPerMonth: 150,
    emergencyReserveMinutes: 30,
    eldersCovered: 1,
    devicesSupported: 2,
    features: [
      { text: '150 live listening minutes / month', included: true },
      { text: '30 min emergency scam reserve (never expires)', included: true },
      { text: 'Consented cloned child/family warning voice', included: true },
      { text: 'Live 1-click Push-to-Talk intercom', included: true },
      { text: 'Up to 3 guardian Telegram alert recipients', included: true },
      { text: 'Detailed plain-Hindi/English incident timeline', included: true },
      { text: '7-day auto-expiring transcript retention', included: true },
    ],
    ctaLabel: 'Get Plus Plan',
  },
  {
    id: 'family',
    name: 'Family (Multi-Household)',
    tagline: 'Comprehensive coverage for both maternal & paternal parents',
    priceMonthly: 299,
    priceYearly: 2499,
    currency: '₹',
    minutesPerMonth: 400,
    emergencyReserveMinutes: 60,
    eldersCovered: 3,
    devicesSupported: 5,
    features: [
      { text: '400 shared listening minutes / month', included: true },
      { text: '60 min emergency scam reserve', included: true },
      { text: 'Up to 3 elder households covered simultaneously', included: true },
      { text: 'Multiple family voices (son, daughter, grandchild)', included: true },
      { text: 'Unlimited guardian intercom connections', included: true },
      { text: 'Priority ASR keyword biasing', included: true },
      { text: 'Dedicated WhatsApp caregiver support', included: true },
    ],
    ctaLabel: 'Get Family Plan',
  },
];

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
