/**
 * 10 Targeted Scam Families with solar icons
 */

export interface ScamFamily {
  id: string;
  name: string;
  hindiName: string;
  icon: string; // solar icon name
  description: string;
}

export const SCAM_FAMILIES: ScamFamily[] = [
  {
    id: 'digital_arrest',
    name: 'Digital Arrest (CBI / Police)',
    hindiName: 'डिजिटल अरेस्ट (सीबीआई/पुलिस)',
    icon: 'shield-warning-bold',
    description: 'Fake police officers coercing victims to stay on video under threat of immediate arrest.',
  },
  {
    id: 'courier_fedex',
    name: 'Customs / FedEx Narcotics Parcel',
    hindiName: 'कूरियर पार्सल (ड्रग्स/कस्टम्स)',
    icon: 'box-minimalistic-bold',
    description: 'Threats claiming banned contraband or narcotics were seized in an overseas parcel.',
  },
  {
    id: 'electricity',
    name: 'Electricity Disconnection Tonight',
    hindiName: 'बिजली बिल बकाया नोटिस',
    icon: 'bolt-bold',
    description: 'Urgent notice that power will be cut off within hours unless a quick payment is made.',
  },
  {
    id: 'kyc_bank',
    name: 'KYC & Bank Account Block',
    hindiName: 'बैंक खाता व पैन ब्लॉक',
    icon: 'card-broken-bold',
    description: 'Impersonating bank managers claiming Aadhaar or PAN is unlinked and funds are frozen.',
  },
  {
    id: 'sim_trai',
    name: 'TRAI SIM Deactivation',
    hindiName: 'ट्राई सिम कार्ड ब्लॉक',
    icon: 'sim-card-bold',
    description: 'Robocalls claiming all phone numbers registered to the Aadhaar will be terminated.',
  },
  {
    id: 'relative_distress',
    name: 'Relative in Hospital / Custody',
    hindiName: 'बेटे/रिश्तेदार का एक्सीडेंट या कस्टडी',
    icon: 'hospital-bold',
    description: 'Sobbing impersonator claiming your child has had an accident or been detained.',
  },
  {
    id: 'remote_access',
    name: 'Remote Access (AnyDesk / TeamViewer)',
    hindiName: 'स्क्रीन शेयरिंग / एनीडेस्क ऐप',
    icon: 'monitor-bold',
    description: 'Tricking elderly victims into downloading remote desktop tools to drain bank apps.',
  },
  {
    id: 'investment',
    name: 'Fake Pre-IPO / High Return Trading',
    hindiName: 'फर्जी ट्रेडिंग व शेयर बाजार मुनाफा',
    icon: 'chart-bold',
    description: 'Guaranteed 500% profit promises in exclusive VIP WhatsApp/Telegram trading groups.',
  },
  {
    id: 'otp_pin',
    name: 'Lottery Prize / Bill Refund OTP',
    hindiName: 'रिफंड व लॉटरी ओटीपी फ्रॉड',
    icon: 'key-minimalistic-bold',
    description: 'Urgent requests to read out two-factor SMS OTPs under pretext of processing a refund.',
  },
  {
    id: 'sextortion',
    name: 'Video Call Blackmail',
    hindiName: 'वीडियो कॉल ब्लैकमेल',
    icon: 'video-frame-bold',
    description: 'Threatening to leak morphed screenshots to family contacts unless extortion money is sent.',
  },
];
