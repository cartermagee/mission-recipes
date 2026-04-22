import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUserWithHousehold } from "@/lib/auth";
import { generateRecipe } from "@/lib/ai/generate-recipe";
import { annotateRecipe } from "@/lib/match";
import { mergePreferences } from "@/lib/preferences";
import { addRecipe } from "@/lib/store/recipes";
import { ALLERGIES, CUISINES, DIETS } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z
  .object({
    cuisine: z.enum(CUISINES).optional(),
    diet: z.enum(DIETS).optional(),
    excludeAllergies: z.array(z.enum(ALLERGIES)).optional(),
    seedHint: z.string().max(120).optional(),
  })
  .default({});

export async function POST(req: Request) {
  const { user, household } = await requireUserWithHousehold();
  const prefs = mergePreferences(household.preferences, user.preferences);

  const bodyJson = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(bodyJson);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const input = {
    cuisine: parsed.data.cuisine,
    diet: parsed.data.diet,
    excludeAllergies:
      parsed.data.excludeAllergies ??
      (prefs.allergies.length > 0 ? prefs.allergies : undefined),
    seedHint: parsed.data.seedHint,
  };

  const recipe = await generateRecipe(input, prefs);
  await addRecipe(recipe);
  const annotated = annotateRecipe(recipe, prefs);

  return NextResponse.json({ recipe: annotated });
}
