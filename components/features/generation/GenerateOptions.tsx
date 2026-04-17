"use client";

import type { GenerateOptions } from "@/lib/ai/studyContentSchema";

import { Switch } from "@/components/ui/Switch";

export function GenerateOptionsPanel(props: {
  options: GenerateOptions;
  onChange: (next: GenerateOptions) => void;
  disabled?: boolean;
}) {
  const { options } = props;

  return (
    <div className="space-y-4">
      <Switch
        label="Summary"
        description="Includes summary and key points."
        checked={options.summary}
        disabled={props.disabled}
        onCheckedChange={(checked) =>
          props.onChange({ ...options, summary: checked })
        }
      />
      <Switch
        label="Questions"
        description="Practice questions to test your understanding."
        checked={options.questions}
        disabled={props.disabled}
        onCheckedChange={(checked) =>
          props.onChange({ ...options, questions: checked })
        }
      />
      <Switch
        label="Flashcards"
        description="Front/back flashcards for spaced repetition."
        checked={options.flashcards}
        disabled={props.disabled}
        onCheckedChange={(checked) =>
          props.onChange({ ...options, flashcards: checked })
        }
      />
    </div>
  );
}
