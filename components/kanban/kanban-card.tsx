"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ApplicationWithDetails } from "@/types";
import { CompanyBadge } from "./company-badge";

interface KanbanCardProps {
  application: ApplicationWithDetails;
  onClick?: () => void;
}

function formatSalary(salary?: string | null) {
  if (!salary) return null;
  const trimmed = salary.trim();
  if (trimmed.includes("€") || trimmed.includes("$") || trimmed.includes("£")) {
    return trimmed;
  }
  return `${trimmed} €`;
}

export function KanbanCard({ application, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formattedDate = new Date(application.updatedAt).toLocaleDateString("de-DE", {
    month: "short",
    day: "numeric",
  });

  const displaySalary = formatSalary(application.salary);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group kanban-card-base ${
        isDragging ? "z-50 opacity-40 scale-105 shadow-2xl border-kanban-accent" : ""
      }`}
    >
      {/* Position / Jobtitel */}
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <h3 className="font-sans text-base font-semibold leading-snug text-kanban-text group-hover:text-white truncate">
          {application.position}
        </h3>
      </div>

      {/* Firma & Ort */}
      <div className="mb-3 flex items-center gap-2 text-xs text-kanban-text-muted">
        <CompanyBadge company={application.company} />
        <span className="font-medium text-kanban-text truncate">
          {application.company}
        </span>
        {application.location && (
          <>
            <span className="text-kanban-text-dim">•</span>
            <span className="truncate text-kanban-text-muted">
              {application.location}
            </span>
          </>
        )}
      </div>

      {/* Notiz / Tag Badge */}
      {application.notes && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="rounded-lg bg-kanban-accent/20 border border-kanban-accent/30 px-2 py-1 text-xs font-medium text-kanban-accent-light truncate max-w-[220px]">
            {application.notes}
          </span>
        </div>
      )}

      {/* Footer: Datum & Gehalt */}
      <div className="flex items-center justify-between border-t border-white/[0.04] pt-2.5 mt-1">
        <span className="text-xs font-medium text-kanban-text-dim">{formattedDate}</span>
        {displaySalary && (
          <span className="text-xs font-semibold text-kanban-accent-light">
            {displaySalary}
          </span>
        )}
      </div>
    </div>
  );
}