import { PreferenceForm } from "@/components/preference-form";
import { requireUserWithHousehold } from "@/lib/auth";
import { mergePreferences } from "@/lib/preferences";
import { Badge } from "@/components/ui/badge";

export default async function PreferencesPage() {
  const { user, household } = await requireUserWithHousehold();
  const effective = mergePreferences(household.preferences, user.preferences);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Your preferences
        </h1>
        <p className="text-muted-foreground">
          These layer on top of your household defaults. Allergies are combined
          for safety; diets and cuisines replace the household defaults when
          you set them.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <div className="text-sm font-medium">Effective preferences</div>
        <EffectiveRow label="Allergies" items={effective.allergies} variant="destructive" />
        <EffectiveRow label="Diets" items={effective.diets} variant="warn" />
        <EffectiveRow label="Favorite cuisines" items={effective.cuisineLikes} variant="success" />
        <EffectiveRow label="Avoid cuisines" items={effective.cuisineDislikes} variant="secondary" />
      </div>

      <PreferenceForm
        scope="personal"
        initial={user.preferences}
        endpoint="/api/preferences"
      />
    </div>
  );
}

function EffectiveRow({
  label,
  items,
  variant,
}: {
  label: string;
  items: string[];
  variant: "destructive" | "warn" | "success" | "secondary";
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <div className="w-36 shrink-0 text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items.length === 0 ? (
          <span className="text-xs text-muted-foreground">None</span>
        ) : (
          items.map((i) => (
            <Badge key={i} variant={variant} className="capitalize text-[10px]">
              {i}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
