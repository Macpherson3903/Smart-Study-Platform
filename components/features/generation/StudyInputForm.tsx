"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { GenerateOptions } from "@/lib/ai/studyContentSchema";

import { GenerationLoadingPanel } from "@/components/features/generation/GenerationLoadingPanel";
import { GenerateOptionsPanel } from "@/components/features/generation/GenerateOptions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";

const REQUEST_MAX_CHARS = 20_000;

type Status = "idle" | "submitting" | "polling" | "error";

export function StudyInputForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [inputText, setInputText] = useState("");
  const [options, setOptions] = useState<GenerateOptions>({
    summary: true,
    questions: true,
    flashcards: true,
  });

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(
    null,
  );

  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    createIdempotencyKey(),
  );
  const [submittedText, setSubmittedText] = useState<string | null>(null);

  const trimmed = inputText.trim();
  const remaining = REQUEST_MAX_CHARS - inputText.length;
  const isBusy = status === "submitting" || status === "polling";

  const shouldAutoFocus = useMemo(
    () =>
      searchParams.get("focus") === "1" || searchParams.get("retry") === "1",
    [searchParams],
  );

  useEffect(() => {
    if (searchParams.get("retry") === "1") {
      const stored = sessionStorage.getItem("retry-input-text");
      if (stored) {
        setInputText(stored);
        sessionStorage.removeItem("retry-input-text");
        setIdempotencyKey(createIdempotencyKey());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!shouldAutoFocus) return;
    textareaRef.current?.focus();
  }, [shouldAutoFocus]);

  async function submitOnce() {
    const nextError = validateInput(inputText);
    if (nextError) {
      setStatus("error");
      setError(nextError);
      return;
    }

    let key = idempotencyKey;
    if (submittedText !== inputText) {
      key = createIdempotencyKey();
      setIdempotencyKey(key);
      setSubmittedText(inputText);
    }

    setStatus("submitting");
    setError(null);
    setRetryAfterSeconds(null);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        inputText,
        options,
        idempotencyKey: key,
      }),
    });

    const json = (await res.json()) as unknown;

    if (res.status === 201) {
      const data = json as { id: string };
      router.push(`/sessions/${data.id}?new=1`);
      return;
    }

    if (res.status === 202) {
      // Existing session with this idempotency key is still generating.
      setStatus("polling");
      return;
    }

    if (res.status === 401) {
      router.push("/sign-in");
      return;
    }

    if (res.status === 429) {
      const retryAfter = res.headers.get("retry-after");
      const seconds = retryAfter ? Number(retryAfter) : NaN;
      setRetryAfterSeconds(Number.isFinite(seconds) ? seconds : null);
    }

    const message =
      typeof json === "object" && json && "error" in json
        ? String((json as { error?: unknown }).error ?? "Request failed")
        : "Request failed";

    setStatus("error");
    setError(message);
  }

  useEffect(() => {
    if (status !== "polling") return;

    const timeout = window.setTimeout(() => {
      void submitOnce();
    }, 1500);

    return () => window.clearTimeout(timeout);
    // Intentionally depends on status only; submitOnce uses latest state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submitOnce();
      }}
    >
      <Card>
        <CardContent className="py-4">
          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your notes, lecture transcript, or chapter text here…"
            maxLength={REQUEST_MAX_CHARS}
            disabled={isBusy}
            className="min-h-64"
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs">
            <span className={remaining < 0 ? "text-red-700" : "text-slate-500"}>
              {remaining.toLocaleString("en-US")} characters remaining
            </span>
            <span className="text-slate-500">
              {inputText.length.toLocaleString("en-US")}/
              {REQUEST_MAX_CHARS.toLocaleString("en-US")}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <p className="text-sm font-semibold text-slate-900">Outputs</p>
          <p className="mt-1 text-sm text-slate-600">
            Choose what to generate. You can regenerate anytime.
          </p>
          <div className="mt-4">
            <GenerateOptionsPanel
              options={options}
              onChange={setOptions}
              disabled={isBusy}
            />
          </div>
        </CardContent>
      </Card>

      {isBusy ? <GenerationLoadingPanel /> : null}

      {status === "error" && error ? (
        <Alert
          tone="error"
          title="Couldn’t generate"
          description={error}
          action={{
            label: "Try again",
            onClick: () => void submitOnce(),
          }}
        >
          {typeof retryAfterSeconds === "number" ? (
            <p>
              Try again in about {Math.max(1, Math.round(retryAfterSeconds))}s.
            </p>
          ) : null}
        </Alert>
      ) : null}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white/80 p-3 backdrop-blur">
        <Button
          type="submit"
          isLoading={isBusy}
          disabled={trimmed.length === 0}
        >
          Generate
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isBusy || inputText.length === 0}
          onClick={() => {
            setInputText("");
            setError(null);
            setRetryAfterSeconds(null);
            setStatus("idle");
            setSubmittedText(null);
            setIdempotencyKey(createIdempotencyKey());
            textareaRef.current?.focus();
          }}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}

function validateInput(text: string) {
  if (text.trim().length === 0) return "Please paste some text to study.";
  if (text.length > REQUEST_MAX_CHARS)
    return `Input is too long. Max ${REQUEST_MAX_CHARS.toLocaleString("en-US")} characters.`;
  return null;
}

function createIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}
