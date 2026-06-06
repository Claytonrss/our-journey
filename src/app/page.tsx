import { auth } from '@/auth';
import { LockScreen } from '@/components/features/auth/LockScreen';

export default async function Home() {
  const session = await auth();

  if (session?.error === 'RefreshAccessTokenError') {
    return <LockScreen hasSession={false} />;
  }

  return <LockScreen hasSession={!!session} />;
}
