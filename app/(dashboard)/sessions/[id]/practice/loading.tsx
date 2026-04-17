import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PracticeLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <div>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-1.5 w-8" />
        ))}
      </div>
      <Card>
        <CardContent className="py-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-6 w-3/4" />
        </CardContent>
      </Card>
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
