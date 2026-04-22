import { z } from "zod";

import {
  ALLERGIES,
  CUISINES,
  DIETS,
  type Allergy,
  type Cuisine,
  type Diet,
  type HouseholdPrefs,
  type UserPrefs,
} from "@/lib/types";

export interface EffectivePrefs {
  allergies: Allergy[];
  diets: Diet[];
  cuisineLikes: Cuisine[];
  cuisineDislikes: Cuisine[];
}

function uniq<T>(xs: T[]): T[] {
  return Array.from(new Set(xs));
}

/**
 * Merge household and personal preferences.
 * - allergies: UNION (safety-first, per Q7)
 * - diets / cuisine: personal overrides household when personal set is non-empty
 */
export function mergePreferences(
  household: HouseholdPrefs,
  personal: UserPrefs
): EffectivePrefs {
  const allergies = uniq([...household.allergies, ...personal.allergies]);

  const diets =
    personal.diets.length > 0 ? personal.diets.slice() : household.diets.slice();

  const cuisineLikes =
    personal.cuisineLikes.length > 0
      ? personal.cuisineLikes.slice()
      : household.cuisineLikes.slice();

  const cuisineDislikes =
    personal.cuisineDislikes.length > 0
      ? personal.cuisineDislikes.slice()
      : household.cuisineDislikes.slice();

  return { allergies, diets, cuisineLikes, cuisineDislikes };
}

export const preferencesSchema = z.object({
  allergies: z.array(z.enum(ALLERGIES)).default([]),
  diets: z.array(z.enum(DIETS)).default([]),
  cuisineLikes: z.array(z.enum(CUISINES)).default([]),
  cuisineDislikes: z.array(z.enum(CUISINES)).default([]),
});
