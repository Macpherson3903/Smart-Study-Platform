"use client";

import { useMemo, useState } from "react";

import type { StudyQuestion } from "@/lib/ai/studyContentSchema";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";

export function QuestionsExamMode(props: {
  sessionId: string;
  questions: StudyQuestion[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [marked, setMarked] = useState<Array<boolean | null>>(() =>
    props.questions.map(() => null),
  );

  const currentQuestion = props.questions[currentIndex];
  const total = props.questions.length;
  const answeredCount = useMemo(
    () => marked.filter((value) => value !== null).length,
    [marked],
  );
  const score = useMemo(
    () => marked.filter((value) => value === true).length,
    [marked],
  );
  const isComplete = answeredCount === total;

  const moveToQuestion = (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    setDraftAnswer("");
    setRevealed(false);
  };

  const markCurrent = (isCorrect: boolean) => {
    setMarked((prev) => {
      const next = [...prev];
      next[currentIndex] = isCorrect;
      return next;
    });
  };

  const resetExam = () => {
    setMarked(props.questions.map(() => null));
    moveToQuestion(0);
  };

  return (
    <div id={`exam-${props.sessionId}`} className="space-y-3">
      <Alert
        tone="info"
        title="CBT exam mode"
        description="Attempt each question, reveal the reference answer, then mark yourself correct or incorrect."
      />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">
              Question {currentIndex + 1} of {total}
            </p>
            <p className="text-xs text-white/80">
              Score: {score}/{answeredCount}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          <p className="text-sm font-semibold text-white">
            {currentQuestion?.question}
          </p>

          <div className="space-y-2">
            <label
              htmlFor="exam-answer"
              className="text-xs font-semibold uppercase tracking-wide text-white/80"
            >
              Your answer
            </label>
            <Textarea
              id="exam-answer"
              value={draftAnswer}
              onChange={(event) => setDraftAnswer(event.target.value)}
              placeholder="Type your answer before revealing the reference."
              className="min-h-28"
            />
          </div>

          {revealed ? (
            <div className="rounded-md border border-purple-300/30 bg-black/30 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                Reference answer
              </p>
              <p className="mt-1 text-sm text-white">
                {currentQuestion?.answer || "No reference answer available."}
              </p>

              {currentQuestion?.key_points.length ? (
                <>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-white/80">
                    Key points
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-white">
                    {currentQuestion.key_points.map((point, pointIndex) => (
                      <li key={`${point}-${pointIndex}`}>{point}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setRevealed(true)}>
              Reveal answer
            </Button>
            <Button
              variant="primary"
              disabled={!revealed}
              onClick={() => markCurrent(true)}
            >
              Mark correct
            </Button>
            <Button
              variant="secondary"
              disabled={!revealed}
              onClick={() => markCurrent(false)}
            >
              Mark incorrect
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-between gap-2">
        <Button
          variant="secondary"
          disabled={currentIndex === 0}
          onClick={() => moveToQuestion(currentIndex - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={currentIndex === total - 1}
          onClick={() => moveToQuestion(currentIndex + 1)}
        >
          Next
        </Button>
      </div>

      {isComplete ? (
        <Alert
          tone="success"
          title={`Exam complete: ${score}/${total}`}
          description="You can review answers with Previous/Next or reset the exam."
          action={{ label: "Reset exam", onClick: resetExam }}
        />
      ) : null}
    </div>
  );
}
