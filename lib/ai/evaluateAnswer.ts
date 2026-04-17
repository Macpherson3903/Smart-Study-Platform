import "server-only";

import { z } from "zod";
import {
  ApiError,
  GoogleGenAI,
  type GenerateContentResponse,
} from "@google/genai";
import { env } from "@/lib/env";
import { GeminiError } from "@/lib/gemini";
import {
  buildEvaluationSystemPrompt,
  buildEvaluationUserPrompt,
} from "@/lib/ai/prompts/evaluationPrompts";

export const evaluationResultSchema = z.object({
  isCorrect: z.boolean(),
  score: z.number().min(0).max(100),
  feedback: z.string(),
  missingPoints: z.array(z.string()),
  suggestedAnswer: z.string(),
});

export type EvaluationResult = z.infer<typeof evaluationResultSchema>;

export interface EvaluateAnswerInput {
  question: string;
  referenceAnswer: string;
  referenceKeyPoints: string[];
  userAnswer: string;
}

function getClient(): GoogleGenAI {
  const apiKey = env.GEMINI_API_KEY();
  return new GoogleGenAI({ apiKey });
}

function extractJsonObject(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const withoutFences = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const first = withoutFences.indexOf("{");
  const last = withoutFences.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  return withoutFences.slice(first, last + 1);
}

export async function evaluateAnswer(
  input: EvaluateAnswerInput,
): Promise<EvaluationResult> {
  if (!input.userAnswer.trim()) {
    return {
      isCorrect: false,
      score: 0,
      feedback: "No answer was provided.",
      missingPoints: input.referenceKeyPoints,
      suggestedAnswer: input.referenceAnswer,
    };
  }

  if (!input.referenceAnswer && input.referenceKeyPoints.length === 0) {
    return {
      isCorrect: false,
      score: 0,
      feedback:
        "This question does not have a reference answer for evaluation. Your answer has been recorded.",
      missingPoints: [],
      suggestedAnswer: "",
    };
  }

  const ai = getClient();
  const systemInstruction = buildEvaluationSystemPrompt();
  const userPrompt = buildEvaluationUserPrompt(input);

  let response: GenerateContentResponse;
  try {
    response = await ai.models.generateContent({
      model: "models/gemini-3.1-flash-lite-preview",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0,
        maxOutputTokens: 1000,
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          additionalProperties: false,
          required: [
            "isCorrect",
            "score",
            "feedback",
            "missingPoints",
            "suggestedAnswer",
          ],
          properties: {
            isCorrect: { type: "boolean" },
            score: { type: "number" },
            feedback: { type: "string" },
            missingPoints: { type: "array", items: { type: "string" } },
            suggestedAnswer: { type: "string" },
          },
        },
      },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      throw new GeminiError({
        message: "Rate limited. Please try again shortly.",
        code: "GEMINI_RATE_LIMITED",
        status: 429,
        cause: err,
      });
    }
    throw new GeminiError({
      message: err instanceof Error ? err.message : "Evaluation failed",
      code: "GEMINI_UNKNOWN",
      cause: err,
    });
  }

  const text = String(response.text ?? "");
  const jsonCandidate = extractJsonObject(text);
  if (!jsonCandidate) {
    throw new GeminiError({
      message: "Evaluation returned empty or non-JSON output.",
      code: "GEMINI_INVALID_RESPONSE",
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonCandidate);
  } catch {
    throw new GeminiError({
      message: "Evaluation returned invalid JSON.",
      code: "GEMINI_INVALID_RESPONSE",
    });
  }

  const validated = evaluationResultSchema.safeParse(parsed);
  if (!validated.success) {
    throw new GeminiError({
      message:
        "Evaluation returned JSON that does not match the expected schema.",
      code: "GEMINI_INVALID_RESPONSE",
    });
  }

  return validated.data;
}
