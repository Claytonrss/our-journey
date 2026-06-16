import { NextResponse } from 'next/server';
import { resetRateLimitStore } from '@/lib/rateLimitStore';

export async function POST() {
  if (process.env.E2E_RESET_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  resetRateLimitStore();
  return NextResponse.json({ ok: true });
}
