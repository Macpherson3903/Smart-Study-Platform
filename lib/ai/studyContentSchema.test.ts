import { describe, expect, it } from "vitest";
import {
  generateOptionsSchema,
  normalizeQuestions,
  normalizeStudyContentForOptions,
  normalizeStudyContentFromStorage,
  studyContentSchema,
  type GenerateOptions,
  type StudyContent,
} from "./studyContentSchema";

const VALID_CONTENT: StudyContent = {
  summary: "This is a summary.",
  key_points: ["Point A", "Point B"],
  questions: [
    {
      question: "What is A?",
      answer: "A is the first item.",
      key_points: ["first item"],
    },
    {
      question: "What is B?",
      answer: "B is the second item.",
      key_points: ["second item"],
    },
  ],
  flashcards: [
    { front: "Term A", back: "Definition A" },
    { front: "Term B", back: "Definition B" },
  ],
};

describe("studyContentSchema", () => {
  it("accepts valid content", () => {
    const result = studyContentSchema.safeParse(VALID_CONTENT);
    expect(result.success).toBe(true);
  });

  it("rejects content with extra fields", () => {
    const result = studyContentSchema.safeParse({
      ...VALID_CONTENT,
      extra: "field",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const { summary: _summary, ...noSummary } = VALID_CONTENT;
    const result = studyContentSchema.safeParse(noSummary);
    expect(result.success).toBe(false);
  });
});

describe("generateOptionsSchema", () => {
  it("applies defaults when empty object is provided", () => {
    const result = generateOptionsSchema.parse({});
    expect(result).toEqual({
      summary: true,
      questions: true,
      flashcards: true,
    });
  });

  it("respects explicit false values", () => {
    const result = generateOptionsSchema.parse({
      summary: false,
      questions: false,
      flashcards: false,
    });
    expect(result).toEqual({
      summary: false,
      questions: false,
      flashcards: false,
    });
  });
});

describe("normalizeStudyContentForOptions", () => {
  it("returns full content when all options are true", () => {
    const options: GenerateOptions = {
      summary: true,
      questions: true,
      flashcards: true,
    };
    const result = normalizeStudyContentForOptions(VALID_CONTENT, options);
    expect(result).toEqual(VALID_CONTENT);
  });

  it("clears summary and key_points when summary is false", () => {
    const options: GenerateOptions = {
      summary: false,
      questions: true,
      flashcards: true,
    };
    const result = normalizeStudyContentForOptions(VALID_CONTENT, options);
    expect(result.summary).toBe("");
    expect(result.key_points).toEqual([]);
    expect(result.questions).toEqual(VALID_CONTENT.questions);
    expect(result.flashcards).toEqual(VALID_CONTENT.flashcards);
  });

  it("clears questions when questions is false", () => {
    const options: GenerateOptions = {
      summary: true,
      questions: false,
      flashcards: true,
    };
    const result = normalizeStudyContentForOptions(VALID_CONTENT, options);
    expect(result.questions).toEqual([]);
  });

  it("clears flashcards when flashcards is false", () => {
    const options: GenerateOptions = {
      summary: true,
      questions: true,
      flashcards: false,
    };
    const result = normalizeStudyContentForOptions(VALID_CONTENT, options);
    expect(result.flashcards).toEqual([]);
  });
});

describe("normalizeQuestions", () => {
  it("converts legacy string[] to StudyQuestion[]", () => {
    const result = normalizeQuestions(["What is A?", "What is B?"]);
    expect(result).toEqual([
      { question: "What is A?", answer: "", key_points: [] },
      { question: "What is B?", answer: "", key_points: [] },
    ]);
  });

  it("passes through structured questions unchanged", () => {
    const structured = [
      { question: "What is A?", answer: "A is first.", key_points: ["first"] },
    ];
    const result = normalizeQuestions(structured);
    expect(result).toEqual(structured);
  });

  it("handles mixed arrays", () => {
    const mixed = [
      "What is A?",
      {
        question: "What is B?",
        answer: "B is second.",
        key_points: ["second"],
      },
    ];
    const result = normalizeQuestions(mixed);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      question: "What is A?",
      answer: "",
      key_points: [],
    });
    expect(result[1]).toEqual({
      question: "What is B?",
      answer: "B is second.",
      key_points: ["second"],
    });
  });
});

describe("normalizeStudyContentFromStorage", () => {
  it("normalizes legacy content with string questions", () => {
    const legacy = {
      summary: "A summary.",
      key_points: ["Point A"],
      questions: ["What is A?"],
      flashcards: [{ front: "Term", back: "Def" }],
    };
    const result = normalizeStudyContentFromStorage(legacy);
    expect(result.questions[0]).toEqual({
      question: "What is A?",
      answer: "",
      key_points: [],
    });
    expect(result.summary).toBe("A summary.");
  });

  it("passes through new-format content", () => {
    const result = normalizeStudyContentFromStorage(VALID_CONTENT);
    expect(result).toEqual(VALID_CONTENT);
  });
});
