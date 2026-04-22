import { NextResponse } from "next/server";

import { requireAdmin, requireUserWithHousehold } from "@/lib/auth";
import { preferencesSchema } from "@/lib/preferences";
import {
  getHousehold,
  updateHouseholdPrefs,
} from "@/lib/store/households";
import { listUsersInHousehold } from "@/lib/store/users";

export async function GET() {
  const { household } = await requireUserWithHousehold();
  const members = await listUsersInHousehold(household.id);
  return NextResponse.json({ household, members });
}

export async function PATCH(req: Request) {
  const { household } = await requireAdmin();
  const body = await req.json().catch(() => null);
  const parsed = preferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid preferences", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const updated = await updateHouseholdPrefs(household.id, parsed.data);
  return NextResponse.json({
    household: updated ?? (await getHousehold(household.id)),
  });
}
