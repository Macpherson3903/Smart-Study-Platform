"use client";

import { useCallback, useEffect, useState } from "react";

import type { StudyQuestion } from "@/lib/ai/studyContentSchema";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { PracticeQuestion } from "@/components/features/practice/PracticeQuestion";
import { AnswerInput } from "@/components/features/practice/AnswerInput";
import {
  PracticeFeedback,
  type FeedbackResult,
} from "@/components/features/practice/PracticeFeedback";
import { PracticeComplete } from "@/components/features/practice/PracticeComplete";

interface QuestionState {
  userAnswer: string;
  feedback: FeedbackResult | null;
  status: "unanswered" | "submitting" | "reviewed";
}

interface PracticeModeProps {
  sessionId: string;
  questions: StudyQuestion[];
}

export function PracticeMode({ sessionId, questions }: PracticeModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(() =>
    questions.map(() => ({
      userAnswer: "",
      feedback: null,
      status: "unanswered",
    })),
  );
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
    setQuestionStates(
      questions.map(() => ({
        userAnswer: "",
        feedback: null,
        status: "unanswered",
      })),
    );
    setIsComplete(false);
    setError(null);
  }, [sessionId, questions]);

  const currentState = questionStates[currentIndex];
  const currentQuestion = questions[currentIndex];

  const updateCurrentAnswer = useCallback(
    (answer: string) => {
      setQuestionStates((prev) =>
        prev.map((s, i) =>
          i === currentIndex ? { ...s, userAnswer: answer } : s,
        ),
      );
    },
    [currentIndex],
  );

  const submitAnswer = useCallback(async () => {
    setError(null);
    setQuestionStates((prev) =>
      prev.map((s, i) =>
        i === currentIndex ? { ...s, status: "submitting" } : s,
      ),
    );

    try {
      const res = await fetch("/api/practice/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionIndex: currentIndex,
          question: currentQuestion.question,
          referenceAnswer: currentQuestion.answer,
          referenceKeyPoints: currentQuestion.key_points,
          userAnswer: currentState.userAnswer,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to evaluate answer");
      }

      const feedback: FeedbackResult = await res.json();

      setQuestionStates((prev) =>
        prev.map((s, i) =>
          i === currentIndex ? { ...s, feedback, status: "reviewed" } : s,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setQuestionStates((prev) =>
        prev.map((s, i) =>
          i === currentIndex ? { ...s, status: "unanswered" } : s,
        ),
      );
    }
  }, [sessionId, currentIndex, currentQuestion, currentState?.userAnswer]);

  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setError(null);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, questions.length]);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setQuestionStates(
      questions.map(() => ({
        userAnswer: "",
        feedback: null,
        status: "unanswered",
      })),
    );
    setIsComplete(false);
    setError(null);
  }, [questions]);

  if (isComplete) {
    return (
      <PracticeComplete
        sessionId={sessionId}
        feedbacks={questionStates.map((s) => s.feedback)}
        questionTexts={questions.map((q) => q.question)}
        onRestart={restart}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full ${
                i === currentIndex
                  ? "bg-brand-600"
                  : questionStates[i].status === "reviewed"
                    ? questionStates[i].feedback &&
                      questionStates[i].feedback!.score >= 70
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                    : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="py-6">
          <PracticeQuestion
            questionText={currentQuestion.question}
            currentIndex={currentIndex}
            total={questions.length}
          />
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-3">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <AnswerInput
        value={currentState.userAnswer}
        onChange={updateCurrentAnswer}
        onSubmit={submitAnswer}
        isSubmitting={currentState.status === "submitting"}
        disabled={currentState.status === "reviewed"}
      />

      {currentState.status === "submitting" && (
        <Card aria-busy="true" aria-live="polite">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="mt-3 space-y-2">
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-10/12" />
              <Skeleton className="h-3 w-8/12" />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Evaluating your answer…
            </p>
          </CardContent>
        </Card>
      )}

      {currentState.status === "reviewed" && currentState.feedback && (
        <PracticeFeedback feedback={currentState.feedback} />
      )}

      {currentState.status === "reviewed" && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={goNext}>
            {currentIndex < questions.length - 1
              ? "Next Question"
              : "Finish Practice"}
          </Button>
        </div>
      )}
    </div>
  );
}
