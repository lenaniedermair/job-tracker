"use client";

import { useEffect, useState } from "react";
import { ApplicationStatus, ApplicationWithDetails } from "@/types";
import { updateApplication, deleteApplication } from "@/actions/applications";
import {
  X,
  Trash2,
  Save,
  Building2,
  Briefcase,
  MapPin,
  Euro,
  Link,
  FileText,
  Loader2,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ApplicationDetailDrawerProps {
  application: ApplicationWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationDetailDrawer({
  application,
  isOpen,
  onClose,
}: ApplicationDetailDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Explizite Typisierung verhindert, dass TypeScript 'status' starr auf 'WISHLIST' verengt
  const [formData, setFormData] = useState<{
    company: string;
    position: string;
    location: string;
    salary: string;
    jobUrl: string;
    status: ApplicationStatus;
    notes: string;
  }>({
    company: "",
    position: "",
    location: "",
    salary: "",
    jobUrl: "",
    status: ApplicationStatus.WISHLIST,
    notes: "",
  });

  // Formulardaten aktualisieren, wenn eine neue Karte gewählt wird
  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company || "",
        position: application.position || "",
        location: application.location || "",
        salary: application.salary || "",
        jobUrl: application.jobUrl || "",
        status: application.status,
        notes: application.notes || "",
      });
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateApplication(application.id, formData);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Möchtest du diese Bewerbung wirklich löschen?")) return;

    setIsDeleting(true);
    const res = await deleteApplication(application.id);
    setIsDeleting(false);

    if (res.success) {
      onClose();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-slate-800 bg-slate-900 p-6 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Calendar className="h-4 w-4" />
                <span>
                  Beworben am{" "}
                  {format(new Date(application.appliedDate), "dd. MMMM yyyy", {
                    locale: de,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Löschen"
                >
                  {isDeleting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content Form */}
            <form id="drawer-form" onSubmit={handleSave} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Firma
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Position
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ApplicationStatus,
                      })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={ApplicationStatus.WISHLIST}>Wunschliste</option>
                    <option value={ApplicationStatus.APPLIED}>Beworben</option>
                    <option value={ApplicationStatus.INTERVIEW}>Interview</option>
                    <option value={ApplicationStatus.OFFER}>Angebot</option>
                    <option value={ApplicationStatus.REJECTED}>Absage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Standort
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Gehalt
                  </label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Stellenanzeige
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="url"
                      value={formData.jobUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, jobUrl: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Notizen & Notizen zum Bewerbungsgespräch
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <textarea
                    rows={6}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Notizen zu Ansprechpartnern, Fragen im Interview, etc."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              form="drawer-form"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Änderungen speichern
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}