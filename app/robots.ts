import type { MetadataRoute } from "next";

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url && url.length > 0) return url.replace(/\/$/, "");
  return "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/sign-in", "/sign-up", "/privacy", "/terms"],
        // Dashboard surfaces are per-user and already set `robots: { index: false }`
        // via their layout metadata. Duplicating the rule here makes intent
        // explicit for crawlers that ignore meta tags.
        disallow: [
          "/dashboard",
          "/sessions",
          "/flashcards",
          "/settings",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
