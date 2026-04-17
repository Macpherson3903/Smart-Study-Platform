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

interface SessionFlashcards {
  sessionId: string;
  preview: string;
  flashcards: Flashcard[];
}

export function FlashcardReviewer(props: { sessions: SessionFlashcards[] }) {
  const allCards = useMemo(
    () => props.sessions.flatMap((s) => s.flashcards),
    [props.sessions],
  );

  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>(allCards);
  const [interactions, setInteractions] = useState<
    Map<number, CardInteraction>
  >(new Map());

  // Reset derived state when the upstream list identity changes. This replaces
  // a useEffect that did the same work, following React's "adjust state during
  // render" pattern (https://react.dev/learn/you-might-not-need-an-effect).
  const [lastAllCards, setLastAllCards] = useState(allCards);
  if (lastAllCards !== allCards) {
    setLastAllCards(allCards);
    setCards(allCards);
    setIndex(0);
    setIsFlipped(false);
    setInteractions(new Map());
  }

  const shuffle = useCallback(() => {
    const copy = [...allCards];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setCards(copy);
    setIndex(0);
    setIsFlipped(false);
    setInteractions(new Map());
  }, [allCards]);

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
    </div>
  );
}
