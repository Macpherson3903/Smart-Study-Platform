"use client";

import type { StudyContent } from "@/lib/ai/studyContentSchema";
import { QuestionsExamMode } from "@/components/features/results/QuestionsExamMode";

import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export function QuestionsPanel(props: {
  sessionId: string;
  content: StudyContent;
}) {
  const questions = props.content.questions ?? [];
  const hasAnswers = questions.some((q) => q.answer.length > 0);

  if (questions.length === 0) {
    return (
      <EmptyState
        title="Questions weren’t generated"
        description="Regenerate this session with questions enabled to practice them here."
        action={{ label: "New session", href: "/sessions/new" }}
      />
    );
  }

  return (
    <Tabs defaultValue="review">
      <TabsList>
        <TabsTrigger value="review">Review</TabsTrigger>
        <TabsTrigger value="exam" disabled={!hasAnswers}>
          CBT Exam
        </TabsTrigger>
      </TabsList>

      <TabsContent value="review">
        <Card>
          <CardContent className="py-4">
            <ol className="list-decimal space-y-4 pl-5 text-sm text-white">
              {questions.map((q, i) => (
                <li key={i}>
                  <p className="font-semibold text-white">{q.question}</p>
                  {q.answer && <p className="mt-1 text-white">{q.answer}</p>}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="exam">
        {hasAnswers ? (
          <QuestionsExamMode sessionId={props.sessionId} questions={questions} />
        ) : (
          <EmptyState
            title="CBT exam unavailable"
            description="This session was created with an older format that doesn't include reference answers. Create a new session to use CBT exam mode."
            action={{ label: "New session", href: "/sessions/new" }}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
