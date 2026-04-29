'use client';

import { usePathname } from 'next/navigation';

import { StoreFooter } from './StoreFooter';

const LINEAR_FLOW_SEGMENTS = new Set(['commande', 'verification', 'confirmation']);

export function ConditionalStoreFooter() {
  const pathname = usePathname();
  const lastSegment = pathname.split('/').filter(Boolean).pop();

  if (lastSegment && LINEAR_FLOW_SEGMENTS.has(lastSegment)) {
    return null;
  }

  return <StoreFooter />;
}
