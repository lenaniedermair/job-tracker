"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

const DEMO_USER_ID = "user_demo_123";

const toNullIfEmpty = (str?: string) => (str && str.trim() !== "" ? str.trim() : null);

/**
 * Alle Bewerbungen abrufen
 */
export async function getApplications() {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: DEMO_USER_ID },
      include: {
        events: { orderBy: { eventDate: "asc" } },
        documents: { orderBy: { uploadedAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return { success: true, data: applications };
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return { success: false, error: "Fehler beim Laden der Bewerbungen." };
  }
}

/**
 * Status via Drag & Drop aktualisieren
 */
export async function updateApplicationStatus(
  id: string,
  newStatus: ApplicationStatus
) {
  try {
    const updated = await prisma.application.update({
      where: { id },
      data: { status: newStatus },
    });

    revalidatePath("/kanban");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Status konnte nicht aktualisiert werden." };
  }
}

/**
 * Neue Bewerbung erstellen
 */
export async function createApplication(formData: {
  company: string;
  position: string;
  location?: string;
  jobUrl?: string;
  salary?: string;
  status?: ApplicationStatus;
  notes?: string;
}) {
  try {
    await prisma.user.upsert({
      where: { id: DEMO_USER_ID },
      update: {},
      create: {
        id: DEMO_USER_ID,
        email: "demo@jobtracker.dev",
        name: "Demo Candidate",
      },
    });

    const newApp = await prisma.application.create({
      data: {
        userId: DEMO_USER_ID,
        company: formData.company.trim(),
        position: formData.position.trim(),
        location: toNullIfEmpty(formData.location),
        jobUrl: toNullIfEmpty(formData.jobUrl),
        salary: toNullIfEmpty(formData.salary),
        status: formData.status || ApplicationStatus.WISHLIST,
        notes: toNullIfEmpty(formData.notes),
      },
    });

    revalidatePath("/kanban");
    revalidatePath("/");
    return { success: true, data: newApp };
  } catch (error) {
    console.error("Failed to create application:", error);
    return { success: false, error: "Bewerbung konnte nicht angelegt werden." };
  }
}

/**
 * Bewerbung löschen
 */
export async function deleteApplication(id: string) {
  try {
    await prisma.application.delete({
      where: { id },
    });

    revalidatePath("/kanban");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete application:", error);
    return { success: false, error: "Löschen fehlgeschlagen." };
  }
}