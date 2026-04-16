import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SessionLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-4">
          <Skeleton className="h-5 w-40" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-4">
          <Skeleton className="h-9 w-80" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-10/12" />
            <Skeleton className="h-3 w-9/12" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

