import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold">Recipe not found</h1>
      <p className="text-sm text-muted-foreground">
        It may have been removed or the link is wrong.
      </p>
      <Button asChild>
        <Link href="/recipes">Back to recipes</Link>
      </Button>
    </div>
  );
}
