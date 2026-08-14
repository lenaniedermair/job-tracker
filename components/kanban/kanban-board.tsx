"use client";

import { useEffect, useOptimistic, useState } from "react";
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
import { ApplicationDetailDrawer } from "./application-detail-drawer";

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
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Verhindert Hydration-Mismatch bei Dnd-Context & Date-Formatting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Optimistic UI updates
  const [optimisticApps, setOptimisticApps] = useOptimistic(
    initialApplications,
    (state, { id, newStatus }: { id: string; newStatus: ApplicationStatus }) =>
      state.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
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

    const currentApp = optimisticApps.find((a) => a.id === appId);
    if (!currentApp || currentApp.status === newStatus) return;

    setOptimisticApps({ id: appId, newStatus });
    await updateApplicationStatus(appId, newStatus);
  };

  // Render-Fallback während der SSR-Hydrierung
  if (!isMounted) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full gap-6 overflow-x-auto pb-4 pt-2">
        {COLUMNS.map((col) => {
          const colApps = initialApplications.filter((app) => app.status === col.id);
          return (
            <KanbanColumn
              key={col.id}
              column={col}
              applications={colApps}
            />
          );
        })}
      </div>
    );
  }

  return (
    <>
      <DndContext
        id="kanban-board-dnd"
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
                onCardClick={(app) => setSelectedApp(app)}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeApp ? <KanbanCard application={activeApp} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Slide-Over Detail Panel */}
      <ApplicationDetailDrawer
        application={selectedApp}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
      />
    </>
  );
}