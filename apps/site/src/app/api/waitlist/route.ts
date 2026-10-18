import { NextResponse } from 'next/server';
import { mockApi, WaitlistSubmissionSchema } from '@kavach/api-contract';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await mockApi.submitWaitlist(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      // @ts-expect-error zod error format
      return NextResponse.json({ error: err.errors[0]?.message || 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process waitlist submission' }, { status: 500 });
  }
}
