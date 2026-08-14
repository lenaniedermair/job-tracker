"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AddApplicationModal } from "./add-application-modal";

export function KanbanHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    setIsModalOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Bewerbungs-Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Verwalte deine Bewerbungen per Drag-and-Drop in Echtzeit.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Bewerbung hinzufügen
        </button>
      </div>

      <AddApplicationModal isOpen={isModalOpen} onClose={handleClose} />
    </>
  );
}