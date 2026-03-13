"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";

interface Sura {
  id: number;
  nameRu: string | null;
  nameAr: string | null;
  ayahCount: number;
}

interface SuraListItemProps {
  sura: Sura;
}

export function SuraListItem({ sura }: SuraListItemProps) {
  const appLanguage = useAppStore((s) => s.appLanguage);
  const name = sura.nameRu ?? sura.nameAr ?? `${t("surah", appLanguage)} ${sura.id}`;
  return (
    <Link
      href={`/suras/${sura.id}`}
      className="flex items-center gap-4 p-4 rounded-3xl bg-tg-secondary-bg/70 border border-tg-hint/10 text-tg-text touch-manipulation active:scale-[0.99] transition-transform hover:border-tg-hint/20 card-elevated"
    >
      <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-tg-button text-tg-button-text flex items-center justify-center font-semibold text-sm">
        {sura.id}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{name}</div>
        <div className="text-xs text-tg-hint mt-0.5">
          {sura.ayahCount} {t("ayahsCount", appLanguage)}
        </div>
      </div>
      <span className="text-tg-hint text-lg">→</span>
    </Link>
  );
}
