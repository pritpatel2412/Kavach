'use client';

import React, { useState } from 'react';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  Tabs,
  Icon,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { LegalBanner } from '../../components/LegalBanner';

export default function ConsentNoticePage() {
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('en');

  return (
    <Frame withHatch={false} className="pb-16">
      <HatchOverlay />
      <SiteHeader />

      <main className="relative z-10 px-6 sm:px-10 lg:px-12 pt-12 max-w-4xl mx-auto space-y-8">
        <LegalBanner category="Consent Notice" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/18 bg-white/5 text-xs font-mono text-white/80">
            <Icon name="verified-check-bold" size={14} color="#c8f542" />
            <span>Trilingual Senior Citizen Notice · DPDP 2023 Aligned</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white/95">
            Plain-Language Elder Consent Notice
          </h1>

          <p className="text-xs sm:text-sm text-white/60 font-body">
            This notice is designed for household display or reading aloud before activating Kavach on a living room tablet.
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang('en')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
              lang === 'en'
                ? 'bg-[#c8f542] text-stone-950 font-bold'
                : 'bg-white/5 text-white/70 hover:text-white border border-white/10'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang('hi')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
              lang === 'hi'
                ? 'bg-[#c8f542] text-stone-950 font-bold'
                : 'bg-white/5 text-white/70 hover:text-white border border-white/10'
            }`}
          >
            हिन्दी (Hindi)
          </button>
          <button
            onClick={() => setLang('gu')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
              lang === 'gu'
                ? 'bg-[#c8f542] text-stone-950 font-bold'
                : 'bg-white/5 text-white/70 hover:text-white border border-white/10'
            }`}
          >
            ગુજરાતી (Gujarati)
          </button>
        </div>

        {/* Notice Card */}
        <GlassCard className="p-6 sm:p-10 space-y-6">
          {lang === 'en' && (
            <div className="space-y-5 text-white/90 font-body">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
                  Notice to Senior Household Members
                </h2>
                <div className="text-xs font-mono text-white/50 pt-1">
                  Plain English · No Fine Print
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-white/80">
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
                <p className="text-xs text-white/60 pt-2 border-t border-white/10">
                  You can turn this device off at any time by pressing the red &ldquo;Stop Guardian&rdquo; button on the screen.
                </p>
              </div>
            </div>
          )}

          {lang === 'hi' && (
            <div className="space-y-5 text-white/90 font-body">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
                  घर के वरिष्ठ सदस्यों के लिए सूचना
                </h2>
                <div className="text-xs font-mono text-white/50 pt-1">
                  सरल हिन्दी भाषा · कोई गुप्त नियम नहीं
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-white/80">
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
                <p className="text-xs text-white/60 pt-2 border-t border-white/10">
                  आप जब चाहें स्क्रीन पर लाल बटन दबाकर इसे बंद कर सकते हैं।
                </p>
              </div>
            </div>
          )}

          {lang === 'gu' && (
            <div className="space-y-5 text-white/90 font-body">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
                  ઘરના વડીલ સભ્યો માટે સૂચના
                </h2>
                <div className="text-xs font-mono text-white/50 pt-1">
                  સરળ ગુજરાતી ભાષા · કોઈ છૂપી શરતો નથી
                </div>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-white/80">
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
                <p className="text-xs text-white/60 pt-2 border-t border-white/10">
                  તમે કોઈપણ સમયે સ્ક્રીન પર લાલ બટન દબાવીને આ બંધ કરી શકો છો.
                </p>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Printable button */}
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm" icon="printer-bold" onClick={() => window.print()}>
            Print Household Physical Notice Card
          </Button>
        </div>

        <SiteFooter />
      </main>
    </Frame>
  );
}
