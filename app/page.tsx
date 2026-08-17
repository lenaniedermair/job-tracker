import { getApplications } from "@/actions/applications";
import { KanbanBoard } from "@/components/kanban/kanban-board";

export const dynamic = "force-dynamic";

export default async function Home() {
  const response = await getApplications();
  const initialApplications = response.success && response.data ? response.data : [];

  return (
    <main className="min-h-screen bg-[#111010]">
      <KanbanBoard initialApplications={initialApplications} />
    </main>
  );
}