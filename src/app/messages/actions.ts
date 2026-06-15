"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Coordinator: post an announcement to an audience ("ALL" | "AMBASSADOR" |
// "COORDINATOR").
export async function postAnnouncement(formData: FormData) {
  const { user, role } = await getCurrentUser();
  if (!user || role !== "COORDINATOR") return;

  const body = String(formData.get("body") ?? "").trim();
  const audience = String(formData.get("audience") ?? "ALL");
  if (!body) return;

  await prisma.announcement.create({
    data: { authorId: user.id, body, audience },
  });
  revalidatePath("/messages");
  revalidatePath("/");
}

export async function deleteAnnouncement(id: string) {
  const { role } = await getCurrentUser();
  if (role !== "COORDINATOR") return;
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/messages");
  revalidatePath("/");
}
