/**
 * Kavach Sourced Claims & Statistics Source of Truth (docs/CLAIMS.md)
 * Strictly no unverified or invented statistics.
 */

export interface ClaimItem {
  id: string;
  metric: string;
  value: string;
  citation: string;
  sourceUrl: string;
  retrievalDate: string;
  verified: boolean;
}

export const SOURCED_CLAIMS = {
  ncrpLosses: {
    id: 'ncrp-complaints-loss',
    metric: 'National Cybercrime Complaints & Financial Loss (2022–May 2026)',
    complaints: '297,727',
    lossCrore: '₹4,057.7',
    lossFormatted: '₹4,057.7 crore',
    citation: 'National Cybercrime Reporting Portal (NCRP) government data, reported by News18 and cited by NewsBytes (6 Jul 2026)',
    sourceUrl: 'https://www.newsbytesapp.com/news/science/india-s-digital-arrest-scam-causes-4-000cr-losses-in-3-years/story',
    retrievalDate: '2026-07-06',
    verified: true,
  },
  puneCyberPolice: {
    id: 'pune-cyber-police-2026',
    metric: 'Senior Citizen Cyber Extortion in Pune (19 months)',
    lossCrore: '₹100+',
    lossFormatted: 'Over ₹100 crore',
    cases: '136 cases',
    notableLoss: '₹10.75 crore lost by single 82-year-old victim',
    citation: 'Pune Cyber Police Department official report, published in Punekar News (21 Sep 2026)',
    sourceUrl: 'https://www.punekarnews.in/?p=245348',
    retrievalDate: '2026-09-21',
    verified: true,
  },
  detectorRecall: {
    id: 'kavach-scam-recall-speakerphone',
    metric: 'Scam Call Recall before Payment Demand (Typical Speakerphone WER 20%)',
    value: '97.3%',
    ci95: '[86.2%, 99.5%]',
    sampleSize: '36/37 calls flagged at L2 before payment',
    citation: 'Kavach offline multi-lingual synthetic text testbed (eval/out/summary.md)',
    sourceUrl: 'eval/out/summary.md',
    retrievalDate: '2026-10-17',
    verified: true,
  },
  ambientFalseAlarm: {
    id: 'kavach-ambient-false-alarm',
    metric: 'Household Ambient Background False Alarms',
    value: '0.0 alerts / 1,000 segments',
    ci95: '[0.0, 9.5] / 1,000',
    sampleSize: '0 / 400 continuous household segments (TV news, serials, prayers)',
    citation: 'Kavach ambient testbed (eval/ambient/dev_ambient.json and sealed_test_ambient.json)',
    sourceUrl: 'eval/out/summary.md',
    retrievalDate: '2026-10-17',
    verified: true,
  },
  detectionLatency: {
    id: 'kavach-detection-latency',
    metric: 'End-to-End Decision Latency',
    value: '< 650 ms',
    citation: 'Measured in synthetic audio replay session benchmarks',
    sourceUrl: 'docs/PITCH.md',
    retrievalDate: '2026-10-17',
    verified: true,
  },
} as const;
