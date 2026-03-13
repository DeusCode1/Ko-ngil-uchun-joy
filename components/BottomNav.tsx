"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";

const items = [
  { href: "/", key: "home" as const, icon: "⌂" },
  { href: "/search", key: "search" as const, icon: "🔍" },
  { href: "/suras", key: "suras" as const, icon: "📖" },
  { href: "/favorites", key: "favorites" as const, icon: "★" },
];

export function BottomNav() {
  const pathname = usePathname();
  const appLanguage = useAppStore((s) => s.appLanguage);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 bg-tg-bg/98 backdrop-blur-md border-t border-tg-hint/10 safe-bottom"
      aria-label="Main menu"
    >
      <div className="flex justify-around items-stretch px-2 py-2">
        {items.map(({ href, key, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-2xl touch-manipulation transition-colors min-w-0 ${
              isActive(href)
                ? "text-tg-button bg-tg-secondary-bg/80"
                : "text-tg-hint hover:text-tg-text hover:bg-tg-secondary-bg/40"
            }`}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="text-[11px] font-medium truncate w-full text-center">
              {t(key, appLanguage)}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
