import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { preferencesSchema } from "@/lib/preferences";
import { getUser, updateUserPrefs } from "@/lib/store/users";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json({ preferences: user.preferences });
}

export async function PATCH(req: Request) {
  const user = await requireUser();
  const body = await req.json().catch(() => null);
  const parsed = preferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid preferences", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const updated = await updateUserPrefs(user.id, parsed.data);
  return NextResponse.json({ user: updated ?? (await getUser(user.id)) });
}
