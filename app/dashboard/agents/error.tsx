'use client';

import { Button } from '@/components/ui/button';

type Props = { error: Error; reset: () => void };

export default function AgentDashboardError({ reset }: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <p className="text-sm text-destructive">
        Failed to load sprint board. Check NOTION_API_TOKEN.
      </p>
      <Button variant="outline" onClick={reset}>
        Retry
      </Button>
    </main>
  );
}
