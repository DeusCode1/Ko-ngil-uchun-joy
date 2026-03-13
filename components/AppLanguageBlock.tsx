"use client";

import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";
import type { AppLanguage } from "@/types";

const LANG_OPTIONS: { lang: AppLanguage; label: string }[] = [
  { lang: "ru", label: "Русский" },
  { lang: "uz", label: "O'zbek" },
  { lang: "tr", label: "Türkçe" },
  { lang: "ar", label: "العربية" },
];

export function AppLanguageBlock() {
  const appLanguage = useAppStore((s) => s.appLanguage);
  const setAppLanguage = useAppStore((s) => s.setAppLanguage);

  return (
    <section className="rounded-3xl bg-tg-secondary-bg/60 border border-tg-hint/10 p-4">
      <p className="text-xs font-medium text-tg-hint uppercase tracking-wider mb-3">
        {t("language", appLanguage)}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {LANG_OPTIONS.map(({ lang, label }) => (
          <button
            key={lang}
            type="button"
            onClick={() => setAppLanguage(lang)}
            className={`py-3 px-4 rounded-2xl text-sm font-medium touch-manipulation transition-all ${
              appLanguage === lang
                ? "bg-tg-button text-tg-button-text shadow-sm"
                : "bg-tg-bg/80 text-tg-text border border-tg-hint/15 hover:border-tg-hint/30 active:opacity-90"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-tg-hint leading-snug">
        {t("translationLangHint", appLanguage)}
      </p>
    </section>
  );
}
