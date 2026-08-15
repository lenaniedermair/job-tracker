"use client";

import { useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";

interface TrashDropZoneProps {
  isDragging: boolean;
}

export function TrashDropZone({ isDragging }: TrashDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "TRASH_DROP_ZONE",
  });

  if (!isDragging) return null;

  return (
    <div
      ref={setNodeRef}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border-2 px-6 py-3.5 shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 ${
        isOver
          ? "border-rose-500 bg-rose-950/90 text-rose-200 scale-110 shadow-rose-900/50"
          : "border-rose-500/40 bg-slate-900/90 text-rose-400 hover:border-rose-500"
      }`}
    >
      <Trash2 className={`h-5 w-5 ${isOver ? "animate-bounce text-rose-300" : ""}`} />
      <span className="text-sm font-semibold">
        {isOver ? "Jetzt loslassen zum Löschen!" : "Hierhin ziehen zum Löschen"}
      </span>
    </div>
  );
}