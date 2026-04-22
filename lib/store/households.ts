import { mutateCollection, readCollection } from "@/lib/store/io";
import type { Household, HouseholdPrefs } from "@/lib/types";

const FILE = "households.json";

export async function listHouseholds(): Promise<Household[]> {
  return readCollection<Household>(FILE);
}

export async function getHousehold(
  id: string
): Promise<Household | undefined> {
  const households = await listHouseholds();
  return households.find((h) => h.id === id);
}

export async function updateHouseholdPrefs(
  householdId: string,
  prefs: HouseholdPrefs
): Promise<Household | undefined> {
  let updated: Household | undefined;
  await mutateCollection<Household>(FILE, (items) =>
    items.map((h) => {
      if (h.id !== householdId) return h;
      updated = { ...h, preferences: prefs };
      return updated;
    })
  );
  return updated;
}
