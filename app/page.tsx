"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTelegramUserId, DEV_MOCK_USER_ID } from "@/lib/telegram";
import { useAppStore } from "@/store/useAppStore";
import { AyahCard } from "@/components/AyahCard";
import { LoadingState } from "@/components/LoadingState";
import { BottomNav } from "@/components/BottomNav";
import { AppLanguageBlock } from "@/components/AppLanguageBlock";
import { AppFooter } from "@/components/AppFooter";
import { t } from "@/lib/i18n";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const { lastReadAyah, setLastReadAyah, translationLanguage, appLanguage } =
    useAppStore();

  useEffect(() => {
    const uid = getTelegramUserId() ?? DEV_MOCK_USER_ID;
    fetch(
      `/api/user/last-read?telegramUserId=${encodeURIComponent(uid)}&lang=${encodeURIComponent(translationLanguage)}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.ayah) setLastReadAyah(data.ayah);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [setLastReadAyah, translationLanguage]);

  return (
    <div className="min-h-screen pb-24">
      <header className="px-5 pt-7 pb-5">
        <h1 className="text-2xl font-bold text-tg-text tracking-tight">
          {t("appTitle", appLanguage)}
        </h1>
        <p className="text-sm text-tg-hint mt-1.5">
          {t("appSubtitle", appLanguage)}
        </p>
      </header>

      <main className="px-5 space-y-8">
        <AppLanguageBlock />

        {loading ? (
          <LoadingState />
        ) : lastReadAyah ? (
          <section>
            <h2 className="text-xs font-semibold text-tg-hint mb-3 uppercase tracking-wider">
              {t("continueReading", appLanguage)}
            </h2>
            <Link
              href={`/ayah/${lastReadAyah.suraId}/${lastReadAyah.ayahNumber}`}
              onClick={() =>
                useAppStore.getState().setReadingContext({
                  source: "home",
                  returnPath: "/",
                })
              }
            >
              <AyahCard
                ayah={lastReadAyah}
                showSuraName
                showTranslation
              />
            </Link>
          </section>
        ) : (
          <section>
            <h2 className="text-xs font-semibold text-tg-hint mb-3 uppercase tracking-wider">
              {t("continueReading", appLanguage)}
            </h2>
            <p className="text-tg-hint text-sm py-5 leading-relaxed">
              {t("noLastRead", appLanguage)}
            </p>
          </section>
        )}

        <nav className="grid gap-3">
          <Link
            href="/search"
            className="block py-4 px-5 rounded-3xl bg-tg-secondary-bg/70 border border-tg-hint/10 text-tg-text font-medium touch-manipulation active:scale-[0.98] transition-transform hover:border-tg-hint/20"
          >
            🔍 {t("search", appLanguage)}
          </Link>
          <Link
            href="/suras"
            className="block py-4 px-5 rounded-3xl bg-tg-secondary-bg/70 border border-tg-hint/10 text-tg-text font-medium touch-manipulation active:scale-[0.98] transition-transform hover:border-tg-hint/20"
          >
            📖 {t("suras", appLanguage)}
          </Link>
          <Link
            href="/favorites"
            className="block py-4 px-5 rounded-3xl bg-tg-secondary-bg/70 border border-tg-hint/10 text-tg-text font-medium touch-manipulation active:scale-[0.98] transition-transform hover:border-tg-hint/20"
          >
            ★ {t("favorites", appLanguage)}
          </Link>
        </nav>

        <AppFooter />
      </main>

      <BottomNav />
    </div>
  );
}
