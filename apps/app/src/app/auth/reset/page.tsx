'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Input,
  Icon,
  KavachLogo,
} from '@kavach/ui';
import { BRAND } from '@kavach/api-contract';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check search params first, then URL hash
    const queryToken = searchParams.get('token');
    if (queryToken) {
      setToken(queryToken);
    } else if (typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const hashToken = hashParams.get('token');
      if (hashToken) {
        setToken(hashToken);
      }
    }
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMsg('Missing or invalid password reset token. Please request a new link.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(
        'https://ep-misty-boat-a1ja6qe0.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://kavach-appp.vercel.app',
          },
          body: JSON.stringify({
            newPassword: newPassword.trim(),
            token: token.trim(),
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Your password has been successfully updated! You can now log in.');
      } else {
        setErrorMsg(
          data.message ||
            data.detail?.message ||
            data.detail ||
            'Failed to reset password. The link may have expired.'
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error connecting to Neon Auth.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand & Heading */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <KavachLogo size={42} showWordmark={true} />
        </div>
        <h1 className="text-display font-heading font-bold text-ink tracking-tight">
          Reset Your Password
        </h1>
        <p className="text-ui text-body">
          Powered by Neon Managed Auth · End-to-End Cryptographic Security
        </p>
      </div>

      <div className="bg-surface border border-hairline rounded-md p-6 sm:p-8 space-y-6 shadow-level-2">
        {errorMsg && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-hot text-xs font-mono font-bold">
            {errorMsg}
          </div>
        )}

        {successMsg ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-green-surface text-green-strong flex items-center justify-center mx-auto border border-green-light">
              <Icon name="shield-check-bold" size={24} />
            </div>
            <h2 className="font-heading font-bold text-ink text-heading">Password Reset Complete</h2>
            <p className="text-ui text-body">{successMsg}</p>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/auth')}
              className="w-full justify-center"
              icon="login-2-bold"
            >
              Sign In to Guardian Portal
            </Button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {!token && (
              <Input
                label="Reset Verification Token"
                type="text"
                placeholder="Paste the token from your email"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            )}

            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full justify-center"
              icon="key-bold"
            >
              {isLoading ? 'Updating Password...' : 'Save New Password'}
            </Button>
          </form>
        )}
      </div>

      <div className="text-center text-caption text-muted font-mono space-y-1">
        <a href="/auth" className="text-primary font-bold hover:underline">
          ← Back to Sign In
        </a>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <Suspense fallback={<div className="text-muted font-mono">Loading security token...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
