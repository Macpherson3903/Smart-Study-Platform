import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-10">
      <section>
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </section>

      <section>
        <Skeleton className="h-4 w-28" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Card>
            <CardContent className="py-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-56" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-56" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <Skeleton className="h-4 w-32" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Card>
            <CardContent className="py-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-3 w-11/12" />
              <Skeleton className="mt-2 h-3 w-10/12" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-3 w-11/12" />
              <Skeleton className="mt-2 h-3 w-10/12" />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
