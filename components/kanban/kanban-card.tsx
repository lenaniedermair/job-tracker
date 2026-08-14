"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ApplicationWithDetails } from "@/types";
import { Building2, MapPin, Calendar, ExternalLink, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface KanbanCardProps {
  application: ApplicationWithDetails;
  onClick?: () => void;
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
    opacity: isDragging ? 0.4 : 1,
  };

  const daysAgo = formatDistanceToNow(new Date(application.appliedDate), {
    addSuffix: true,
    locale: de,
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group relative cursor-grab active:cursor-grabbing rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700 hover:shadow-indigo-500/10 hover:shadow-2xl"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
          {application.position}
        </h4>
        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
        <Building2 className="h-3.5 w-3.5 text-indigo-400" />
        <span className="font-medium text-slate-300">{application.company}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        {application.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{application.location}</span>
          </div>
        )}
        {application.salary && (
          <div className="flex items-center gap-1 text-emerald-400 font-mono">
            <DollarSign className="h-3 w-3" />
            <span>{application.salary}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{daysAgo}</span>
        </div>
        {application.documents && application.documents.length > 0 && (
          <span className="rounded-full bg-indigo-950/80 px-2 py-0.5 text-indigo-300 border border-indigo-800/50">
            {application.documents.length} Dok.
          </span>
        )}
      </div>
    </div>
  );
}