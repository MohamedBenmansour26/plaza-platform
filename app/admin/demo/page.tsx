import { notFound } from 'next/navigation';
import { DemoClient } from '../_components/demo/DemoClient';

export const dynamic = 'force-dynamic';

/**
 * Dev-only demo page for every P0 admin component. Reachable at
 * /admin/demo when NODE_ENV !== 'production'; 404 in production.
 *
 * NOTE: the brief asked for `app/admin/_components/demo/page.tsx`, but
 * Next.js treats underscore-prefixed folders as private (non-routed).
 * The DemoClient source lives at `_components/demo/DemoClient.tsx` per the
 * brief; this file is the routed entry. Flag for PM if a different path
 * is preferred.
 */
export default function DemoPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  return <DemoClient />;
}
