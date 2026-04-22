import { annotateRecipe, hasAnyWarning, type AnnotatedRecipe } from "@/lib/match";
import type { EffectivePrefs } from "@/lib/preferences";
import type { Cuisine, Diet, Recipe } from "@/lib/types";

export const SORT_OPTIONS = [
  "best-match",
  "prep-time",
  "newest",
  "title",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export interface RecipeFilterInput {
  cuisines?: Cuisine[];
  maxPrepMinutes?: number;
  diets?: Diet[];
  sort?: SortOption;
  hideAllergyWarnings?: boolean;
  query?: string;
}

export function annotateAndFilter(
  recipes: Recipe[],
  prefs: EffectivePrefs,
  filters: RecipeFilterInput
): AnnotatedRecipe[] {
  const {
    cuisines,
    maxPrepMinutes,
    diets,
    sort = "best-match",
    hideAllergyWarnings,
    query,
  } = filters;

  const annotated = recipes.map((r) => annotateRecipe(r, prefs));

  const q = query?.trim().toLowerCase();

  const filtered = annotated.filter((r) => {
    if (cuisines && cuisines.length > 0 && !cuisines.includes(r.cuisine)) {
      return false;
    }
    if (
      typeof maxPrepMinutes === "number" &&
      r.prepMinutes + r.cookMinutes > maxPrepMinutes
    ) {
      return false;
    }
    if (diets && diets.length > 0) {
      const missing = diets.some((d) => !r.dietTags.includes(d));
      if (missing) return false;
    }
    if (hideAllergyWarnings && r.warnings.allergies.length > 0) {
      return false;
    }
    if (q) {
      const hay = [
        r.title,
        r.cuisine,
        ...r.ingredients.map((i) => i.name),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sorters: Record<SortOption, (a: AnnotatedRecipe, b: AnnotatedRecipe) => number> = {
    "best-match": (a, b) => b.matchScore - a.matchScore,
    "prep-time": (a, b) =>
      a.prepMinutes + a.cookMinutes - (b.prepMinutes + b.cookMinutes),
    newest: (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    title: (a, b) => a.title.localeCompare(b.title),
  };

  return filtered.slice().sort(sorters[sort]);
}

export { hasAnyWarning };
