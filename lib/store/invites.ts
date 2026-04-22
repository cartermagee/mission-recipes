import { mutateCollection, readCollection } from "@/lib/store/io";
import type { Invite } from "@/lib/types";

const FILE = "invites.json";

export async function listInvites(): Promise<Invite[]> {
  return readCollection<Invite>(FILE);
}

export async function getInvite(token: string): Promise<Invite | undefined> {
  const all = await listInvites();
  return all.find((i) => i.token === token);
}

export async function createInvite(invite: Invite): Promise<Invite> {
  await mutateCollection<Invite>(FILE, (items) => [...items, invite]);
  return invite;
}

export async function markInviteUsed(
  token: string,
  userId: string
): Promise<Invite | undefined> {
  let updated: Invite | undefined;
  await mutateCollection<Invite>(FILE, (items) =>
    items.map((i) => {
      if (i.token !== token) return i;
      updated = { ...i, usedBy: userId };
      return updated;
    })
  );
  return updated;
}

export async function listInvitesForHousehold(
  householdId: string
): Promise<Invite[]> {
  const all = await listInvites();
  return all.filter((i) => i.householdId === householdId);
}
