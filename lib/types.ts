export const ALLERGIES = [
  "peanuts",
  "tree nuts",
  "dairy",
  "eggs",
  "shellfish",
  "gluten",
  "soy",
  "sesame",
] as const;

export const DIETS = [
  "vegetarian",
  "vegan",
  "pescatarian",
  "keto",
  "halal",
  "kosher",
] as const;

export const CUISINES = [
  "Italian",
  "Mexican",
  "Thai",
  "Indian",
  "Chinese",
  "Japanese",
  "Mediterranean",
  "American",
  "French",
  "Middle Eastern",
  "Korean",
  "Vietnamese",
] as const;

export const INGREDIENT_CATEGORIES = [
  "produce",
  "dairy",
  "pantry",
  "meat",
  "seafood",
  "bakery",
  "frozen",
  "other",
] as const;

export type Allergy = (typeof ALLERGIES)[number];
export type Diet = (typeof DIETS)[number];
export type Cuisine = (typeof CUISINES)[number];
export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

export interface HouseholdPrefs {
  allergies: Allergy[];
  diets: Diet[];
  cuisineLikes: Cuisine[];
  cuisineDislikes: Cuisine[];
}

export interface UserPrefs {
  allergies: Allergy[];
  diets: Diet[];
  cuisineLikes: Cuisine[];
  cuisineDislikes: Cuisine[];
}

export interface User {
  id: string;
  name: string;
  householdId: string;
  preferences: UserPrefs;
}

export interface Household {
  id: string;
  name: string;
  adminUserId: string;
  preferences: HouseholdPrefs;
}

export interface Invite {
  token: string;
  householdId: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  usedBy?: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  cuisine: Cuisine;
  dietTags: Diet[];
  allergens: Allergy[];
  ingredients: RecipeIngredient[];
  steps: string[];
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  createdAt: string;
  source: "seed" | "llm" | "mock";
}

export interface ShoppingListItem {
  id: string;
  userId: string;
  recipeId: string | null;
  recipeTitle: string | null;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  checked: boolean;
  createdAt: string;
}
