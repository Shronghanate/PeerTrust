import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2" aria-label="PeerTrust Home">
      <ShieldCheck className="h-7 w-7 text-primary" />
      <h1 className="text-xl font-bold tracking-tight">PeerTrust</h1>
    </Link>
  );
}
