"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { userSchema, type UserFormState } from "@/lib/schemas/user";

function parseUserForm(formData: FormData) {
  return userSchema.safeParse({
    id: formData.get("id") ?? "",
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    role: formData.get("role") ?? "",
    phone: formData.get("phone") ?? "",
  });
}

// Coordinator: add a new user (ambassador or coordinator).
export async function createUser(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const { user, role } = await getCurrentUser();
  if (!user || role !== "COORDINATOR") return { formError: "Not authorized." };

  const parsed = parseUserForm(formData);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }
  const data = parsed.data;

  try {
    await prisma.user.create({
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone || null,
      },
    });
  } catch {
    // Most likely a duplicate unity id or email (unique constraints).
    return { formError: "A user with that unity ID or email already exists." };
  }

  revalidatePath("/directory");
  redirect("/directory");
}

// Coordinator: edit an existing user. `id` is read-only in the form, so it
// doubles as the lookup key.
export async function updateUser(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const { user, role } = await getCurrentUser();
  if (!user || role !== "COORDINATOR") return { formError: "Not authorized." };

  const parsed = parseUserForm(formData);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }
  const data = parsed.data;

  try {
    await prisma.user.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone || null,
      },
    });
  } catch {
    return { formError: "That email is already in use by another user." };
  }

  revalidatePath("/directory");
  revalidatePath(`/directory/${data.id}`);
  redirect(`/directory/${data.id}`);
}

// Coordinator: delete a user. Their signups + hour logs are removed first (those
// FKs are RESTRICT); events they created and hour logs they approved are simply
// detached (those FKs are SET NULL).
export async function deleteUser(userId: string) {
  const { user, role } = await getCurrentUser();
  if (!user || role !== "COORDINATOR") return;

  const id = z.string().min(1).safeParse(userId);
  if (!id.success) return;

  await prisma.signup.deleteMany({ where: { userId: id.data } });
  await prisma.hourLog.deleteMany({ where: { userId: id.data } });
  await prisma.user.delete({ where: { id: id.data } });

  revalidatePath("/directory");
  redirect("/directory");
}
