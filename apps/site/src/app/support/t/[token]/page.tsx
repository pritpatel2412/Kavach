'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@kavach/ui';
import { SiteHeader } from '../../../../components/SiteHeader';
import { SiteFooter } from '../../../../components/SiteFooter';

interface Message {
  id: string;
  sender_type: 'customer' | 'agent';
  sender_name: string;
  body: string;
  created_at: string;
}

interface TicketData {
  ticket_number: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  created_at: string;
  updated_at: string;
  csat_rating: number | null;
  messages: Message[];
}

export default function CustomerPortalPage() {
  const params = useParams();
  const token = typeof params?.token === 'string' ? params.token : Array.isArray(params?.token) ? params.token[0] : '';

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // CSAT state
  const [csatRating, setCsatRating] = useState<number>(5);
  const [csatFeedback, setCsatFeedback] = useState('');
  const [csatSubmitted, setCsatSubmitted] = useState(false);
  const [sendingCsat, setSendingCsat] = useState(false);

  const fetchTicket = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/support/t/${token}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail?.message || data.error || 'Support link is invalid or expired.');
      }
      setTicket(data);
      if (data.csat_rating) {
        setCsatSubmitted(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [token]);

  const handleSendReply = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || replyText;
    if (!textToSend.trim()) return;

    setSendingReply(true);
    setReplyError(null);

    try {
      const res = await fetch(`/api/support/t/${token}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail?.message || data.error || 'Failed to send reply.');
      }

      setReplyText('');
      await fetchTicket();
    } catch (err: unknown) {
      setReplyError(err instanceof Error ? err.message : 'Error sending reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleCsatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingCsat(true);
    try {
      const res = await fetch(`/api/support/t/${token}/csat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: csatRating, feedback: csatFeedback.trim() || undefined }),
      });
      if (!res.ok) {
        throw new Error('Failed to record rating.');
      }
      setCsatSubmitted(true);
      await fetchTicket();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit rating.');
    } finally {
      setSendingCsat(false);
    }
  };

  const statusColors: Record<string, string> = {
    open: 'bg-primary/10 text-primary border-primary/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    on_hold: 'bg-muted/10 text-body border-hairline',
    solved: 'bg-success/10 text-success border-success/20',
    closed: 'bg-muted/20 text-muted border-hairline',
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/support" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-caption text-body">
          <Link href="/support" className="hover:text-ink hover:underline">
            Support Desk
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-ink">{ticket?.ticket_number || 'Ticket Portal'}</span>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-surface border border-hairline rounded-md p-8 shadow-sm space-y-6 animate-pulse">
            <div className="h-8 bg-hairline rounded w-1/3"></div>
            <div className="h-4 bg-hairline rounded w-2/3"></div>
            <div className="space-y-3 pt-4">
              <div className="h-16 bg-hairline rounded"></div>
              <div className="h-16 bg-hairline rounded"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-surface border border-hairline rounded-md p-8 shadow-sm text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-heading font-bold text-ink">Ticket Access Error</h2>
            <p className="text-caption text-body">{error}</p>
            <div className="pt-2">
              <Link href="/support">
                <Button variant="outline-neutral">Submit a New Support Request</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Loaded Ticket Portal */}
        {!loading && ticket && (
          <div className="space-y-6">
            {/* Header Lockup */}
            <div className="bg-surface border border-hairline rounded-md p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-heading font-bold text-ink">
                    {ticket.ticket_number}
                  </span>
                  <span
                    className={`text-micro uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                      statusColors[ticket.status] || 'bg-canvas text-ink border-hairline'
                    }`}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-micro font-medium px-2 py-0.5 rounded-full bg-canvas text-body border border-hairline">
                    Priority: {ticket.priority}
                  </span>
                </div>

                <div className="text-caption text-muted font-mono">
                  Created {new Date(ticket.created_at).toLocaleDateString()}
                </div>
              </div>

              <div>
                <h1 className="text-display font-bold text-ink">{ticket.subject}</h1>
                <div className="text-caption text-body mt-1">
                  Category: <span className="font-semibold text-ink">{ticket.category.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-4">
              <h2 className="text-lead font-bold text-ink">Conversation History</h2>

              <div className="space-y-3">
                {ticket.messages.map((m) => {
                  const isAgent = m.sender_type === 'agent';
                  return (
                    <div
                      key={m.id}
                      className={`p-5 rounded-md border ${
                        isAgent
                          ? 'bg-primary/5 border-primary/20 mr-4 sm:mr-12'
                          : 'bg-surface border-hairline ml-4 sm:ml-12'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-hairline/60">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-micro font-bold ${
                              isAgent ? 'bg-primary text-white' : 'bg-canvas text-ink border border-hairline'
                            }`}
                          >
                            {isAgent ? 'S' : 'U'}
                          </span>
                          <span className="text-caption font-bold text-ink">
                            {m.sender_name}
                          </span>
                          {isAgent && (
                            <span className="text-micro bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                              Kavach Support Team
                            </span>
                          )}
                        </div>

                        <span className="text-caption text-muted font-mono text-micro">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(m.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-caption text-body whitespace-pre-wrap leading-relaxed font-sans">
                        {m.body}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reopen notice if closed/solved */}
            {(ticket.status === 'solved' || ticket.status === 'closed') && (
              <div className="p-4 rounded-md bg-canvas border border-hairline flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-caption font-bold text-ink">This ticket is marked as {ticket.status}.</div>
                  <div className="text-caption text-body">
                    Need further assistance? Sending a new reply will automatically reopen this ticket.
                  </div>
                </div>
                <Button
                  variant="outline-neutral"
                  size="sm"
                  onClick={() => handleSendReply(undefined, 'I would like to reopen this ticket for further follow-up.')}
                  disabled={sendingReply}
                >
                  {sendingReply ? 'Reopening...' : 'Reopen Ticket'}
                </Button>
              </div>
            )}

            {/* Customer Reply Box */}
            <div className="bg-surface border border-hairline rounded-md p-6 shadow-sm space-y-4">
              <h3 className="text-heading font-bold text-ink">Post a Reply</h3>

              {replyError && (
                <div className="p-3 rounded-md bg-danger/10 text-danger text-caption font-medium">
                  {replyError}
                </div>
              )}

              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  rows={4}
                  className="w-full rounded-md border border-hairline bg-surface p-3 text-caption text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Type your reply or additional details here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={sendingReply}
                  required
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={sendingReply || !replyText.trim()}
                  >
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </form>
            </div>

            {/* CSAT Rating Widget */}
            {(ticket.status === 'solved' || ticket.status === 'closed' || ticket.csat_rating) && (
              <div className="bg-surface border border-hairline rounded-md p-6 shadow-sm space-y-4">
                <h3 className="text-heading font-bold text-ink">Customer Satisfaction Survey</h3>

                {csatSubmitted || ticket.csat_rating ? (
                  <div className="p-4 bg-primary/10 rounded-md text-center space-y-2">
                    <div className="text-xl">⭐️⭐️⭐️⭐️⭐️</div>
                    <div className="text-caption font-bold text-primary">
                      Thank you for rating our support service!
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCsatSubmit} className="space-y-4">
                    <p className="text-caption text-body">
                      How satisfied are you with the resolution of your support request?
                    </p>

                    <div className="flex items-center gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCsatRating(star)}
                          className={`text-2xl transition-transform hover:scale-110 ${
                            star <= csatRating ? 'text-amber-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-caption font-bold text-ink ml-2">
                        {csatRating === 5
                          ? 'Excellent (5/5)'
                          : csatRating === 4
                          ? 'Good (4/5)'
                          : csatRating === 3
                          ? 'Average (3/5)'
                          : csatRating === 2
                          ? 'Poor (2/5)'
                          : 'Very Poor (1/5)'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="csatFeedbackInput" className="block text-caption text-body">Optional Feedback</label>
                      <input
                        id="csatFeedbackInput"
                        aria-label="Optional Feedback"
                        type="text"
                        className="w-full rounded-md border border-hairline bg-surface p-2.5 text-caption text-ink focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Tell us what went well or what we can improve..."
                        value={csatFeedback}
                        onChange={(e) => setCsatFeedback(e.target.value)}
                      />
                    </div>

                    <Button type="submit" variant="primary" size="sm" disabled={sendingCsat}>
                      {sendingCsat ? 'Submitting...' : 'Submit Satisfaction Rating'}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
