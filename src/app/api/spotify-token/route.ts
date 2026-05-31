import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  if (session.error === 'RefreshAccessTokenError') {
    return NextResponse.json(
      { error: 'RefreshAccessTokenError' },
      { status: 401 },
    );
  }

  if (!session.accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  return NextResponse.json({ accessToken: session.accessToken });
}
