"use client";

import type { StudyContent } from "@/lib/ai/studyContentSchema";

import { CopyButton } from "@/components/features/results/CopyButton";
import { FlashcardsPanel } from "@/components/features/results/FlashcardsPanel";
import { KeyPointsPanel } from "@/components/features/results/KeyPointsPanel";
import { QuestionsPanel } from "@/components/features/results/QuestionsPanel";
import { SummaryPanel } from "@/components/features/results/SummaryPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

type TabValue = "summary" | "key_points" | "flashcards" | "questions";

export function ResultsTabs(props: {
  content: StudyContent;
  defaultTab?: TabValue;
}) {
  const content = props.content;

  const copyAll = buildCopyAll(content);
  const copySummary = content.summary?.trim() ?? "";
  const copyKeyPoints = (content.key_points ?? []).map((p) => `- ${p}`).join("\n");
  const copyQuestions = (content.questions ?? []).map((q, i) => `${i + 1}. ${q}`).join("\n");
  const copyFlashcards = (content.flashcards ?? [])
    .map((f, i) => `${i + 1}. ${f.front}\n   ${f.back}`)
    .join("\n\n");

  return (
    <Tabs defaultValue={props.defaultTab ?? "summary"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="key_points">Key points</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <div className="flex flex-wrap items-center gap-2">
          <CopyButton text={copyAll} label="Copy all" />
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-accent-700 opacity-60"
            aria-disabled="true"
            disabled
            title="Export coming soon"
          >
            Export (soon)
          </button>
        </div>
      </div>

      <TabsContent value="summary">
        <div className="flex items-center justify-end">
          <CopyButton text={copySummary} label="Copy summary" />
        </div>
        <div className="mt-3">
          <SummaryPanel content={content} />
        </div>
      </TabsContent>

      <TabsContent value="key_points">
        <div className="flex items-center justify-end">
          <CopyButton text={copyKeyPoints} label="Copy key points" />
        </div>
        <div className="mt-3">
          <KeyPointsPanel content={content} />
        </div>
      </TabsContent>

      <TabsContent value="flashcards">
        <div className="flex items-center justify-end">
          <CopyButton text={copyFlashcards} label="Copy flashcards" />
        </div>
        <div className="mt-3">
          <FlashcardsPanel content={content} />
        </div>
      </TabsContent>

      <TabsContent value="questions">
        <div className="flex items-center justify-end">
          <CopyButton text={copyQuestions} label="Copy questions" />
        </div>
        <div className="mt-3">
          <QuestionsPanel content={content} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

function buildCopyAll(content: StudyContent) {
  const lines: string[] = [];
  if (content.summary?.trim()) {
    lines.push("Summary");
    lines.push(content.summary.trim());
    lines.push("");
  }
  if ((content.key_points ?? []).length > 0) {
    lines.push("Key points");
    for (const p of content.key_points) lines.push(`- ${p}`);
    lines.push("");
  }
  if ((content.flashcards ?? []).length > 0) {
    lines.push("Flashcards");
    content.flashcards.forEach((f, i) => {
      lines.push(`${i + 1}. ${f.front}`);
      lines.push(`   ${f.back}`);
      lines.push("");
    });
  }
  if ((content.questions ?? []).length > 0) {
    lines.push("Questions");
    content.questions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
  }
  return lines.join("\n").trim();
}

