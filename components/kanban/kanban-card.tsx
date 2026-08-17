"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ApplicationWithDetails } from "@/types";
import { CompanyBadge } from "./company-badge";

interface KanbanCardProps {
  application: ApplicationWithDetails;
  onClick?: () => void;
}

// Hilfsfunktion: Hängt € an, falls noch keine Währung angegeben ist
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
      className={`group relative mb-2.5 cursor-grab rounded-[18px] border border-white/[0.04] bg-[#1d1c1d] p-3.5 select-none transition-colors hover:bg-[#262525] active:cursor-grabbing ${
        isDragging ? "z-50 opacity-40 scale-105 shadow-2xl" : ""
      }`}
    >
      {/* Header Row: Position */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="font-sans text-[13.5px] font-semibold leading-tight text-[#fbfdf6] truncate">
          {application.position}
        </p>
      </div>

      {/* Company + Location */}
      <div className="mb-2.5 flex items-center gap-1.5">
        <CompanyBadge company={application.company} />
        <span className="text-[11px] font-medium text-[#7f807f] truncate">
          {application.company}
        </span>
        {application.location && (
          <>
            <span className="text-[#3a3a3a]">·</span>
            <span className="text-[11px] text-[#5a5a5a] truncate">
              {application.location}
            </span>
          </>
        )}
      </div>

      {/* Notes / Tag Badge */}
      {application.notes && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          <span className="rounded-md bg-[#6642c7]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#a78bfa] truncate max-w-[180px]">
            {application.notes}
          </span>
        </div>
      )}

      {/* Footer: Date & Formatted Salary */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-[#5a5a5a]">{formattedDate}</span>
        {displaySalary && (
          <span className="text-[10px] font-medium text-[#6642c7]">
            {displaySalary}
          </span>
        )}
      </div>
    </div>
  );
}