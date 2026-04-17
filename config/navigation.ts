export type NavItem = {
  label: string;
  href: string;
  /**
   * Optional identifier for matching nested routes.
   * Example: id="sessions" matches "/sessions" and "/sessions/new".
   */
  id: string;
  disabled?: boolean;
};

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "new", label: "New Session", href: "/sessions/new" },
  { id: "sessions", label: "History", href: "/sessions" },
  { id: "flashcards", label: "Flashcards", href: "/flashcards" },
  { id: "settings", label: "Settings", href: "/settings" },
];
