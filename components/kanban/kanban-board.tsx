"use client";

import { useOptimistic, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ApplicationStatus, ApplicationWithDetails, KanbanColumn as IKanbanColumn } from "@/types";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { updateApplicationStatus } from "@/actions/applications";

const COLUMNS: IKanbanColumn[] = [
  { id: ApplicationStatus.WISHLIST, title: "Wunschliste", color: "bg-slate-400" },
  { id: ApplicationStatus.APPLIED, title: "Beworben", color: "bg-blue-400" },
  { id: ApplicationStatus.INTERVIEW, title: "Interview", color: "bg-amber-400" },
  { id: ApplicationStatus.OFFER, title: "Angebot", color: "bg-emerald-400" },
  { id: ApplicationStatus.REJECTED, title: "Absage", color: "bg-rose-400" },
];

interface KanbanBoardProps {
  initialApplications: ApplicationWithDetails[];
}

export function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const [activeApp, setActiveApp] = useState<ApplicationWithDetails | null>(null);

  // Optimistic UI updates
  const [optimisticApps, setOptimisticApps] = useOptimistic(
    initialApplications,
    (state, { id, newStatus }: { id: string; newStatus: ApplicationStatus }) =>
      state.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Verhindert ungewolltes Dragging bei Klicks
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const app = optimisticApps.find((a) => a.id === event.active.id);
    if (app) setActiveApp(app);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApp(null);

    if (!over) return;

    const appId = active.id as string;
    const newStatus = over.id as ApplicationStatus;

    // Nur aktualisieren, wenn sich die Spalte geändert hat
    const currentApp = optimisticApps.find((a) => a.id === appId);
    if (!currentApp || currentApp.status === newStatus) return;

    // 1. UI sofort optimistisch updaten
    setOptimisticApps({ id: appId, newStatus });

    // 2. Im Hintergrund DB anpassen
    await updateApplicationStatus(appId, newStatus);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-10rem)] w-full gap-6 overflow-x-auto pb-4 pt-2">
        {COLUMNS.map((col) => {
          const colApps = optimisticApps.filter((app) => app.status === col.id);
          return (
            <KanbanColumn
              key={col.id}
              column={col}
              applications={colApps}
            />
          );
        })}
      </div>

      {/* Drag Overlay für sanftes Ziehen */}
      <DragOverlay>
        {activeApp ? <KanbanCard application={activeApp} /> : null}
      </DragOverlay>
    </DndContext>
  );
}