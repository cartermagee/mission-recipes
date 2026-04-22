import { z } from "zod";

import {
  ALLERGIES,
  CUISINES,
  DIETS,
  INGREDIENT_CATEGORIES,
} from "@/lib/types";

export const recipeIngredientSchema = z.object({
  name: z.string().min(1).describe("Generic ingredient name, lowercased"),
  quantity: z.number().positive().describe("Numeric quantity (supports decimals)"),
  unit: z.string().min(1).describe("Unit: tbsp, tsp, cup, g, ml, whole, cloves, etc."),
  category: z
    .enum(INGREDIENT_CATEGORIES)
    .describe("Grocery category for shopping list grouping"),
});

export const llmRecipeSchema = z.object({
  title: z.string().min(1),
  cuisine: z.enum(CUISINES),
  dietTags: z.array(z.enum(DIETS)).default([]),
  allergens: z
    .array(z.enum(ALLERGIES))
    .default([])
    .describe("Allergens present in this recipe"),
  ingredients: z.array(recipeIngredientSchema).min(3),
  steps: z.array(z.string().min(1)).min(2),
  prepMinutes: z.number().int().min(0),
  cookMinutes: z.number().int().min(0),
  servings: z.number().int().positive(),
});

export type LlmRecipe = z.infer<typeof llmRecipeSchema>;
