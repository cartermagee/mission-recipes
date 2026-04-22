"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
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
import { cn } from "@/lib/utils";

type Scope = "personal" | "household";
type Prefs = UserPrefs | HouseholdPrefs;

interface Props {
  scope: Scope;
  initial: Prefs;
  readOnly?: boolean;
  endpoint: string;
}

export function PreferenceForm({ scope, initial, readOnly, endpoint }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [isPending, startTransition] = useTransition();
  const hasChanges = useMemo(
    () => JSON.stringify(prefs) !== JSON.stringify(initial),
    [prefs, initial]
  );

  const toggle = <K extends keyof Prefs>(key: K, value: Prefs[K][number]) => {
    if (readOnly) return;
    setPrefs((p) => {
      const current = p[key] as unknown as string[];
      const has = current.includes(value as unknown as string);
      const next = has
        ? current.filter((v) => v !== value)
        : [...current, value as unknown as string];
      return { ...p, [key]: next } as Prefs;
    });
  };

  const save = () => {
    startTransition(async () => {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        toast({
          variant: "destructive",
          title: "Could not save",
          description: error ?? "Unknown error",
        });
        return;
      }
      toast({
        variant: "success",
        title: "Preferences saved",
        description:
          scope === "personal"
            ? "Your preferences were updated."
            : "Household preferences were updated.",
      });
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <ChipSection
        title="Allergies"
        description="Anything in these categories will be flagged on recipes."
        options={ALLERGIES}
        selected={prefs.allergies}
        onToggle={(v) => toggle("allergies", v as Allergy)}
        variant="destructive"
        readOnly={readOnly}
      />
      <ChipSection
        title="Diets"
        description="Recipes that conflict with a selected diet will be flagged."
        options={DIETS}
        selected={prefs.diets}
        onToggle={(v) => toggle("diets", v as Diet)}
        variant="warn"
        readOnly={readOnly}
      />
      <ChipSection
        title="Favorite cuisines"
        description="Recipes in these cuisines score higher in Best Match."
        options={CUISINES}
        selected={prefs.cuisineLikes}
        onToggle={(v) => toggle("cuisineLikes", v as Cuisine)}
        variant="success"
        readOnly={readOnly}
      />
      <ChipSection
        title="Cuisines to avoid"
        description="Recipes in these cuisines are deprioritized."
        options={CUISINES}
        selected={prefs.cuisineDislikes}
        onToggle={(v) => toggle("cuisineDislikes", v as Cuisine)}
        variant="secondary"
        readOnly={readOnly}
      />
      {!readOnly ? (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setPrefs(initial)}
            disabled={!hasChanges || isPending}
          >
            Reset
          </Button>
          <Button onClick={save} disabled={!hasChanges || isPending}>
            {isPending ? "Saving…" : "Save preferences"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ChipSection({
  title,
  description,
  options,
  selected,
  onToggle,
  variant,
  readOnly,
}: {
  title: string;
  description: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  variant: "default" | "destructive" | "secondary" | "warn" | "success";
  readOnly?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              disabled={readOnly}
              className={cn(
                "transition disabled:opacity-70 disabled:cursor-not-allowed"
              )}
            >
              <Badge
                variant={active ? variant : "outline"}
                className={cn(
                  "px-3 py-1 text-xs cursor-pointer capitalize",
                  active ? "" : "hover:bg-accent"
                )}
              >
                {opt}
              </Badge>
            </button>
          );
        })}
        {selected.length === 0 ? (
          <span className="text-xs text-muted-foreground">None selected</span>
        ) : null}
      </CardContent>
    </Card>
  );
}
