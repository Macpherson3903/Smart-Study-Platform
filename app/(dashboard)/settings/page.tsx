import { Card, CardContent } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-slate-900">
          Settings
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Account settings and preferences will live here.
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-slate-600">
          Coming soon.
        </CardContent>
      </Card>
    </div>
  );
}

