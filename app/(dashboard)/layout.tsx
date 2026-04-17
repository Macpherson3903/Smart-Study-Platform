import type { Metadata } from "next";

import { DashboardShell } from "@/components/shell/DashboardShell";

export const metadata: Metadata = {
  robots: { index: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
