'use client';

import React, { useState } from 'react';
import {
  Button,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { LegalBanner } from '../../components/LegalBanner';

export default function ConsentNoticePage() {
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('en');

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/consent-notice" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <LegalBanner category="Consent Notice" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface text-caption font-bold text-primary">
            {/* @ts-expect-error solar icon */}
            <iconify-icon icon="solar:verified-check-bold" width="16" height="16" />
            <span>Trilingual Senior Citizen Notice · DPDP 2023 Aligned</span>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            Plain-Language Elder Consent Notice
          </h1>

          <p className="text-lead text-body font-medium">
            This notice is designed for household display or reading aloud before activating Kavach on a living room tablet.
          </p>
        </div>

        {/* Language Switcher Full-Round Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-4 py-1.5 rounded-full text-ui font-bold transition-colors ${
              lang === 'en'
                ? 'bg-ink text-surface'
                : 'bg-surface text-body border border-hairline hover:bg-canvas hover:text-ink'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`px-4 py-1.5 rounded-full text-ui font-bold transition-colors ${
              lang === 'hi'
                ? 'bg-ink text-surface'
                : 'bg-surface text-body border border-hairline hover:bg-canvas hover:text-ink'
            }`}
          >
            हिन्दी (Hindi)
          </button>
          <button
            type="button"
            onClick={() => setLang('gu')}
            className={`px-4 py-1.5 rounded-full text-ui font-bold transition-colors ${
              lang === 'gu'
                ? 'bg-ink text-surface'
                : 'bg-surface text-body border border-hairline hover:bg-canvas hover:text-ink'
            }`}
          >
            ગુજરાતી (Gujarati)
          </button>
        </div>

        {/* Notice Card */}
        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-6 text-body font-medium text-body leading-relaxed shadow-sm">
          {lang === 'en' && (
            <div className="space-y-4">
              <div className="border-b border-hairline pb-3">
                <h2 className="text-heading font-bold text-ink">
                  Notice to Senior Household Members
                </h2>
                <div className="text-caption font-mono text-muted pt-1">
                  Plain English · No Fine Print
                </div>
              </div>

              <div className="space-y-3 text-caption font-medium text-body">
                <p>
                  <strong>What this tablet does:</strong> This device has been placed on the table by your family to protect you from telephone extortion, fake police threats, and banking fraud.
                </p>
                <p>
                  <strong>When it listens:</strong> It only listens when you take an incoming phone call on <em>Speakerphone</em>. If you talk privately on the earpiece, Kavach cannot hear.
                </p>
                <p>
                  <strong>Zero Recording of Conversations:</strong> Your voice and conversations are <em>never recorded or saved as audio files</em>. Kavach only checks whether a caller is pretending to be police or ordering you to transfer money.
                </p>
                <p>
                  <strong>Warning Alerts:</strong> If a caller tries to scare or isolate you, this tablet will loudly warn you using your son or daughter’s voice, and will notify your family immediately.
                </p>
                <p className="text-muted pt-2 border-t border-hairline">
                  You can turn this device off at any time by pressing the red &ldquo;Stop Guardian&rdquo; button on the screen.
                </p>
              </div>
            </div>
          )}

          {lang === 'hi' && (
            <div className="space-y-4">
              <div className="border-b border-hairline pb-3">
                <h2 className="text-heading font-bold text-ink">
                  घर के वरिष्ठ सदस्यों के लिए सूचना
                </h2>
                <div className="text-caption font-mono text-muted pt-1">
                  सरल हिन्दी भाषा · कोई गुप्त नियम नहीं
                </div>
              </div>

              <div className="space-y-3 text-caption font-medium text-body">
                <p>
                  <strong>यह टैबलेट क्या करता है:</strong> आपके परिवार ने आपको फर्जी पुलिस, डिजिटल अरेस्ट और बैंक धोखाधड़ी के फोन कॉल्स से बचाने के लिए यह कवच डिवाइस रखा है।
                </p>
                <p>
                  <strong>यह कब सुनता है:</strong> यह केवल तभी सुनता है जब आप किसी अनजान कॉल को <em>स्पीकरफोन (Speakerphone)</em> पर रखकर बात करते हैं।
                </p>
                <p>
                  <strong>बातचीत की कोई रिकॉर्डिंग नहीं:</strong> आपकी कोई भी व्यक्तिगत बातचीत या आवाज़ <em>रिकॉर्ड या सेव नहीं की जाती</em>। यह केवल यह जांचता है कि कहीं फोन करने वाला आपको डरा-धमका तो नहीं रहा।
                </p>
                <p>
                  <strong>सावधानी चेतावनी:</strong> यदि कोई ठग आपको धमकाता है, तो यह टैबलेट आपके बेटे या बेटी की आवाज़ में चेतावनी देगा और आपके परिवार को तुरंत संदेश भेजेगा।
                </p>
                <p className="text-muted pt-2 border-t border-hairline">
                  आप जब चाहें स्क्रीन पर लाल बटन दबाकर इसे बंद कर सकते हैं।
                </p>
              </div>
            </div>
          )}

          {lang === 'gu' && (
            <div className="space-y-4">
              <div className="border-b border-hairline pb-3">
                <h2 className="text-heading font-bold text-ink">
                  ઘરના વડીલ સભ્યો માટે સૂચના
                </h2>
                <div className="text-caption font-mono text-muted pt-1">
                  સરળ ગુજરાતી ભાષા · કોઈ છૂપી શરતો નથી
                </div>
              </div>

              <div className="space-y-3 text-caption font-medium text-body">
                <p>
                  <strong>આ ટેબ્લેટ શું કરે છે:</strong> તમારા પરિવારે તમને નકલી પોલીસ અને બેંક છેતરપિંડીના કોલથી બચાવવા માટે આ કવચ ડિવાઇસ રાખ્યું છે.
                </p>
                <p>
                  <strong>આ ક્યારે સાંભળે છે:</strong> જ્યારે તમે ફોન <em>સ્પીકર (Speakerphone)</em> પર રાખીને વાત કરો છો ત્યારે જ આ સાંભળે છે.
                </p>
                <p>
                  <strong>કોઈ પણ ઓડિયો રેકોર્ડિંગ થતું નથી:</strong> તમારી કોઈપણ વાતચીત <em>સેવ કે રેકોર્ડ કરવામાં આવતી નથી</em>. આ ફક્ત છેતરપિંડીના શબ્દો ઓળખવા માટે જ છે.
                </p>
                <p>
                  <strong>ચેતવણી:</strong> જો કોઈ તમને ડરાવવાનો પ્રયાસ કરશે, તો આ ડિવાઇસ તમારા સંતાનના અવાજમાં તમને સાવધાન કરશે અને પરિવારને જાણ કરશે.
                </p>
                <p className="text-muted pt-2 border-t border-hairline">
                  તમે કોઈપણ સમયે સ્ક્રીન પર લાલ બટન દબાવીને આ બંધ કરી શકો છો.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Printable button */}
        <div className="text-center pt-2">
          <Button variant="outline-neutral" size="md" icon="printer-bold" onClick={() => window.print()}>
            Print Household Physical Notice Card
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
