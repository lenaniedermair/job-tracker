"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ApplicationStatus, ApplicationWithDetails, KanbanColumn as IKanbanColumn } from "@/types";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  column: IKanbanColumn;
  applications: ApplicationWithDetails[];
  onCardClick?: (app: ApplicationWithDetails) => void;
}

export function KanbanColumn({ column, applications, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full w-80 flex-shrink-0 flex-col rounded-2xl border bg-slate-950/60 p-4 backdrop-blur-md transition-colors ${
        isOver ? "border-indigo-500/50 bg-indigo-950/20" : "border-slate-800/80"
      }`}
    >
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
          <h3 className="font-semibold text-slate-200 text-sm tracking-wide">
            {column.title}
          </h3>
        </div>
        <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-mono font-medium text-slate-400 border border-slate-800">
          {applications.length}
        </span>
      </div>

      {/* Cards Scrollable Container */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        <SortableContext
          items={applications.map((app) => app.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <KanbanCard
              key={app.id}
              application={app}
              onClick={() => onCardClick?.(app)}
            />
          ))}
        </SortableContext>
        {applications.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-600">
            Keine Einträge
          </div>
        )}
      </div>
    </div>
  );
}