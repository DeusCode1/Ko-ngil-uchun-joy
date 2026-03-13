"use client";

import Link from "next/link";
import type { AyahWithSura } from "@/types";

interface AyahCardProps {
  ayah: AyahWithSura;
  showSuraName?: boolean;
  showTranslation?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export function AyahCard({
  ayah,
  showSuraName = true,
  showTranslation = true,
  compact,
  onClick,
}: AyahCardProps) {
  const [suraId, ayahNumber] = ayah.id.split(":").map(Number);
  const suraName = ayah.sura?.nameRu ?? ayah.sura?.nameAr ?? `Sura ${suraId}`;

  return (
    <Link
      href={`/ayah/${suraId}/${ayahNumber}`}
      onClick={onClick}
      className="block rounded-3xl bg-tg-secondary-bg/70 border border-tg-hint/10 overflow-hidden touch-manipulation active:scale-[0.99] transition-transform hover:border-tg-hint/20 card-elevated"
    >
      <div className="p-5">
        {showSuraName && (
          <div className="text-xs font-semibold text-tg-hint mb-2.5 tracking-wide">
            {suraName} • {ayahNumber}
          </div>
        )}
        <p
          className={`text-tg-text leading-relaxed ${
            compact ? "text-sm line-clamp-2" : "text-base"
          }`}
          dir="rtl"
          style={{ fontFamily: "var(--font-arabic), 'Traditional Arabic', serif" }}
        >
          {ayah.arabicText}
        </p>
        {showTranslation && ayah.translationText && (
          <p
            className={`mt-2.5 text-tg-hint ${compact ? "text-xs line-clamp-2" : "text-sm"} leading-relaxed`}
          >
            {ayah.translationText}
          </p>
        )}
      </div>
    </Link>
  );
}
