'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Adds `.admin-approval-route` to the nearest `.admin-scope` ancestor while
 * the user is on `/admin/drivers/pending` or `/admin/drivers/[id]`.
 * This opts those two routes out of the mobile "desktop required" CSS rule
 * in app/globals.css — so they render their own mobile variants.
 */
export function ApprovalRouteMarker() {
  const pathname = usePathname();

  useEffect(() => {
    const scope = document.querySelector('.admin-scope');
    if (!scope) return;
    const isApprovalRoute =
      pathname === '/admin/drivers/pending' ||
      /^\/admin\/drivers\/[^/]+$/.test(pathname);
    if (isApprovalRoute) {
      scope.classList.add('admin-approval-route');
    } else {
      scope.classList.remove('admin-approval-route');
    }
    return () => {
      scope.classList.remove('admin-approval-route');
    };
  }, [pathname]);

  return null;
}
