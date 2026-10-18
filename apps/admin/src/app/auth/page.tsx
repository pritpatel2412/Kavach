'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  Icon,
  KavachLogo,
} from '@kavach/ui';

export default function AdminAuthPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'google' | 'passkey' | 'totp'>('google');
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulateAdminLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kavach_admin_token', 'mock_admin_session_token_xyz');
      }
      router.push('/');
    }, 800);
  };

  return (
    <Frame withHatch={false} className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <HatchOverlay />

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <KavachLogo size={42} showWordmark={true} />
          </div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
            Kavach Security Operations Console
          </h1>
          <div className="inline-block p-1 px-3 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
            Zero Passwords · Hardware MFA Required
          </div>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs font-heading font-semibold">
            <button
              onClick={() => setMethod('google')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                method === 'google' ? 'bg-[#c8f542] text-stone-950 font-bold' : 'text-white/70 hover:text-white'
              }`}
            >
              Google Workspace
            </button>
            <button
              onClick={() => setMethod('passkey')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                method === 'passkey' ? 'bg-[#c8f542] text-stone-950 font-bold' : 'text-white/70 hover:text-white'
              }`}
            >
              FIDO2 Passkey
            </button>
            <button
              onClick={() => setMethod('totp')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                method === 'totp' ? 'bg-[#c8f542] text-stone-950 font-bold' : 'text-white/70 hover:text-white'
              }`}
            >
              TOTP Authenticator
            </button>
          </div>

          {method === 'google' && (
            <div className="space-y-4 text-center py-2">
              <p className="text-xs text-white/70 font-body">
                Authorized @kavach.ai internal engineering personnel only.
              </p>
              <Button
                variant="lime"
                size="md"
                onClick={handleSimulateAdminLogin}
                disabled={isLoading}
                className="w-full justify-center"
              >
                {isLoading ? 'Verifying Workspace SSO...' : 'Sign in with Kavach SSO'}
              </Button>
            </div>
          )}

          {method === 'passkey' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-[#c8f542] flex items-center justify-center mx-auto">
                <Icon name="key-bold" size={24} />
              </div>
              <p className="text-xs text-white/70 font-body">
                Insert your YubiKey or authenticate with device biometrics.
              </p>
              <Button
                variant="lime"
                size="md"
                onClick={handleSimulateAdminLogin}
                disabled={isLoading}
                className="w-full justify-center"
                icon="fingerprint-bold"
              >
                {isLoading ? 'Reading Security Key...' : 'Authenticate Hardware Key'}
              </Button>
            </div>
          )}

          {method === 'totp' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-semibold text-white/90 mb-1.5">
                  6-Digit Authenticator App Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000 000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/18 bg-white/5 text-white text-center font-mono text-lg font-bold tracking-widest focus:outline-none focus:border-[#c8f542]"
                />
              </div>
              <Button
                variant="lime"
                size="md"
                onClick={handleSimulateAdminLogin}
                disabled={isLoading || totpCode.length < 6}
                className="w-full justify-center"
              >
                {isLoading ? 'Validating Token...' : 'Verify TOTP & Access'}
              </Button>
            </div>
          )}
        </GlassCard>

        <div className="text-center text-[11px] text-white/40 font-mono">
          Strict access audit logging enabled under ISO 27001 &amp; DPDP 2023.
        </div>
      </div>
    </Frame>
  );
}
