"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ApplicationWithDetails, KanbanColumn as IKanbanColumn } from "@/types";
import { KanbanCard } from "./kanban-card";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  column: IKanbanColumn;
  applications: ApplicationWithDetails[];
  onCardClick?: (app: ApplicationWithDetails) => void;
  onAddClick?: () => void;
}

const STATUS_DOTS: Record<string, string> = {
  WISHLIST: "#d9d9d9",
  APPLIED: "#6642c7",
  INTERVIEW: "#3b82f6",
  OFFER: "#22c55e",
  REJECTED: "#ef4444",
};

export function KanbanColumn({
  column,
  applications,
  onCardClick,
  onAddClick,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const dotColor = STATUS_DOTS[column.id] || "#7f807f";

  return (
    <div
      ref={setNodeRef}
      className="flex h-full w-[300px] flex-none flex-col rounded-[24px] bg-[#222122] border border-white/[0.03]"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: dotColor }}
          />
          <span className="text-base font-bold text-[#fbfdf6]">
            {column.title}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-[#a0a0a0]">
            {applications.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#707070] transition-colors hover:bg-white/10 hover:text-white"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Karten-Liste */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <SortableContext
          items={applications.map((a) => a.id)}
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
          <button
            onClick={onAddClick}
            className="flex w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/10 py-10 transition-colors hover:border-white/20 hover:bg-white/[0.02]"
          >
            <span className="text-xs font-medium text-[#606060] hover:text-[#909090]">
              + Bewerbung hinzufügen
            </span>
          </button>
        )}
      </div>
    </div>
  );
}