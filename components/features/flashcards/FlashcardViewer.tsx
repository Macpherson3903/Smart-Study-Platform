"use client";

import { useCallback, useMemo, useState } from "react";

import type { StudyContent } from "@/lib/ai/studyContentSchema";
import { EmptyState } from "@/components/ui/EmptyState";
import { FlashcardCard } from "@/components/features/flashcards/FlashcardCard";
import { FlashcardControls } from "@/components/features/flashcards/FlashcardControls";
import {
  FlashcardActions,
  type CardInteraction,
} from "@/components/features/flashcards/FlashcardActions";
import { FlashcardProgress } from "@/components/features/flashcards/FlashcardProgress";

type Flashcard = StudyContent["flashcards"][number];

interface FlashcardViewerProps {
  sessionId: string;
  flashcards: Flashcard[];
}

export function FlashcardViewer({
  sessionId,
  flashcards,
}: FlashcardViewerProps) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>(flashcards);
  const [interactions, setInteractions] = useState<
    Map<number, CardInteraction>
  >(new Map());

  // Reset derived state when the upstream session or list changes. Follows
  // React's "adjust state during render" pattern instead of the discouraged
  // useEffect + setState combination.
  const [lastKey, setLastKey] = useState<{
    sessionId: string;
    flashcards: Flashcard[];
  }>({ sessionId, flashcards });
  if (lastKey.sessionId !== sessionId || lastKey.flashcards !== flashcards) {
    setLastKey({ sessionId, flashcards });
    setCards(flashcards);
    setIndex(0);
    setIsFlipped(false);
    setInteractions(new Map());
  }

  const shuffle = useCallback(() => {
    const copy = [...flashcards];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setCards(copy);
    setIndex(0);
    setIsFlipped(false);
    setInteractions(new Map());
  }, [flashcards]);

  const goNext = useCallback(() => {
    setIsFlipped(false);
    setIndex((i) => Math.min(i + 1, cards.length - 1));
  }, [cards.length]);

  const goPrev = useCallback(() => {
    setIsFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goTo = useCallback((i: number) => {
    setIndex(i);
    setIsFlipped(false);
  }, []);

  const handleMark = useCallback(
    (interaction: CardInteraction) => {
      setInteractions((prev) => {
        const next = new Map(prev);
        next.set(index, interaction);
        return next;
      });
      if (index < cards.length - 1) {
        setIsFlipped(false);
        setIndex((i) => i + 1);
      }
    },
    [index, cards.length],
  );

  const interactionsRecord = useMemo(() => {
    const obj: Record<number, CardInteraction> = {};
    interactions.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  }, [interactions]);

  if (cards.length === 0) {
    return (
      <EmptyState
        title="No flashcards yet"
        description="Generate a study session with flashcards enabled to start reviewing."
        action={{ label: "Create session", href: "/sessions/new" }}
      />
    );
  }

  const current = cards[index];

  return (
    <div className="space-y-6">
      <FlashcardControls
        index={index}
        total={cards.length}
        onPrev={goPrev}
        onNext={goNext}
        onShuffle={shuffle}
      />

      <FlashcardCard
        front={current.front}
        back={current.back}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped((f) => !f)}
      />

      <FlashcardActions
        currentInteraction={interactions.get(index)}
        onMark={handleMark}
      />

      <FlashcardProgress
        total={cards.length}
        currentIndex={index}
        interactions={interactionsRecord}
        onDotClick={goTo}
      />

      {interactions.size > 0 && (
        <div className="flex justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Known:{" "}
            {[...interactions.values()].filter((v) => v === "known").length}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            Review:{" "}
            {[...interactions.values()].filter((v) => v === "review").length}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
            Remaining: {cards.length - interactions.size}
          </span>
        </div>
      )}
    </div>
  );
}
