"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";

interface NavTarget {
  id: string;
  suraId: number;
  ayahNumber: number;
}

interface AyahNavigationProps {
  prev: NavTarget | null;
  next: NavTarget | null;
  backHref?: string;
  backLabel?: string;
}

export function AyahNavigation({
  prev,
  next,
  backHref = "/",
  backLabel,
}: AyahNavigationProps) {
  const appLanguage = useAppStore((s) => s.appLanguage);
  const label = backLabel ?? t("back", appLanguage);

  return (
    <nav
      className="flex flex-wrap gap-3"
      aria-label="Ayah navigation"
    >
      {prev ? (
        <Link
          href={`/ayah/${prev.suraId}/${prev.ayahNumber}`}
          className="flex-1 min-w-[100px] py-3.5 px-4 rounded-2xl bg-tg-button text-tg-button-text text-center text-sm font-medium touch-manipulation active:opacity-90"
        >
          ← {t("previous", appLanguage)}
        </Link>
      ) : (
        <span className="flex-1 min-w-[100px] py-3.5 px-4 rounded-2xl bg-tg-secondary-bg/50 text-tg-hint text-center text-sm">
          —
        </span>
      )}
      <Link
        href={backHref}
        className="flex-1 min-w-[80px] py-3.5 px-4 rounded-2xl bg-tg-secondary-bg/80 border border-tg-hint/10 text-tg-text text-center text-sm font-medium touch-manipulation"
      >
        {label}
      </Link>
      {next ? (
        <Link
          href={`/ayah/${next.suraId}/${next.ayahNumber}`}
          className="flex-1 min-w-[100px] py-3.5 px-4 rounded-2xl bg-tg-button text-tg-button-text text-center text-sm font-medium touch-manipulation active:opacity-90"
        >
          {t("next", appLanguage)} →
        </Link>
      ) : (
        <span className="flex-1 min-w-[100px] py-3.5 px-4 rounded-2xl bg-tg-secondary-bg/50 text-tg-hint text-center text-sm">
          —
        </span>
      )}
    </nav>
  );
}
