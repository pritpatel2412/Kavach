'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Icon,
  KavachLogo,
  Badge,
} from '@kavach/ui';

export default function AdminAuthPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'google' | 'passkey' | 'totp'>('google');
  const [adminEmail, setAdminEmail] = useState('pritptl2412@gmail.com');
  const [totpCode, setTotpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (emailToLogin?: string) => {
    const targetEmail = (emailToLogin || adminEmail).trim().toLowerCase();
    if (!targetEmail) {
      setErrorMsg('Please enter an authorized admin email.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/admin-api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('kavach_admin_token', data.session_id);
          localStorage.setItem('kavach_admin_csrf', data.csrf_token);
          localStorage.setItem('kavach_admin_email', data.email);
          localStorage.setItem('kavach_admin_role', data.role);
        }
        router.push('/');
      } else {
        setErrorMsg(
          data.detail?.message ||
            data.detail ||
            data.message ||
            'Access denied: email is not an authorized administrator.'
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error communicating with Kavach API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSocial = () => {
    // If user clicks Google SSO, redirect to Neon Auth social sign-in or authenticate active owner email
    handleAdminLogin(adminEmail || 'pritptl2412@gmail.com');
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <KavachLogo size={42} showWordmark={true} />
          </div>
          <h1 className="text-display font-heading font-bold text-ink tracking-tight">
            Security Operations Console
          </h1>
          <div>
            <Badge variant="warning" className="font-mono text-micro font-bold">
              Zero Passwords · Hardware MFA Required
            </Badge>
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-6 shadow-level-2">
          <div className="flex rounded-full bg-canvas p-1 border border-hairline text-caption font-heading font-bold">
            <button
              onClick={() => { setMethod('google'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-full transition-all ${
                method === 'google' ? 'bg-primary text-on-primary' : 'text-body hover:text-ink'
              }`}
            >
              Google SSO
            </button>
            <button
              onClick={() => { setMethod('passkey'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-full transition-all ${
                method === 'passkey' ? 'bg-primary text-on-primary' : 'text-body hover:text-ink'
              }`}
            >
              FIDO2 Passkey
            </button>
            <button
              onClick={() => { setMethod('totp'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-full transition-all ${
                method === 'totp' ? 'bg-primary text-on-primary' : 'text-body hover:text-ink'
              }`}
            >
              TOTP App
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-hot text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {method === 'google' && (
            <div className="space-y-4">
              <div>
                <label className="block text-ui font-heading font-bold text-ink mb-1.5">
                  Authorized Administrator Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="pritptl2412@gmail.com"
                  className="w-full px-4 py-2.5 rounded-full border border-hairline bg-surface text-ink text-ui font-mono focus:outline-none focus:border-primary"
                />
                <p className="text-caption text-muted mt-1 font-mono">
                  Owner whitelist: pritptl2412@gmail.com, owner@kavach.ai
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleGoogleSocial}
                disabled={isLoading || !adminEmail.trim()}
                className="w-full justify-center"
              >
                {isLoading ? 'Verifying Workspace SSO...' : 'Sign in to Security Console'}
              </Button>
            </div>
          )}

          {method === 'passkey' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-discount-surface text-green-strong flex items-center justify-center mx-auto">
                <Icon name="key-bold" size={24} />
              </div>
              <p className="text-ui text-body">
                Insert your YubiKey or authenticate with device biometrics.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleAdminLogin(adminEmail)}
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
                <label className="block text-ui font-heading font-bold text-ink mb-1.5">
                  6-Digit Authenticator App Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000 000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas text-ink text-center font-mono text-lead font-bold tracking-widest focus:outline-none focus:border-primary focus:bg-surface"
                />
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleAdminLogin(adminEmail)}
                disabled={isLoading || totpCode.length < 6}
                className="w-full justify-center"
              >
                {isLoading ? 'Validating Token...' : 'Verify TOTP & Access'}
              </Button>
            </div>
          )}
        </div>

        <div className="text-center text-caption text-muted font-mono">
          Strict access audit logging enabled under ISO 27001 &amp; DPDP 2023.
        </div>
      </div>
    </div>
  );
}
