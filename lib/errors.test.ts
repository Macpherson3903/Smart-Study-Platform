import { describe, expect, it, vi } from "vitest";
import { AppError, toErrorMessage } from "./errors";

vi.mock("server-only", () => ({}));

describe("AppError", () => {
  it("stores code and message", () => {
    const err = new AppError("UNAUTHENTICATED", "not logged in");
    expect(err.code).toBe("UNAUTHENTICATED");
    expect(err.message).toBe("not logged in");
    expect(err.name).toBe("AppError");
  });

  it("is an instance of Error", () => {
    const err = new AppError("BAD_REQUEST", "bad");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("toErrorMessage", () => {
  it("extracts message from Error instances", () => {
    expect(toErrorMessage(new Error("oops"))).toBe("oops");
  });

  it("returns fallback for non-Error values", () => {
    expect(toErrorMessage("string")).toBe("Unknown error");
    expect(toErrorMessage(42)).toBe("Unknown error");
    expect(toErrorMessage(null)).toBe("Unknown error");
  });
});
