import type { Metadata } from "next";

import { FlashcardReviewer } from "@/components/features/flashcards/FlashcardReviewer";
import { getUserIdOrThrow } from "@/lib/auth";
import { listStudySessions } from "@/server/services/studySessionService";

export const metadata: Metadata = { title: "Flashcards" };

export default async function FlashcardsPage() {
  const userId = await getUserIdOrThrow();

  const { sessions } = await listStudySessions({
    userId,
    limit: 50,
    includeResult: true,
  });

  const withFlashcards = sessions
    .filter(
      (s) =>
        s.status === "complete" && s.result && s.result.flashcards.length > 0,
    )
    .map((s) => ({
      sessionId: s.id,
      preview: s.inputTextPreview,
      flashcards: s.result!.flashcards,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-slate-900">
          Flashcards
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Review flashcards from your study sessions. Click a card to flip it.
        </p>
      </div>

      <FlashcardReviewer sessions={withFlashcards} />
    </div>
  );
}
