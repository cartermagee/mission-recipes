import { mutateCollection, readCollection } from "@/lib/store/io";
import type { User, UserPrefs } from "@/lib/types";

const FILE = "users.json";

export async function listUsers(): Promise<User[]> {
  return readCollection<User>(FILE);
}

export async function getUser(id: string): Promise<User | undefined> {
  const users = await listUsers();
  return users.find((u) => u.id === id);
}

export async function listUsersInHousehold(
  householdId: string
): Promise<User[]> {
  const users = await listUsers();
  return users.filter((u) => u.householdId === householdId);
}

export async function createUser(user: User): Promise<User> {
  await mutateCollection<User>(FILE, (users) => [...users, user]);
  return user;
}

export async function updateUserPrefs(
  userId: string,
  prefs: UserPrefs
): Promise<User | undefined> {
  let updated: User | undefined;
  await mutateCollection<User>(FILE, (users) =>
    users.map((u) => {
      if (u.id !== userId) return u;
      updated = { ...u, preferences: prefs };
      return updated;
    })
  );
  return updated;
}

export async function setUserHousehold(
  userId: string,
  householdId: string
): Promise<User | undefined> {
  let updated: User | undefined;
  await mutateCollection<User>(FILE, (users) =>
    users.map((u) => {
      if (u.id !== userId) return u;
      updated = { ...u, householdId };
      return updated;
    })
  );
  return updated;
}
