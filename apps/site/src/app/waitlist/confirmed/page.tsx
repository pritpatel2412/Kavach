'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@kavach/ui';
import { SiteHeader } from '../../../components/SiteHeader';
import { SiteFooter } from '../../../components/SiteFooter';

type ConfirmState = 'loading' | 'success' | 'already_confirmed' | 'expired' | 'invalid';

function WaitlistConfirmedContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const directStatus = searchParams.get('status') as ConfirmState | null;

  const [state, setState] = useState<ConfirmState>(directStatus || (token ? 'loading' : 'invalid'));
  const [rank, setRank] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (directStatus) {
      setState(directStatus);
      return;
    }

    if (!token) {
      setState('invalid');
      return;
    }

    let isMounted = true;

    async function confirmToken() {
      try {
        const res = await fetch(`/api/waitlist/confirm?token=${encodeURIComponent(token!)}`);
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.ok) {
          if (data.status === 'already_confirmed') {
            setState('already_confirmed');
          } else {
            setState('success');
          }
          setRank(data.rank || null);
          setMessage(data.message || '');
        } else {
          const errMsg = (data.detail?.message || data.error || '').toLowerCase();
          if (errMsg.includes('expired')) {
            setState('expired');
          } else {
            setState('invalid');
          }
        }
      } catch {
        if (isMounted) setState('invalid');
      }
    }

    confirmToken();

    return () => {
      isMounted = false;
    };
  }, [token, directStatus]);

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center space-y-8">
      {state === 'loading' && (
        <div className="bg-surface border border-hairline rounded-md p-10 shadow-sm space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h1 className="text-heading font-bold text-ink">Verifying Your Priority Reservation...</h1>
          <p className="text-caption text-body">Please wait while we confirm your email and secure your early access spot.</p>
        </div>
      )}

      {state === 'success' && (
        <div className="bg-surface border border-hairline rounded-md p-8 sm:p-10 shadow-sm space-y-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
            ✓
          </div>

          <div className="space-y-2">
            <span className="text-micro font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-primary/10 text-primary">
              Reservation Verified
            </span>
            <h1 className="text-display font-bold text-ink tracking-tight">
              You are Officially on the Waitlist!
            </h1>
            {rank && (
              <p className="text-lead text-primary font-bold">
                Your Priority Rank: #{rank}
              </p>
            )}
            <p className="text-caption text-body max-w-md mx-auto leading-relaxed pt-2">
              Thank you for taking a stand to protect your elders from cyber extortion. We are activating accounts in controlled batches to ensure flawless voice detection.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/pricing">
              <Button variant="primary">View Pricing Plans</Button>
            </Link>
            <Link href="/learn/digital-arrest">
              <Button variant="outline-neutral">Read Scam Awareness Guide</Button>
            </Link>
          </div>
        </div>
      )}

      {state === 'already_confirmed' && (
        <div className="bg-surface border border-hairline rounded-md p-8 sm:p-10 shadow-sm space-y-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ℹ️
          </div>

          <div className="space-y-2">
            <span className="text-micro font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-canvas text-body border border-hairline">
              Already Confirmed
            </span>
            <h1 className="text-display font-bold text-ink tracking-tight">
              Your Spot is Already Secured!
            </h1>
            {rank && (
              <p className="text-lead text-primary font-bold">
                Priority Rank: #{rank}
              </p>
            )}
            <p className="text-caption text-body max-w-md mx-auto leading-relaxed pt-2">
              {message || 'Your email address was previously confirmed. No further action is required; your position in line remains locked.'}
            </p>
          </div>

          <div className="pt-4">
            <Link href="/">
              <Button variant="outline-neutral">Return to Home</Button>
            </Link>
          </div>
        </div>
      )}

      {state === 'expired' && (
        <div className="bg-surface border border-hairline rounded-md p-8 sm:p-10 shadow-sm space-y-6">
          <div className="w-16 h-16 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
            ⏳
          </div>

          <div className="space-y-2">
            <span className="text-micro font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-warning/10 text-warning">
              Link Expired
            </span>
            <h1 className="text-display font-bold text-ink tracking-tight">
              Confirmation Link Expired
            </h1>
            <p className="text-caption text-body max-w-md mx-auto leading-relaxed pt-2">
              For security, waitlist confirmation links expire after 48 hours. Please re-enter your email on our pricing page to receive a fresh confirmation link.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/pricing#waitlist">
              <Button variant="primary">Re-register on Waitlist</Button>
            </Link>
          </div>
        </div>
      )}

      {state === 'invalid' && (
        <div className="bg-surface border border-hairline rounded-md p-8 sm:p-10 shadow-sm space-y-6">
          <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
            ✕
          </div>

          <div className="space-y-2">
            <span className="text-micro font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-danger/10 text-danger">
              Invalid Link
            </span>
            <h1 className="text-display font-bold text-ink tracking-tight">
              Invalid Confirmation Token
            </h1>
            <p className="text-caption text-body max-w-md mx-auto leading-relaxed pt-2">
              This confirmation link is invalid or incomplete. Please verify the URL from your confirmation email or submit a new reservation request.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/pricing#waitlist">
              <Button variant="primary">Join the Waitlist</Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default function WaitlistConfirmedPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/waitlist/confirmed" />
      <Suspense fallback={<div className="p-16 text-center text-body">Loading...</div>}>
        <WaitlistConfirmedContent />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
