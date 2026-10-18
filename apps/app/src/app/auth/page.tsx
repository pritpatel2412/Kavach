'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Frame,
  HatchOverlay,
  GlassCard,
  Button,
  Input,
  Icon,
  KavachLogo,
} from '@kavach/ui';

export default function AuthPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'phone' | 'email' | 'passkey'>('phone');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Set mock token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('kavach_guardian_token', 'mock_guardian_token_v4_789');
        localStorage.setItem('kavach_guardian_phone', phone);
      }
      router.push('/');
    }, 800);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleAutofillDemoOtp = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
  };

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setMagicLinkSent(true);
    }, 600);
  };

  const handleSimulateOpenMagicLink = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kavach_guardian_token', 'mock_guardian_token_v4_789');
      localStorage.setItem('kavach_guardian_email', email);
    }
    router.push('/');
  };

  const handlePasskeyAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kavach_guardian_token', 'mock_guardian_passkey_token_123');
      }
      router.push('/');
    }, 1000);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kavach_guardian_token', 'mock_guardian_google_token_456');
      }
      router.push('/');
    }, 800);
  };

  return (
    <Frame withHatch={false} className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <HatchOverlay />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <KavachLogo size={42} showWordmark={true} />
          </div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
            Guardian Portal Sign In
          </h1>
          <p className="text-xs text-white/60 font-body">
            Strictly passwordless security for Indian family caregivers.
          </p>
        </div>

        {/* Auth Method Selector */}
        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs font-heading font-semibold">
          <button
            type="button"
            onClick={() => { setMethod('phone'); setOtpSent(false); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              method === 'phone' ? 'bg-[#c8f542] text-stone-950 font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            Mobile OTP
          </button>
          <button
            type="button"
            onClick={() => { setMethod('email'); setMagicLinkSent(false); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              method === 'email' ? 'bg-[#c8f542] text-stone-950 font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            Magic Link
          </button>
          <button
            type="button"
            onClick={() => setMethod('passkey')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              method === 'passkey' ? 'bg-[#c8f542] text-stone-950 font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            Passkey
          </button>
        </div>

        {/* Card Body */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          {/* Method 1: Phone OTP */}
          {method === 'phone' && (
            <>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-heading font-semibold text-white/90 mb-1.5">
                      Caregiver Mobile Number (India)
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/18 bg-white/5 text-white/95 text-xs font-mono focus:outline-none focus:border-[#c8f542]"
                      />
                    </div>
                    <div className="text-[11px] text-white/40 mt-1 font-mono">
                      We dispatch an instant 6-digit OTP via SMS / WhatsApp.
                    </div>
                  </div>

                  <Button
                    variant="lime"
                    size="md"
                    type="submit"
                    disabled={isLoading}
                    className="w-full justify-center"
                    icon="send-bold"
                  >
                    {isLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-semibold text-white/90">
                      Enter 6-Digit Code
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] font-mono text-[#c8f542] hover:underline"
                    >
                      Change Phone
                    </button>
                  </div>

                  <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-12 h-12 text-center rounded-xl border border-white/18 bg-white/5 text-white text-lg font-mono font-bold focus:outline-none focus:border-[#c8f542] focus:bg-[#c8f542]/10"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/50 pt-1">
                    <span>Code sent to {phone}</span>
                    <button
                      type="button"
                      onClick={handleAutofillDemoOtp}
                      className="text-[#c8f542] font-mono underline"
                    >
                      Auto-fill (123456)
                    </button>
                  </div>

                  <Button
                    variant="lime"
                    size="md"
                    type="submit"
                    disabled={isLoading || otp.join('').length < 6}
                    className="w-full justify-center"
                    icon="shield-check-bold"
                  >
                    {isLoading ? 'Verifying...' : 'Access Dashboard'}
                  </Button>
                </form>
              )}
            </>
          )}

          {/* Method 2: Magic Link */}
          {method === 'email' && (
            <>
              {!magicLinkSent ? (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <Input
                    label="Caregiver Work / Personal Email"
                    type="email"
                    placeholder="vikram@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <Button
                    variant="lime"
                    size="md"
                    type="submit"
                    disabled={isLoading}
                    className="w-full justify-center"
                    icon="letter-bold"
                  >
                    {isLoading ? 'Dispatching Link...' : 'Send Magic Link'}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#c8f542]/15 text-[#c8f542] flex items-center justify-center mx-auto">
                    <Icon name="letter-opened-bold" size={24} />
                  </div>
                  <h3 className="font-heading font-bold text-white text-base">Check Your Inbox</h3>
                  <p className="text-xs text-white/60 font-body">
                    We sent a secure sign-in token to <strong>{email}</strong>.
                  </p>
                  <Button
                    variant="lime"
                    size="sm"
                    onClick={handleSimulateOpenMagicLink}
                    icon="arrow-right-linear"
                  >
                    Simulate Opening Magic Link
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Method 3: Passkey */}
          {method === 'passkey' && (
            <div className="text-center space-y-4 py-3">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-[#c8f542] flex items-center justify-center mx-auto">
                <Icon name="fingerprint-bold" size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-white text-base">WebAuthn Biometric Passkey</h3>
                <p className="text-xs text-white/60 font-body max-w-xs mx-auto">
                  Sign in instantly using Touch ID, Windows Hello, or Android Fingerprint.
                </p>
              </div>
              <Button
                variant="lime"
                size="md"
                onClick={handlePasskeyAuth}
                disabled={isLoading}
                className="w-full justify-center"
                icon="fingerprint-bold"
              >
                {isLoading ? 'Authenticating Sensor...' : 'Authenticate with Device'}
              </Button>
            </div>
          )}

          {/* Social / Alternative divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-wider">
              <span className="bg-[#0a2a12] px-3 text-white/40">Or Continue With</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            variant="ghost"
            size="md"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full justify-center border-white/18 text-xs font-heading font-semibold"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </span>
          </Button>
        </GlassCard>

        {/* DPDP Compliance Notice */}
        <div className="text-center text-[11px] text-white/40 font-mono space-y-1">
          <div>Protected by Indian DPDP Act 2023 · Zero Password Vulnerability</div>
          <a href="http://localhost:3000" className="text-[#c8f542] hover:underline">
            Back to Public Homepage
          </a>
        </div>
      </div>
    </Frame>
  );
}
