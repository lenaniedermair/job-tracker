"use client";

import { useEffect, useOptimistic, useState, startTransition} from "react";
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
import { updateApplicationStatus, deleteApplication } from "@/actions/applications";
import { ApplicationDetailDrawer } from "./application-detail-drawer";
import { TrashDropZone } from "./trash-drop-zone";
import { toast } from "sonner";
import { Search, X } from "lucide-react";

const COLUMNS: IKanbanColumn[] = [
  { id: ApplicationStatus.WISHLIST, title: "Wunschliste", color: "bg-slate-400" },
  { id: ApplicationStatus.APPLIED, title: "Beworben", color: "bg-blue-400" },
  { id: ApplicationStatus.INTERVIEW, title: "Interview", color: "bg-amber-400" },
  { id: ApplicationStatus.OFFER, title: "Angebot", color: "bg-emerald-400" },
  { id: ApplicationStatus.REJECTED, title: "Absage", color: "bg-rose-400" },
];

type OptimisticAction =
  | { type: "MOVE"; id: string; newStatus: ApplicationStatus }
  | { type: "DELETE"; id: string };

interface KanbanBoardProps {
  initialApplications: ApplicationWithDetails[];
}

export function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const [activeApp, setActiveApp] = useState<ApplicationWithDetails | null>(null);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Optimistische State-Verwaltung für Verschieben & Löschen
  const [optimisticApps, setOptimisticApps] = useOptimistic(
    initialApplications,
    (state, action: OptimisticAction) => {
      if (action.type === "DELETE") {
        return state.filter((app) => app.id !== action.id);
      }
      return state.map((app) =>
        app.id === action.id ? { ...app, status: action.newStatus } : app
      );
    }
  );

  // Echtzeit-Filterung nach Firma, Position & Standort
  const filteredApps = optimisticApps.filter((app) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();

    return (
      app.company.toLowerCase().includes(query) ||
      app.position.toLowerCase().includes(query) ||
      (app.location && app.location.toLowerCase().includes(query))
    );
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const app = optimisticApps.find((a) => a.id === event.active.id);
    if (app) setActiveApp(app);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApp(null);

    if (!over) return;

    const appId = active.id as string;
    const currentApp = optimisticApps.find((a) => a.id === appId);
    if (!currentApp) return;

    // Fall 1: In den Mülleimer gezogen
    if (over.id === "TRASH_DROP_ZONE") {
      startTransition(async () => {
        setOptimisticApps({ type: "DELETE", id: appId });

        const res = await deleteApplication(appId);
        if (res.success) {
          toast.success(`Bewerbung bei "${currentApp.company}" gelöscht.`);
        } else {
          toast.error(res.error || "Löschen fehlgeschlagen.");
        }
      });
      return;
    }

    // Fall 2: In eine andere Spalte gezogen
    const newStatus = over.id as ApplicationStatus;
    if (currentApp.status === newStatus) return;

    startTransition(async () => {
      setOptimisticApps({ type: "MOVE", id: appId, newStatus });
      await updateApplicationStatus(appId, newStatus);
    });
  };

  if (!isMounted) {
    return (
      <div className="flex h-[calc(100vh-12rem)] w-full gap-6 overflow-x-auto pb-4 pt-2">
        {COLUMNS.map((col) => {
          const colApps = initialApplications.filter((app) => app.status === col.id);
          return <KanbanColumn key={col.id} column={col} applications={colApps} />;
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Firma, Stelle oder Ort suchen..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-9 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {searchQuery && (
          <div className="text-xs text-slate-400 font-medium px-2">
            {filteredApps.length} von {optimisticApps.length} Bewerbung(en) gefunden
          </div>
        )}
      </div>

      {/* Drag and Drop Board */}
      <DndContext
        id="kanban-board-dnd"
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-[calc(100vh-14rem)] w-full gap-6 overflow-x-auto pb-4 pt-2">
          {COLUMNS.map((col) => {
            const colApps = filteredApps.filter((app) => app.status === col.id);
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

        {/* Drag Overlay */}
        <DragOverlay>
          {activeApp ? <KanbanCard application={activeApp} /> : null}
        </DragOverlay>

        {/* Floating Trash Zone */}
        <TrashDropZone isDragging={!!activeApp} />
      </DndContext>

      {/* Slide-Over Drawer */}
      <ApplicationDetailDrawer
        application={selectedApp}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
      />
    </div>
  );
}