import { getApplications } from "@/actions/applications";
import { KanbanHeader } from "@/components/kanban/kanban-header";
import { KanbanBoard } from "@/components/kanban/kanban-board";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const result = await getApplications();
  const applications = result.success && result.data ? result.data : [];

  return (
    <main className="min-h-screen w-full bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <KanbanHeader />
        <KanbanBoard initialApplications={applications} />
      </div>
    </main>
  );
}