import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { createInvite, listInvitesForHousehold } from "@/lib/store/invites";

const TOKEN_BYTES = 12;
const EXPIRES_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function GET() {
  const { household } = await requireAdmin();
  const invites = await listInvitesForHousehold(household.id);
  return NextResponse.json({ invites });
}

export async function POST() {
  const { household, user } = await requireAdmin();
  const now = new Date();
  const invite = await createInvite({
    token: randomBytes(TOKEN_BYTES).toString("hex"),
    householdId: household.id,
    createdBy: user.id,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + EXPIRES_MS).toISOString(),
  });
  return NextResponse.json({ invite });
}
