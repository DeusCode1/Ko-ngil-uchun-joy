"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { t, langLabels, transLabels } from "@/lib/i18n";
import type { AppLanguage, TranslationLanguage } from "@/types";

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"app" | "trans">("app");
  const ref = useRef<HTMLDivElement>(null);
  const { appLanguage, translationLanguage, setAppLanguage, setTranslationLanguage } =
    useAppStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-tg-hint hover:bg-tg-secondary-bg/80 text-sm font-medium touch-manipulation"
        aria-label="Language"
      >
        <span className="w-5 h-5 rounded border border-current flex items-center justify-center text-xs">
          Aa
        </span>
        <span className="max-w-[4rem] truncate">
          {tab === "app" ? langLabels[appLanguage] : transLabels[translationLanguage]}
        </span>
        <span className="text-tg-hint">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-tg-secondary-bg border border-tg-hint/15 shadow-lg z-50 overflow-hidden card-elevated">
          <div className="flex border-b border-tg-hint/20">
            <button
              type="button"
              onClick={() => setTab("app")}
              className={`flex-1 py-2.5 text-sm font-medium ${
                tab === "app" ? "text-tg-button bg-tg-bg" : "text-tg-hint"
              }`}
            >
              {t("language", appLanguage)}
            </button>
            <button
              type="button"
              onClick={() => setTab("trans")}
              className={`flex-1 py-2.5 text-sm font-medium ${
                tab === "trans" ? "text-tg-button bg-tg-bg" : "text-tg-hint"
              }`}
            >
              {t("translation", appLanguage)}
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {tab === "app" &&
              (["ru", "uz", "tr", "ar"] as AppLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setAppLanguage(lang);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm touch-manipulation ${
                    appLanguage === lang
                      ? "bg-tg-button text-tg-button-text"
                      : "text-tg-text hover:bg-tg-bg"
                  }`}
                >
                  {langLabels[lang]}
                </button>
              ))}
            {tab === "trans" &&
              (["ar", "ru", "uz", "tr"] as TranslationLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setTranslationLanguage(lang);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm touch-manipulation ${
                    translationLanguage === lang
                      ? "bg-tg-button text-tg-button-text"
                      : "text-tg-text hover:bg-tg-bg"
                  }`}
                >
                  {transLabels[lang]}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
