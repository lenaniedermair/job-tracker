"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

const DEMO_USER_ID = "user_demo_123";

// Zod-Validierungsschema
const applicationSchema = z.object({
  company: z.string().min(1, "Firmenname ist erforderlich."),
  position: z.string().min(1, "Position ist erforderlich."),
  location: z.string().optional(),
  jobUrl: z
    .string()
    .url("Ungültige URL-Adresse.")
    .optional()
    .or(z.literal("")),
  salary: z.string().optional(),
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().optional(),
});

const toNullIfEmpty = (str?: string) => (str && str.trim() !== "" ? str.trim() : null);

export async function getApplications() {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: DEMO_USER_ID },
      include: {
        events: true,
        documents: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    return { success: true, data: applications };
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return { success: false, error: "Fehler beim Laden der Bewerbungen." };
  }
}

export async function createApplication(rawData: unknown) {
  try {
    // Serverseitige Zod-Validierung
    const validated = applicationSchema.parse(rawData);

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
        company: validated.company.trim(),
        position: validated.position.trim(),
        location: toNullIfEmpty(validated.location),
        jobUrl: toNullIfEmpty(validated.jobUrl),
        salary: toNullIfEmpty(validated.salary),
        status: validated.status || ApplicationStatus.WISHLIST,
        notes: toNullIfEmpty(validated.notes),
      },
    });

    revalidatePath("/kanban");
    revalidatePath("/");
    return { success: true, data: newApp };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Failed to create application:", error);
    return { success: false, error: "Bewerbung konnte nicht angelegt werden." };
  }
}

export async function updateApplication(id: string, rawData: unknown) {
  try {
    const validated = applicationSchema.parse(rawData);

    const updated = await prisma.application.update({
      where: { id },
      data: {
        company: validated.company.trim(),
        position: validated.position.trim(),
        location: toNullIfEmpty(validated.location),
        jobUrl: toNullIfEmpty(validated.jobUrl),
        salary: toNullIfEmpty(validated.salary),
        status: validated.status,
        notes: toNullIfEmpty(validated.notes),
      },
    });

    revalidatePath("/kanban");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Failed to update application:", error);
    return { success: false, error: "Aktualisierung fehlgeschlagen." };
  }
}

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