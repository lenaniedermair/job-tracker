import { getApplications } from "@/actions/applications";
import { KanbanBoard } from "@/components/kanban/kanban-board";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const result = await getApplications();
  const applications = result.success && result.data ? result.data : [];

  return (
    <main className="min-h-screen w-full bg-[#111010]">
      <KanbanBoard initialApplications={applications} />
    </main>
  );
}