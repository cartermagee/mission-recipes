"use client";

import { parseAsArrayOf, parseAsBoolean, parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SORT_OPTIONS, type SortOption } from "@/lib/recipe-query";
import {
  CUISINES,
  DIETS,
  type Cuisine,
  type Diet,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_PREP_MINUTES = 240;

const sortLabels: Record<SortOption, string> = {
  "best-match": "Best match",
  "prep-time": "Prep time (fastest)",
  newest: "Newest",
  title: "Title (A–Z)",
};

export function FilterBar() {
  const [cuisines, setCuisines] = useQueryState(
    "cuisine",
    parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true, shallow: false })
  );
  const [diets, setDiets] = useQueryState(
    "diet",
    parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true, shallow: false })
  );
  const [maxPrep, setMaxPrep] = useQueryState(
    "maxPrep",
    parseAsInteger.withDefault(MAX_PREP_MINUTES).withOptions({ clearOnDefault: true, shallow: false })
  );
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringEnum([...SORT_OPTIONS]).withDefault("best-match").withOptions({ clearOnDefault: true, shallow: false })
  );
  const [hideAllergies, setHideAllergies] = useQueryState(
    "hideAllergyWarnings",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true, shallow: false })
  );
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true, shallow: false, throttleMs: 300 })
  );

  const toggle = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const hasFilters =
    cuisines.length > 0 ||
    diets.length > 0 ||
    maxPrep < MAX_PREP_MINUTES ||
    hideAllergies ||
    (query?.length ?? 0) > 0 ||
    sort !== "best-match";

  const clearAll = () => {
    setCuisines(null);
    setDiets(null);
    setMaxPrep(null);
    setSort(null);
    setHideAllergies(null);
    setQuery(null);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value || null)}
              placeholder="Search recipes or ingredients…"
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="md:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {sortLabels[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Switch
              id="hide-allergies"
              checked={hideAllergies}
              onCheckedChange={(c) => setHideAllergies(c || null)}
            />
            <label htmlFor="hide-allergies" className="text-sm font-medium">
              Hide allergy warnings
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Cuisines
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CUISINES.map((c) => {
                  const active = cuisines.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCuisines(toggle(cuisines, c))}
                    >
                      <Badge
                        variant={active ? "default" : "outline"}
                        className={cn("cursor-pointer", active ? "" : "hover:bg-accent")}
                      >
                        {c}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Diets
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DIETS.map((d) => {
                  const active = diets.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiets(toggle(diets, d))}
                    >
                      <Badge
                        variant={active ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer capitalize",
                          active ? "" : "hover:bg-accent"
                        )}
                      >
                        {d}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Max total time
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[maxPrep]}
                min={10}
                max={MAX_PREP_MINUTES}
                step={5}
                onValueChange={([v]) => setMaxPrep(v === MAX_PREP_MINUTES ? null : v)}
              />
              <span className="text-sm tabular-nums w-16 text-right">
                {maxPrep >= MAX_PREP_MINUTES ? "any" : `${maxPrep}m`}
              </span>
            </div>
          </div>
        </div>

        {hasFilters ? (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// Types preserved for potential callers.
export type { Cuisine, Diet };
