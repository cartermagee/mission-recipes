import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getHousehold } from "@/lib/store/households";
import { getUser } from "@/lib/store/users";
import type { Household, User } from "@/lib/types";

export const SESSION_COOKIE = "demo_user_id";

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return (await getUser(id)) ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export interface UserWithHousehold {
  user: User;
  household: Household;
  isAdmin: boolean;
}

export async function requireUserWithHousehold(): Promise<UserWithHousehold> {
  const user = await requireUser();
  const household = await getHousehold(user.householdId);
  if (!household) redirect("/login");
  return { user, household, isAdmin: household.adminUserId === user.id };
}

export async function requireAdmin(): Promise<UserWithHousehold> {
  const ctx = await requireUserWithHousehold();
  if (!ctx.isAdmin) redirect("/household");
  return ctx;
}
