import "server-only";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  MONGODB_URI: () => requireEnv("MONGODB_URI"),
  MONGODB_DB: () => process.env.MONGODB_DB ?? "smart-study",
  GEMINI_API_KEY: () => requireEnv("GEMINI_API_KEY"),
  GEMINI_MODEL: () =>
    process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite-preview",
} as const;
