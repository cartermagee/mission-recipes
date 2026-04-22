import type { Allergy, RecipeIngredient } from "@/lib/types";

/**
 * Keyword map for ingredient-level allergen scanning.
 * Each keyword is matched as a substring against the lower-cased ingredient name.
 * The lists intentionally err on the side of "flag it" — false positives are fine,
 * false negatives are not.
 */
const ALLERGEN_KEYWORDS: Record<Allergy, string[]> = {
  peanuts: ["peanut"],
  "tree nuts": [
    "almond",
    "cashew",
    "hazelnut",
    "pecan",
    "pistachio",
    "walnut",
    "macadamia",
    "brazil nut",
    "pine nut",
  ],
  dairy: [
    "milk",
    "cream",
    "butter",
    "cheese",
    "cheddar",
    "parmesan",
    "mozzarella",
    "gruyere",
    "feta",
    "ricotta",
    "yogurt",
    "ghee",
    "mascarpone",
  ],
  eggs: ["egg"],
  shellfish: [
    "shrimp",
    "prawn",
    "crab",
    "lobster",
    "clam",
    "mussel",
    "oyster",
    "scallop",
    "crayfish",
  ],
  gluten: [
    "flour",
    "bread",
    "pasta",
    "noodle",
    "linguine",
    "spaghetti",
    "pita",
    "tortilla",
    "crust",
    "breadcrumb",
    "couscous",
    "bulgur",
    "udon",
    "ramen",
    "soy sauce",
  ],
  soy: [
    "soy",
    "tofu",
    "edamame",
    "tempeh",
    "miso",
    "doubanjiang",
    "soybean",
  ],
  sesame: ["sesame", "tahini"],
};

export function detectAllergensInIngredients(
  ingredients: RecipeIngredient[]
): Allergy[] {
  const hits = new Set<Allergy>();
  for (const ing of ingredients) {
    const haystack = ing.name.toLowerCase();
    for (const allergy of Object.keys(ALLERGEN_KEYWORDS) as Allergy[]) {
      for (const kw of ALLERGEN_KEYWORDS[allergy]) {
        if (haystack.includes(kw)) {
          hits.add(allergy);
          break;
        }
      }
    }
  }
  return Array.from(hits);
}

export function allergenKeywordsFor(allergy: Allergy): string[] {
  return ALLERGEN_KEYWORDS[allergy];
}
