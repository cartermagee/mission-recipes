import { describe, expect, it } from "vitest";

import { annotateRecipe, hasAnyWarning } from "@/lib/match";
import type { EffectivePrefs } from "@/lib/preferences";
import type { Recipe } from "@/lib/types";

function makeRecipe(partial: Partial<Recipe> = {}): Recipe {
  return {
    id: "r1",
    title: "Test Recipe",
    image: "",
    cuisine: "Italian",
    dietTags: [],
    allergens: [],
    ingredients: [
      { name: "olive oil", quantity: 1, unit: "tbsp", category: "pantry" },
    ],
    steps: ["Do a thing.", "Do another."],
    prepMinutes: 10,
    cookMinutes: 10,
    servings: 2,
    createdAt: new Date().toISOString(),
    source: "seed",
    ...partial,
  };
}

function makePrefs(partial: Partial<EffectivePrefs> = {}): EffectivePrefs {
  return {
    allergies: [],
    diets: [],
    cuisineLikes: [],
    cuisineDislikes: [],
    ...partial,
  };
}

describe("annotateRecipe", () => {
  it("flags allergies via the explicit allergens field", () => {
    const recipe = makeRecipe({ allergens: ["peanuts"] });
    const prefs = makePrefs({ allergies: ["peanuts"] });
    const result = annotateRecipe(recipe, prefs);
    expect(result.warnings.allergies).toEqual(["peanuts"]);
    expect(result.detectedAllergens).toContain("peanuts");
  });

  it("flags allergies via ingredient-name keyword scan even when schema missed it", () => {
    const recipe = makeRecipe({
      allergens: [],
      ingredients: [
        { name: "peanut butter", quantity: 1, unit: "cup", category: "pantry" },
      ],
    });
    const prefs = makePrefs({ allergies: ["peanuts"] });
    const result = annotateRecipe(recipe, prefs);
    expect(result.warnings.allergies).toEqual(["peanuts"]);
  });

  it("reports diet conflicts when user diet is not among recipe dietTags", () => {
    const recipe = makeRecipe({ dietTags: ["vegetarian"] });
    const prefs = makePrefs({ diets: ["vegan"] });
    const result = annotateRecipe(recipe, prefs);
    expect(result.warnings.diets).toEqual(["vegan"]);
    expect(result.matches.dietOk).toBe(false);
  });

  it("reports no diet conflict when recipe carries the required diet tag", () => {
    const recipe = makeRecipe({ dietTags: ["vegan", "vegetarian"] });
    const prefs = makePrefs({ diets: ["vegan"] });
    const result = annotateRecipe(recipe, prefs);
    expect(result.warnings.diets).toEqual([]);
    expect(result.matches.dietOk).toBe(true);
  });

  it("flags cuisine dislike and rewards cuisine like in scoring", () => {
    const italianLiked = annotateRecipe(
      makeRecipe({ cuisine: "Italian" }),
      makePrefs({ cuisineLikes: ["Italian"] })
    );
    const americanDisliked = annotateRecipe(
      makeRecipe({ cuisine: "American" }),
      makePrefs({ cuisineDislikes: ["American"] })
    );

    expect(italianLiked.matches.cuisineLiked).toBe(true);
    expect(italianLiked.matchScore).toBeGreaterThan(americanDisliked.matchScore);
    expect(americanDisliked.warnings.cuisineDisliked).toBe(true);
  });

  it("heavily penalizes matchScore when an allergen is present", () => {
    const ok = annotateRecipe(makeRecipe(), makePrefs());
    const bad = annotateRecipe(
      makeRecipe({ allergens: ["peanuts"] }),
      makePrefs({ allergies: ["peanuts"] })
    );
    expect(bad.matchScore).toBeLessThan(ok.matchScore - 50);
  });

  it("hasAnyWarning is true when there is any kind of warning", () => {
    const ok = annotateRecipe(makeRecipe(), makePrefs());
    expect(hasAnyWarning(ok)).toBe(false);

    const bad = annotateRecipe(
      makeRecipe({ allergens: ["dairy"] }),
      makePrefs({ allergies: ["dairy"] })
    );
    expect(hasAnyWarning(bad)).toBe(true);
  });
});
