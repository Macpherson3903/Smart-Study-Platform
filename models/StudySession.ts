import type { Document } from "mongodb";

import type {
  GenerateOptions,
  StudyContent,
} from "@/lib/ai/studyContentSchema";
import {
  STUDY_CONTENT_KIND,
  STUDY_CONTENT_PROMPT_VERSION,
} from "@/lib/ai/studyContentSchema";

export const STUDY_SESSIONS_COLLECTION = "studySessions" as const;

export type StudySessionStatus = "pending" | "complete" | "error";

export interface StudySessionError {
  code: string;
  message: string;
}

export interface StudySessionAiMeta {
  kind: typeof STUDY_CONTENT_KIND;
  promptVersion: typeof STUDY_CONTENT_PROMPT_VERSION;
  model: string;
  options: GenerateOptions;
}

interface StudySessionBaseDocument extends Document {
  userId: string;
  inputText: string;
  inputTextPreview?: string;
  idempotencyKey?: string;
  /**
   * Deterministic hash of (userId, inputText, options) used to reuse prior
   * complete sessions without re-calling Gemini. Populated on insert.
   */
  contentHash?: string;
  aiMeta: StudySessionAiMeta;
  status: StudySessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySessionPendingDocument extends StudySessionBaseDocument {
  status: "pending";
}

export interface StudySessionCompleteDocument extends StudySessionBaseDocument {
  status: "complete";
  result: StudyContent;
}

export interface StudySessionErrorDocument extends StudySessionBaseDocument {
  status: "error";
  error: StudySessionError;
}

export type StudySessionDocument =
  | StudySessionPendingDocument
  | StudySessionCompleteDocument
  | StudySessionErrorDocument;

export interface InsertPendingStudySessionInput {
  userId: string;
  inputText: string;
  inputTextPreview?: string;
  idempotencyKey?: string;
  contentHash?: string;
  aiMeta: StudySessionAiMeta;
}

export interface StudySessionListItem {
  id: string;
  inputTextPreview: string;
  inputText?: string;
  status: StudySessionStatus;
  result?: StudyContent;
  error?: StudySessionError;
  createdAt: string;
  updatedAt: string;
}
