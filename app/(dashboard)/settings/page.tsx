import type { Metadata } from "next";

import { getUserIdOrThrow } from "@/lib/auth";
import { SettingsForm } from "@/components/features/settings/SettingsForm";
import { getUserPreferences } from "@/server/services/userPreferencesService";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const userId = await getUserIdOrThrow();
  const preferences = await getUserPreferences({ userId });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-white">
          Settings
        </h2>
        <p className="mt-2 text-sm text-white">
          Recommended client-side defaults for your study workflow.
        </p>
      </div>

      <SettingsForm initialPreferences={preferences} />
    </div>
  );
}
