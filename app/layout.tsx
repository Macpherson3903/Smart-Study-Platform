import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { Toaster } from "@/components/ui/Toaster";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Smart Study Platform",
    template: "%s | Smart Study Platform",
  },
  description:
    "Smart Study Platform helps Nigerian students and working professionals turn long academic text into summaries, flashcards, and practice questions.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://smartstudyplatform.vercel.app",
  ),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "AI study tool Nigeria",
    "study app for working students",
    "exam prep Nigeria",
    "flashcards and practice questions",
    "Smart Study Platform",
  ],
  category: "education",
  openGraph: {
    title: "Smart Study Platform",
    description:
      "AI-powered study support for busy learners in Nigeria: summaries, flashcards, and practice questions.",
    type: "website",
    url: "https://smartstudyplatform.vercel.app",
    siteName: "Smart Study Platform",
    locale: "en_NG",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Smart Study Platform preview image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Study Platform",
    description:
      "Study faster with AI summaries, flashcards, and practice questions.",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className="min-h-dvh bg-slate-50 text-slate-900 antialiased"
        >
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
