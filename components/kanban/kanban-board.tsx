"use client";

import { useEffect, useOptimistic, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
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
import { AddApplicationModal } from "./add-application-modal";
import { TrashDropZone } from "./trash-drop-zone";
import { toast } from "sonner";
import { Search, Plus, SlidersHorizontal, X, RotateCcw, Check } from "lucide-react";

const COLUMNS: IKanbanColumn[] = [
  { id: ApplicationStatus.WISHLIST, title: "Wunschliste", color: "bg-slate-400" },
  { id: ApplicationStatus.APPLIED, title: "Beworben", color: "bg-purple-600" },
  { id: ApplicationStatus.INTERVIEW, title: "Interview", color: "bg-blue-500" },
  { id: ApplicationStatus.OFFER, title: "Angebot", color: "bg-emerald-500" },
  { id: ApplicationStatus.REJECTED, title: "Absage", color: "bg-rose-500" },
];

const STATUS_DOTS: Record<string, string> = {
  WISHLIST: "#d9d9d9",
  APPLIED: "#6642c7",
  INTERVIEW: "#3b82f6",
  OFFER: "#22c55e",
  REJECTED: "#ef4444",
};

type SortOption = "newest" | "oldest" | "company";

type OptimisticAction =
  | { type: "MOVE"; id: string; newStatus: ApplicationStatus }
  | { type: "DELETE"; id: string };

interface KanbanBoardProps {
  initialApplications: ApplicationWithDetails[];
}

export function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const router = useRouter();
  const [activeApp, setActiveApp] = useState<ApplicationWithDetails | null>(null);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Filter-States
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<ApplicationStatus[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [onlyWithNotes, setOnlyWithNotes] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    router.refresh();
  };

  const handleCloseDrawer = () => {
    setSelectedApp(null);
    router.refresh();
  };

  // Status Filter-Pill Umschalter
  const toggleStatusFilter = (status: ApplicationStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Aktive Filter zurücksetzen
  const resetFilters = () => {
    setSelectedStatuses([]);
    setSortBy("newest");
    setOnlyWithNotes(false);
    setSearchQuery("");
  };

  const activeFilterCount =
    (selectedStatuses.length > 0 ? 1 : 0) +
    (onlyWithNotes ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  // Gefilterte & sortierte Liste
  const filteredApps = optimisticApps
    .filter((app) => {
      // 1. Suche nach Begriff
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCompany = app.company.toLowerCase().includes(q);
        const matchPosition = app.position.toLowerCase().includes(q);
        const matchLocation = app.location?.toLowerCase().includes(q) ?? false;
        if (!matchCompany && !matchPosition && !matchLocation) return false;
      }

      // 2. Status-Filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(app.status)) {
        return false;
      }

      // 3. Nur mit Notizen
      if (onlyWithNotes && (!app.notes || !app.notes.trim())) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      if (sortBy === "company") {
        return a.company.localeCompare(b.company);
      }
      return 0;
    });

  const activeCount = optimisticApps.filter(
    (app) => app.status !== ApplicationStatus.REJECTED
  ).length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
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

    const newStatus = over.id as ApplicationStatus;
    if (currentApp.status === newStatus) return;

    startTransition(async () => {
      setOptimisticApps({ type: "MOVE", id: appId, newStatus });
      await updateApplicationStatus(appId, newStatus);
    });
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#111010] text-[#fbfdf6] font-sans">
      <div className="mx-auto max-w-[1800px] px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 py-8 lg:py-10">
        
        {/* Header */}
        <header className="mb-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#fbfdf6]">
                Job Tracker
              </h1>
              <p className="mt-1 text-sm text-[#808080]">
                {activeCount} aktive Bewerbungen
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#6642c7] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#7752db] active:scale-95 shadow-md shadow-[#6642c7]/20"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Bewerbung hinzufügen
            </button>
          </div>

          {/* Suchleiste, Filter-Knopf & Quick Stats */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Suchfeld */}
            <div className="flex h-12 max-w-md flex-1 items-center gap-3 rounded-2xl bg-[#222122] border border-white/[0.05] px-4 shadow-sm focus-within:border-[#6642c7]">
              <Search className="h-4 w-4 text-[#808080]" />
              <input
                type="text"
                placeholder="Firma, Position oder Ort suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[#fbfdf6] placeholder-[#606060] focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-4 w-4 text-[#707070] hover:text-[#fbfdf6]" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`flex h-12 items-center gap-2.5 rounded-2xl border px-5 text-sm font-medium transition-all ${
                showFilterBar || activeFilterCount > 0
                  ? "border-[#6642c7] bg-[#6642c7]/15 text-white"
                  : "border-white/[0.05] bg-[#222122] text-[#a0a0a0] hover:bg-white/5 hover:text-[#fbfdf6]"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6642c7] text-[11px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Status-Pills Übersicht */}
            <div className="ml-auto hidden items-center gap-2.5 xl:flex">
              {COLUMNS.map((col) => {
                const count = optimisticApps.filter((a) => a.status === col.id).length;
                return (
                  <div
                    key={col.id}
                    className="flex items-center gap-2 rounded-xl bg-[#1d1c1d] border border-white/[0.04] px-3.5 py-2 text-xs"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: STATUS_DOTS[col.id] }}
                    />
                    <span className="text-[#909090] font-medium">{col.title}</span>
                    <span className="font-bold text-[#fbfdf6]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ausklappbare Filter-Leiste */}
          {showFilterBar && (
            <div className="mt-4 rounded-2xl border border-white/[0.06] bg-[#1d1c1d] p-5 shadow-xl transition-all">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#808080] uppercase tracking-wider mr-2">
                    Status:
                  </span>
                  {COLUMNS.map((col) => {
                    const isSelected = selectedStatuses.includes(col.id as ApplicationStatus);
                    return (
                      <button
                        key={col.id}
                        onClick={() => toggleStatusFilter(col.id as ApplicationStatus)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-[#6642c7] text-white shadow-sm"
                            : "bg-[#282728] text-[#a0a0a0] hover:bg-[#313031] hover:text-white"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: STATUS_DOTS[col.id] }}
                        />
                        {col.title}
                      </button>
                    );
                  })}
                </div>

                {/* Reset Button */}
                {(activeFilterCount > 0 || searchQuery) && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#808080] transition-colors hover:text-[#ef4444]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Filter zurücksetzen
                  </button>
                )}
              </div>

              {/* Sortierung & Zusatzoptionen */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Sortieren nach */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#808080] uppercase tracking-wider mr-2">
                    Sortieren:
                  </span>
                  {(
                    [
                      { id: "newest", label: "Neueste zuerst" },
                      { id: "oldest", label: "Älteste zuerst" },
                      { id: "company", label: "Firma (A-Z)" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSortBy(opt.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                        sortBy === opt.id
                          ? "bg-white/10 text-white"
                          : "text-[#808080] hover:text-[#c0c0c0]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Tags / Notizen Filter */}
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#a0a0a0] hover:text-white">
                  <input
                    type="checkbox"
                    checked={onlyWithNotes}
                    onChange={(e) => setOnlyWithNotes(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-[#282728] accent-[#6642c7]"
                  />
                  <span>Nur Bewerbungen mit Tags / Notizen</span>
                </label>
              </div>
            </div>
          )}
        </header>

        {/* Board */}
        <main>
          <DndContext
            id="kanban-board-dnd"
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex h-[calc(100vh-16rem)] gap-5 overflow-x-auto pb-6 pt-1">
              {COLUMNS.map((col) => {
                const colApps = filteredApps.filter((app) => app.status === col.id);
                return (
                  <KanbanColumn
                    key={col.id}
                    column={col}
                    applications={colApps}
                    onCardClick={(app) => setSelectedApp(app)}
                    onAddClick={() => setIsAddModalOpen(true)}
                  />
                );
              })}
            </div>

            <DragOverlay>
              {activeApp ? <KanbanCard application={activeApp} /> : null}
            </DragOverlay>

            <TrashDropZone isDragging={!!activeApp} />
          </DndContext>
        </main>
      </div>

      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
      />

      <ApplicationDetailDrawer
        application={selectedApp}
        isOpen={!!selectedApp}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}