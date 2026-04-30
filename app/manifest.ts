import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Smart Study Platform",
    short_name: "SmartStudy",
    description:
      "AI-powered study platform for summaries, flashcards, and practice questions.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#7c3aed",
    lang: "en-NG",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
