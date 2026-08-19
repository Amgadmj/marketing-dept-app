/**
 * The four primary sections, and how each maps onto today's routes.
 *
 * Compose and Video are content-creation flows that live under a specific
 * brain, not their own top-level pages — so they count as "Campaigns" for
 * nav-highlighting purposes, matching how the source mockups treat them.
 */
export interface NavItem {
  href: string;
  label: string;
  icon: string;
  match: (pathname: string) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Painel",
    icon: "dashboard",
    match: (p) => p === "/",
  },
  {
    href: "/#brains",
    label: "Cérebros",
    icon: "psychology",
    match: (p) => p === "/" || p.startsWith("/brain") || p.startsWith("/intake"),
  },
  {
    href: "/campaigns",
    label: "Campanhas",
    icon: "campaign",
    match: (p) => p.startsWith("/campaigns") || p.startsWith("/compose") || p.startsWith("/video"),
  },
  {
    href: "/settings",
    label: "Configurações",
    icon: "settings",
    match: (p) => p.startsWith("/settings"),
  },
];
