import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AnnotatedRecipe } from "@/lib/match";

export function WarningBadges({ recipe }: { recipe: AnnotatedRecipe }) {
  const { warnings, matches } = recipe;
  const items: React.ReactNode[] = [];

  if (warnings.allergies.length > 0) {
    items.push(
      <Badge key="allergy" variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        <span className="capitalize">
          Contains: {warnings.allergies.join(", ")}
        </span>
      </Badge>
    );
  }

  if (warnings.diets.length > 0) {
    items.push(
      <Badge key="diet" variant="warn" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        <span className="capitalize">
          Not {warnings.diets.join(", ")}
        </span>
      </Badge>
    );
  }

  if (warnings.cuisineDisliked) {
    items.push(
      <Badge key="cuisine-dislike" variant="secondary" className="gap-1">
        Cuisine you avoid
      </Badge>
    );
  }

  if (items.length === 0 && matches.cuisineLiked && matches.dietOk) {
    items.push(
      <Badge key="match" variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Matches your prefs
      </Badge>
    );
  } else if (items.length === 0) {
    items.push(
      <Badge key="ok" variant="outline" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        No warnings
      </Badge>
    );
  }

  return <div className="flex flex-wrap gap-1">{items}</div>;
}
