import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-80 rounded-md bg-muted animate-pulse" />
      </div>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="h-10 rounded-md bg-muted animate-pulse" />
          <div className="h-6 w-72 rounded-md bg-muted animate-pulse" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-[3/2] bg-muted animate-pulse" />
            <CardContent className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse" />
              <div className="h-3 w-1/2 rounded-md bg-muted animate-pulse" />
              <div className="h-5 w-24 rounded-full bg-muted animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
