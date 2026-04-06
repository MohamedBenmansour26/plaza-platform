'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SprintTask, TaskStatus } from '@/lib/notion';

// Known Plaza agents — order matches sprint board conventions.
const AGENTS = ['Dev', 'Dev Agent 2', 'PM', 'QA', 'Designer', 'Analyst'];

const STATUS_BADGE: Record<TaskStatus, string> = {
  'In Progress': 'bg-blue-600 text-white',
  'In Review':   'bg-yellow-500 text-white',
  'Blocked':     'bg-red-600 text-white',
  'Done':        'bg-green-600 text-white',
  'Backlog':     'bg-gray-400 text-white',
};

// Priority order when picking an agent's "current" task to surface.
const STATUS_PRIORITY: TaskStatus[] = [
  'Blocked', 'In Progress', 'In Review', 'Backlog', 'Done',
];

type Props = {
  tasks: SprintTask[];
  fetchedAt: string;
};

function Badge({ status }: { status: TaskStatus | null }) {
  if (!status) return null;
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[status]}`}>
      {status}
    </span>
  );
}

function AgentCard({ agent, tasks }: { agent: string; tasks: SprintTask[] }) {
  const current =
    STATUS_PRIORITY.reduce<SprintTask | null>((best, s) => {
      if (best) return best;
      return tasks.find((t) => t.status === s) ?? null;
    }, null) ?? tasks[0] ?? null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-semibold text-sm">{agent}</span>
        <Badge status={current?.status ?? null} />
      </div>
      {current ? (
        <p className="text-sm text-muted-foreground line-clamp-2">{current.name}</p>
      ) : (
        <p className="text-xs text-muted-foreground italic">No tasks assigned</p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
    </div>
  );
}

export function AgentDashboard({ tasks, fetchedAt }: Props) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 60_000);
    return () => clearInterval(id);
  }, [router]);

  const done = tasks.filter((t) => t.status === 'Done').length;
  const blocked = tasks.filter((t) => t.status === 'Blocked');
  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Agent Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Plaza Sprint Board · refreshes every 60s · last fetched {fetchedAt}
          </p>
        </div>

        {/* Sprint progress */}
        <section className="space-y-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Sprint progress
            </h2>
            <span className="text-sm font-medium text-foreground">
              {done} / {tasks.length} done ({progress}%)
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        {/* Agent cards */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Agents
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map((agent) => (
              <AgentCard
                key={agent}
                agent={agent}
                tasks={tasks.filter(
                  (t) => t.agent === agent || (agent === 'Dev' && t.agent === 'Mehdi'),
                )}
              />
            ))}
          </div>
        </section>

        {/* Waiting on founder */}
        {blocked.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-red-600">
              Waiting on founder ({blocked.length})
            </h2>
            <ul className="space-y-2">
              {blocked.map((t) => (
                <li key={t.id} className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <Badge status="Blocked" />
                  <span className="text-sm text-foreground">{t.name}</span>
                  {t.agent && (
                    <span className="ms-auto shrink-0 text-xs text-muted-foreground">
                      {t.agent}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {tasks.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-16">
            No tasks found — check NOTION_API_TOKEN in .env.local
          </p>
        )}
      </div>
    </main>
  );
}
