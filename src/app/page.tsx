import { auth } from '@/auth';
import { LockScreen } from '@/components/LockScreen';

export default async function Home() {
  const session = await auth();

  return <LockScreen hasSession={!!session} />;
}
