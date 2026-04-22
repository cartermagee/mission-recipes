import { describe, expect, it } from "vitest";

import { mergePreferences } from "@/lib/preferences";
import type { HouseholdPrefs, UserPrefs } from "@/lib/types";

const empty: UserPrefs = {
  allergies: [],
  diets: [],
  cuisineLikes: [],
  cuisineDislikes: [],
};

describe("mergePreferences", () => {
  it("unions allergies from household and user (safety first)", () => {
    const household: HouseholdPrefs = {
      ...empty,
      allergies: ["peanuts"],
    };
    const user: UserPrefs = { ...empty, allergies: ["shellfish"] };

    const result = mergePreferences(household, user);
    expect(new Set(result.allergies)).toEqual(new Set(["peanuts", "shellfish"]));
  });

  it("dedupes overlapping allergies", () => {
    const household: HouseholdPrefs = { ...empty, allergies: ["peanuts"] };
    const user: UserPrefs = { ...empty, allergies: ["peanuts"] };
    const result = mergePreferences(household, user);
    expect(result.allergies).toEqual(["peanuts"]);
  });

  it("personal diets fully override household diets when non-empty", () => {
    const household: HouseholdPrefs = { ...empty, diets: ["vegetarian"] };
    const user: UserPrefs = { ...empty, diets: ["pescatarian"] };
    const result = mergePreferences(household, user);
    expect(result.diets).toEqual(["pescatarian"]);
  });

  it("falls back to household diets when user has none", () => {
    const household: HouseholdPrefs = { ...empty, diets: ["vegetarian"] };
    const user: UserPrefs = { ...empty };
    const result = mergePreferences(household, user);
    expect(result.diets).toEqual(["vegetarian"]);
  });

  it("personal cuisineLikes override household when set", () => {
    const household: HouseholdPrefs = {
      ...empty,
      cuisineLikes: ["Italian"],
    };
    const user: UserPrefs = { ...empty, cuisineLikes: ["Thai"] };
    const result = mergePreferences(household, user);
    expect(result.cuisineLikes).toEqual(["Thai"]);
  });

  it("empty user + empty household yields empty effective prefs", () => {
    const result = mergePreferences(empty as HouseholdPrefs, empty);
    expect(result).toEqual(empty);
  });
});
