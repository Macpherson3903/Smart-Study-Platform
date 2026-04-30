"use client";

import { useState } from "react";

import type { UserPreferences } from "@/lib/userPreferences";

import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";

export function SettingsForm(props: { initialPreferences: UserPreferences }) {
  const [preferences, setPreferences] = useState(props.initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  async function saveSettings() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(preferences),
      });
      const json = (await res.json()) as
        | { preferences?: UserPreferences; error?: string; message?: string }
        | undefined;

      if (!res.ok) {
        throw new Error(json?.error ?? json?.message ?? "Failed to save");
      }

      if (json?.preferences) {
        setPreferences(json.preferences);
      }
      toast.success("Settings saved");
    } catch (error) {
      toast.error("Couldn’t save settings", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-white">
            Default generation outputs
          </h3>
          <p className="mt-1 text-sm text-white">
            Recommended defaults for this project are all enabled.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Switch
              label="Summary"
              description="On by default for quick topic overviews."
              checked={preferences.defaultGenerateOptions.summary}
              onCheckedChange={(checked) =>
                setPreferences((current) => ({
                  ...current,
                  defaultGenerateOptions: {
                    ...current.defaultGenerateOptions,
                    summary: checked,
                  },
                }))
              }
            />
            <Switch
              label="Questions"
              description="On by default for active recall practice."
              checked={preferences.defaultGenerateOptions.questions}
              onCheckedChange={(checked) =>
                setPreferences((current) => ({
                  ...current,
                  defaultGenerateOptions: {
                    ...current.defaultGenerateOptions,
                    questions: checked,
                  },
                }))
              }
            />
            <Switch
              label="Flashcards"
              description="On by default for repeat review sessions."
              checked={preferences.defaultGenerateOptions.flashcards}
              onCheckedChange={(checked) =>
                setPreferences((current) => ({
                  ...current,
                  defaultGenerateOptions: {
                    ...current.defaultGenerateOptions,
                    flashcards: checked,
                  },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-white">Session input</h3>
          <p className="mt-1 text-sm text-white">
            Client-side behavior for the new session screen.
          </p>
        </CardHeader>
        <CardContent>
          <Switch
            label="Auto-focus input"
            description="Recommended on so you can paste and start immediately."
            checked={preferences.autoFocusStudyInput}
            onCheckedChange={(checked) =>
              setPreferences((current) => ({
                ...current,
                autoFocusStudyInput: checked,
              }))
            }
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={() => void saveSettings()} isLoading={isSaving}>
          Save settings
        </Button>
      </div>
    </div>
  );
}
