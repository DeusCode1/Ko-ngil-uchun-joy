"use client";

import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";

const TANZIL_URL = "https://tanzil.net/trans/";

export function TranslationDisclaimer() {
  const appLanguage = useAppStore((s) => s.appLanguage);

  return (
    <div className="mt-4 pt-4 border-t border-tg-hint/15">
      <p className="text-[11px] text-tg-hint leading-relaxed">
        {t("disclaimer", appLanguage)}
      </p>
      <a
        href={TANZIL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 text-xs text-tg-link font-medium hover:underline"
      >
        {t("tanzilLink", appLanguage)} →
      </a>
    </div>
  );
}
