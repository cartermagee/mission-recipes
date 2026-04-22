import { NextResponse } from "next/server";

import { requireUserWithHousehold } from "@/lib/auth";
import { mergePreferences } from "@/lib/preferences";
import {
  SORT_OPTIONS,
  annotateAndFilter,
  type SortOption,
} from "@/lib/recipe-query";
import { listRecipes } from "@/lib/store/recipes";
import { CUISINES, DIETS, type Cuisine, type Diet } from "@/lib/types";

function parseList<T extends string>(value: string | null, allowed: readonly T[]): T[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v): v is T => (allowed as readonly string[]).includes(v));
}

export async function GET(req: Request) {
  const { user, household } = await requireUserWithHousehold();
  const prefs = mergePreferences(household.preferences, user.preferences);

  const { searchParams } = new URL(req.url);
  const sortRaw = searchParams.get("sort");
  const sort: SortOption = (SORT_OPTIONS as readonly string[]).includes(
    sortRaw ?? ""
  )
    ? (sortRaw as SortOption)
    : "best-match";
  const maxPrep = searchParams.get("maxPrep");
  const maxPrepMinutes = maxPrep ? Number(maxPrep) : undefined;

  const filters = {
    cuisines: parseList<Cuisine>(searchParams.get("cuisine"), CUISINES),
    diets: parseList<Diet>(searchParams.get("diet"), DIETS),
    maxPrepMinutes:
      typeof maxPrepMinutes === "number" && Number.isFinite(maxPrepMinutes)
        ? maxPrepMinutes
        : undefined,
    sort,
    hideAllergyWarnings:
      searchParams.get("hideAllergyWarnings") === "1" ||
      searchParams.get("hideAllergyWarnings") === "true",
    query: searchParams.get("q") ?? undefined,
  };

  const recipes = await listRecipes();
  const annotated = annotateAndFilter(recipes, prefs, filters);

  return NextResponse.json({
    recipes: annotated,
    effectivePreferences: prefs,
    totalCount: recipes.length,
    filteredCount: annotated.length,
  });
}
