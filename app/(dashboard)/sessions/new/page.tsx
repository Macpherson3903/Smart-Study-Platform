import type { Metadata } from "next";

import { getUserIdOrThrow } from "@/lib/auth";
import { StudyInputForm } from "@/components/features/generation/StudyInputForm";
import { getUserPreferences } from "@/server/services/userPreferencesService";

export const metadata: Metadata = { title: "New Session" };

export default async function NewSessionPage() {
  const userId = await getUserIdOrThrow();
  const preferences = await getUserPreferences({ userId });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-white">
          New study session
        </h2>
        <p className="mt-2 text-sm text-white">
          Paste any academic text and generate a focused study pack.
        </p>
      </div>

      <StudyInputForm
        initialOptions={preferences.defaultGenerateOptions}
        autoFocusDefault={preferences.autoFocusStudyInput}
      />
    </div>
  );
}
