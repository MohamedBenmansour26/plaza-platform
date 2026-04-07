import type { SprintTask } from '@/lib/notion';
import { AgentDashboard } from './AgentDashboard';

export const dynamic = 'force-dynamic';

export default async function AgentDashboardPage() {
  let tasks: SprintTask[] = [];
  const fetchedAt = new Date().toLocaleTimeString('fr-MA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  try {
    const { getSprintTasks } = await import('@/lib/notion');
    tasks = await getSprintTasks();
  } catch {
    // Notion may be unavailable — render with empty tasks
  }

  return <AgentDashboard tasks={tasks} fetchedAt={fetchedAt} />;
}
