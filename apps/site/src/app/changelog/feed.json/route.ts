import { NextResponse } from 'next/server';

export async function GET() {
  const jsonFeed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Kavach Changelog',
    home_page_url: 'https://kavach.ai/changelog',
    feed_url: 'https://kavach.ai/changelog/feed.json',
    description: 'Product updates, architectural milestones, and security releases for Kavach.',
    items: [
      {
        id: 'v0.4.0',
        title: 'v0.4.0 - SaaS Frontend Architecture and CoinCompass Design System',
        content_text: 'Introduced CoinCompass design system in packages/ui with WebGL Aurora canvas and hatch overlay, trilingual elder consent, and RFC 9116 security.txt.',
        url: 'https://kavach.ai/changelog#v0.4.0',
        date_published: '2026-10-18T00:00:00Z',
      },
      {
        id: 'v0.3.0',
        title: 'v0.3.0 - Sprint 3: Speakerphone Resilience and Daily Credit Guards',
        content_text: 'Implemented client-side energy VAD gating in AudioWorklet, 30-min daily STT caps, and offline 8 kHz synthetic replay.',
        url: 'https://kavach.ai/changelog#v0.3.0',
        date_published: '2026-10-17T00:00:00Z',
      },
      {
        id: 'v0.2.0',
        title: 'v0.2.0 - Sprint 2: Multi-Tenant Guardian Auth and Emergency Intercom',
        content_text: 'Secured endpoints with random bearer tokens, implemented Push-to-Talk intercom, and 7-day transcript auto-purge.',
        url: 'https://kavach.ai/changelog#v0.2.0',
        date_published: '2026-10-16T00:00:00Z',
      },
      {
        id: 'v0.1.0',
        title: 'v0.1.0 - Sprint 1: Deterministic 5-Stage Detector and Contest Architecture',
        content_text: 'Created 5-stage extortion state machine, Gnani Prisma STT integration, and offline testbed.',
        url: 'https://kavach.ai/changelog#v0.1.0',
        date_published: '2026-10-15T00:00:00Z',
      },
    ],
  };

  return NextResponse.json(jsonFeed, {
    status: 200,
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
