'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Missing unsubscribe token. Please use the link in your email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/waitlist/unsubscribe?token=${encodeURIComponent(token)}`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setSuccess(true);
      } else {
        setError(data.detail?.message || data.error || 'Invalid or expired unsubscribe link.');
      }
    } catch {
      setError('Network error occurred. Please try again or contact support@kavach.ai.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
      {!success ? (
        <div className="bg-surface border border-hairline rounded-md p-8 sm:p-10 shadow-sm space-y-6">
          <div className="w-16 h-16 bg-muted/10 text-muted rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✉️
          </div>

          <div className="space-y-2">
            <h1 className="text-display font-bold text-ink tracking-tight">
              Unsubscribe from Updates
            </h1>
            <p className="text-caption text-body max-w-sm mx-auto leading-relaxed">
              We respect your inbox. Confirm below to stop receiving all marketing, announcement, and educational emails from Kavach.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-danger/10 border border-danger/20 text-danger text-caption font-medium">
              {error}
            </div>
          )}

          {!token && (
            <div className="p-4 rounded-md bg-warning/10 border border-warning/20 text-ink text-caption">
              No unsubscribe token was provided in the URL. Please ensure you clicked the complete link from your email footer.
            </div>
          )}

          {token && (
            <form onSubmit={handleUnsubscribe} className="pt-2">
              <Button
                type="submit"
                variant="danger"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Unsubscribing...' : 'Confirm Unsubscribe'}
              </Button>
            </form>
          )}

          <div className="pt-2">
            <Link href="/" className="text-caption text-muted hover:text-ink hover:underline">
              Cancel and Return Home
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-hairline rounded-md p-8 sm:p-10 shadow-sm space-y-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
            ✓
          </div>

          <div className="space-y-2">
            <h1 className="text-display font-bold text-ink tracking-tight">
              You Have Been Unsubscribed
            </h1>
            <p className="text-caption text-body max-w-md mx-auto leading-relaxed pt-2">
              Your email has been added to our suppression list. You will no longer receive promotional or broadcast emails from us.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/">
              <Button variant="outline-neutral">Return to Homepage</Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/unsubscribe" />
      <Suspense fallback={<div className="p-16 text-center text-body">Loading...</div>}>
        <UnsubscribeContent />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
