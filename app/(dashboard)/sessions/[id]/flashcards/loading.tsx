import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function FlashcardsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <div>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-9 w-20" />
      </div>
      <Card>
        <CardContent className="flex min-h-52 flex-col items-center justify-center py-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-6 w-64" />
        </CardContent>
      </Card>
      <div className="flex justify-center gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
