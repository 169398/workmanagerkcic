"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "../auth";
import { users } from "../../../db/schema";
import db from "../../../db/drizzle";
import { hashPassword } from "../password-utils";
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD||'';

export async function addEmployee(data: {
  name: string;
  email: string;
  department: string;
  title: string;
  role: string;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "admin") {
    throw new Error("Unauthorized");
  }
  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  await db.insert(users).values({
    id: `usr_${Date.now()}`,
    ...data,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordLastChanged: new Date(),
  });

  revalidatePath("/dashboard");
}

export async function deleteEmployee(id: string) {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/dashboard");
}

export async function getEmployeesByDepartment(department?: string) {
  if (!department || department === "All") {
    return db.query.users.findMany({
      orderBy: (users, { asc }) => [asc(users.name)],
    });
  }

  return db.query.users.findMany({
    where: eq(users.department, department),
    orderBy: (users, { asc }) => [asc(users.name)],
  });
}

export async function getTotalEmployees() {
  const employees = await db.query.users.findMany();
  return employees.length;
}
