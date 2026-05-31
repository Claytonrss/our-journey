import { auth, signOut } from '@/auth';
import { LockScreen } from '@/components/features/auth/LockScreen';

export default async function Home() {
  const session = await auth();

  if (session?.error === 'RefreshAccessTokenError') {
    await signOut({ redirectTo: '/' });
    return null;
  }

  return <LockScreen hasSession={!!session} />;
}
