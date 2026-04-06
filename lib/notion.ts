/**
 * Notion API utility — server-side only.
 * Reads the Plaza Sprint Board database to power the agent activity dashboard.
 */

const NOTION_VERSION = '2022-06-28';
const SPRINT_BOARD_DB_ID = '339a9773-b9dc-81de-bf57-c8436f26f7c2';

export type TaskStatus =
  | 'In Progress'
  | 'In Review'
  | 'Blocked'
  | 'Done'
  | 'Backlog';

export type SprintTask = {
  id: string;
  name: string;
  status: TaskStatus | null;
  agent: string | null;
};

type NotionPage = {
  id: string;
  properties: {
    Name?: { title?: { plain_text: string }[] };
    Status?: { select?: { name: string } | null };
    Agent?: { select?: { name: string } | null };
    [key: string]: unknown;
  };
};

function toStatus(raw: string | undefined | null): TaskStatus | null {
  const valid: TaskStatus[] = [
    'In Progress',
    'In Review',
    'Blocked',
    'Done',
    'Backlog',
  ];
  return valid.includes(raw as TaskStatus) ? (raw as TaskStatus) : null;
}

function pageToTask(page: NotionPage): SprintTask {
  const name =
    page.properties.Name?.title?.[0]?.plain_text ?? '(untitled)';
  const status = toStatus(page.properties.Status?.select?.name);
  const agent = page.properties.Agent?.select?.name ?? null;
  return { id: page.id, name, status, agent };
}

export async function getSprintTasks(): Promise<SprintTask[]> {
  const token = process.env.NOTION_API_TOKEN;
  if (!token) {
    console.warn('[notion] NOTION_API_TOKEN not set');
    return [];
  }

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${SPRINT_BOARD_DB_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 100 }),
        cache: 'no-store',
      },
    );

    if (!res.ok) {
      console.error('[notion] query failed:', res.status, await res.text());
      return [];
    }

    const data = (await res.json()) as { results: NotionPage[] };
    return data.results.map(pageToTask);
  } catch (err) {
    console.error('[notion] fetch error:', err);
    return [];
  }
}
