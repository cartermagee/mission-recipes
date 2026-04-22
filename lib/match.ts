import { detectAllergensInIngredients } from "@/lib/allergen-detect";
import type { EffectivePrefs } from "@/lib/preferences";
import type { Allergy, Diet, Recipe } from "@/lib/types";

export interface RecipeWarnings {
  allergies: Allergy[];
  diets: Diet[];
  cuisineDisliked: boolean;
}

export interface AnnotatedRecipe extends Recipe {
  detectedAllergens: Allergy[];
  warnings: RecipeWarnings;
  matches: {
    cuisineLiked: boolean;
    dietOk: boolean;
  };
  matchScore: number;
}

/**
 * Deterministically decide which diets a recipe is INCOMPATIBLE with.
 * A diet conflict is different from a diet "tag" — e.g. a vegan user sees
 * any recipe without the `vegan` tag flagged as a diet conflict.
 */
function dietConflicts(recipe: Recipe, userDiets: Diet[]): Diet[] {
  return userDiets.filter((d) => !recipe.dietTags.includes(d));
}

export function annotateRecipe(
  recipe: Recipe,
  prefs: EffectivePrefs
): AnnotatedRecipe {
  const schemaAllergens = recipe.allergens;
  const detected = detectAllergensInIngredients(recipe.ingredients);
  const detectedAllergens = Array.from(
    new Set<Allergy>([...schemaAllergens, ...detected])
  );

  const matchedAllergies = (prefs.allergies as Allergy[]).filter((a) =>
    detectedAllergens.includes(a)
  );

  const conflictingDiets = dietConflicts(recipe, prefs.diets as Diet[]);

  const cuisineLiked = prefs.cuisineLikes.includes(recipe.cuisine);
  const cuisineDisliked = prefs.cuisineDislikes.includes(recipe.cuisine);

  const warnings: RecipeWarnings = {
    allergies: matchedAllergies,
    diets: conflictingDiets,
    cuisineDisliked,
  };

  let score = 0;
  score -= matchedAllergies.length * 100;
  score -= conflictingDiets.length * 25;
  score -= cuisineDisliked ? 15 : 0;
  score += cuisineLiked ? 20 : 0;
  score -= Math.min(30, (recipe.prepMinutes + recipe.cookMinutes) / 10);

  return {
    ...recipe,
    detectedAllergens,
    warnings,
    matches: {
      cuisineLiked,
      dietOk: conflictingDiets.length === 0,
    },
    matchScore: Math.round(score * 100) / 100,
  };
}

export function hasAnyWarning(r: AnnotatedRecipe): boolean {
  return (
    r.warnings.allergies.length > 0 ||
    r.warnings.diets.length > 0 ||
    r.warnings.cuisineDisliked
  );
}
