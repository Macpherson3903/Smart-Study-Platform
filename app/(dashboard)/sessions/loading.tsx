import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SessionsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-200">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

