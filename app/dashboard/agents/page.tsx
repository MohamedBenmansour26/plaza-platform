import { getSprintTasks } from '@/lib/notion';
import { AgentDashboard } from './AgentDashboard';

export const dynamic = 'force-dynamic';

export default async function AgentDashboardPage() {
  const tasks = await getSprintTasks();

  const fetchedAt = new Date().toLocaleTimeString('fr-MA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return <AgentDashboard tasks={tasks} fetchedAt={fetchedAt} />;
}
