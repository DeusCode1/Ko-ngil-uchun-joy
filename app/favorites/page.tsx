"use client";

import { useEffect, useState } from "react";
import { getTelegramUserId, DEV_MOCK_USER_ID } from "@/lib/telegram";
import { Header } from "@/components/Header";
import { AyahCard } from "@/components/AyahCard";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { BottomNav } from "@/components/BottomNav";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";
import Link from "next/link";

export default function FavoritesPage() {
  const { favorites, setFavorites, setReadingContext, translationLanguage, appLanguage } =
    useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getTelegramUserId() ?? DEV_MOCK_USER_ID;
    fetch(
      `/api/user/favorites?telegramUserId=${encodeURIComponent(uid)}&lang=${encodeURIComponent(translationLanguage)}`
    )
      .then((r) => r.json())
      .then((data) => setFavorites(data.favorites ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [setFavorites, translationLanguage]);

  useEffect(() => {
    setReadingContext({ source: "favorites", returnPath: "/favorites" });
  }, [setReadingContext]);

  return (
    <div className="min-h-screen pb-24">
      <Header title={t("favorites", appLanguage)} showBack backHref="/" />
      <main className="px-5 py-5">
        {loading ? (
          <LoadingState />
        ) : favorites.length === 0 ? (
          <EmptyState
            title={t("noFavorites", appLanguage)}
            description={t("noFavoritesHint", appLanguage)}
            action={
              <Link href="/search" className="text-tg-link font-medium text-sm hover:underline">
                {t("goToSearch", appLanguage)}
              </Link>
            }
          />
        ) : (
          <ul className="space-y-4">
            {favorites.map((ayah) => (
              <li key={ayah.id}>
                <Link
                  href={`/ayah/${ayah.suraId}/${ayah.ayahNumber}`}
                  onClick={() =>
                    setReadingContext({
                      source: "favorites",
                      returnPath: "/favorites",
                    })
                  }
                >
                  <AyahCard ayah={ayah} showSuraName showTranslation />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
