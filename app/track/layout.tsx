import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

/**
 * /track wrapper — applies `.storefront-scope` so token isolations
 * (radius, orange accent, storefront-input focus utility) defined in
 * app/globals.css match the merchant storefront. The track entry
 * surface shares the storefront look but is tenant-agnostic; no
 * per-merchant primary is injected here.
 */
export default function TrackLayout({ children }: Props) {
  return <div className="storefront-scope">{children}</div>;
}
