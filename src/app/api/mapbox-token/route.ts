import { NextResponse } from 'next/server';
import { getMapboxEnv } from '@/lib/env';

export async function GET() {
  const { MAPBOX_TOKEN } = getMapboxEnv();

  return NextResponse.json({ token: MAPBOX_TOKEN });
}
