import { randomBytes } from "node:crypto";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

import { detectAllergensInIngredients } from "@/lib/allergen-detect";
import { llmRecipeSchema, type LlmRecipe } from "@/lib/ai/recipe-schema";
import type { EffectivePrefs } from "@/lib/preferences";
import { listRecipes } from "@/lib/store/recipes";
import type { Allergy, Cuisine, Diet, Recipe } from "@/lib/types";

export interface GenerateRequest {
  cuisine?: Cuisine;
  diet?: Diet;
  excludeAllergies?: Allergy[];
  seedHint?: string;
}

function buildPrompt(
  req: GenerateRequest,
  prefs: EffectivePrefs
): { system: string; prompt: string } {
  const system =
    "You are a friendly recipe developer. You always return a complete, realistic recipe. " +
    "You accurately list allergens present in the recipe and the diets it satisfies. " +
    "You pick the 'cuisine' from the allowed list only. Ingredient names are generic and lowercased (e.g. 'olive oil', 'shrimp, peeled').";

  const parts: string[] = [];
  parts.push(`Create a new recipe.`);
  if (req.cuisine) parts.push(`Cuisine: ${req.cuisine}.`);
  if (req.diet) parts.push(`It must satisfy this diet: ${req.diet}.`);
  if (req.excludeAllergies && req.excludeAllergies.length > 0) {
    parts.push(
      `AVOID these allergens entirely: ${req.excludeAllergies.join(", ")}.`
    );
  }
  if (prefs.cuisineLikes.length > 0) {
    parts.push(`The cook enjoys: ${prefs.cuisineLikes.join(", ")}.`);
  }
  if (prefs.cuisineDislikes.length > 0) {
    parts.push(`Avoid cuisines: ${prefs.cuisineDislikes.join(", ")}.`);
  }
  if (req.seedHint) parts.push(`Theme hint: ${req.seedHint}.`);
  parts.push(
    `Return between 5 and 12 ingredients with realistic quantities, and 3-8 concise steps.`
  );

  return { system, prompt: parts.join(" ") };
}

function toRecipe(llm: LlmRecipe, source: Recipe["source"]): Recipe {
  const allergens = Array.from(
    new Set([
      ...llm.allergens,
      ...detectAllergensInIngredients(llm.ingredients),
    ])
  );
  const id = `r_${randomBytes(6).toString("hex")}`;
  const imageSeed = encodeURIComponent(llm.title.toLowerCase().replace(/\s+/g, "-"));
  return {
    id,
    title: llm.title,
    image: `https://picsum.photos/seed/${imageSeed}/600/400`,
    cuisine: llm.cuisine,
    dietTags: llm.dietTags,
    allergens,
    ingredients: llm.ingredients,
    steps: llm.steps,
    prepMinutes: llm.prepMinutes,
    cookMinutes: llm.cookMinutes,
    servings: llm.servings,
    createdAt: new Date().toISOString(),
    source,
  };
}

async function mockGenerate(req: GenerateRequest): Promise<Recipe> {
  const base = await listRecipes();
  const pool = base.length > 0 ? base : [];
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if (!pick) {
    throw new Error("No seed recipes available for mock generation.");
  }
  const clone: Recipe = {
    ...pick,
    id: `r_${randomBytes(6).toString("hex")}`,
    title: `[Mock] ${pick.title}${req.seedHint ? ` — ${req.seedHint}` : ""}`,
    createdAt: new Date().toISOString(),
    source: "mock",
  };
  return clone;
}

export async function generateRecipe(
  req: GenerateRequest,
  prefs: EffectivePrefs
): Promise<Recipe> {
  if (!process.env.OPENAI_API_KEY) {
    return mockGenerate(req);
  }

  const { system, prompt } = buildPrompt(req, prefs);

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: llmRecipeSchema,
      system,
      prompt,
      temperature: 0.8,
    });
    return toRecipe(object, "llm");
  } catch (err) {
    console.error("[generate-recipe] LLM failed, falling back to mock:", err);
    return mockGenerate(req);
  }
}
