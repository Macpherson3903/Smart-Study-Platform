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
    "AI-powered system that transforms raw academic content into structured learning materials.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "Smart Study Platform",
    description:
      "Transform raw academic content into structured learning materials in seconds.",
    type: "website",
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
