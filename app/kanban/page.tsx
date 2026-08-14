import { getApplications } from "@/actions/applications";
import { KanbanBoard } from "@/components/kanban/kanban-board";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const result = await getApplications();
  const applications = result.success && result.data ? (result.data as any) : [];

  return (
    <main className="min-h-screen w-full bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Bewerbungs-Tracker
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Verwalte deine Bewerbungen per Drag-and-Drop in Echtzeit.
            </p>
          </div>
        </div>

        {/* Kanban Board Komponente */}
        <KanbanBoard initialApplications={applications} />
      </div>
    </main>
  );
}