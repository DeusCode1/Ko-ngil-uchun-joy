"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getTelegramUserId, DEV_MOCK_USER_ID } from "@/lib/telegram";
import { Header } from "@/components/Header";
import { AyahNavigation } from "@/components/AyahNavigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { LoadingState } from "@/components/LoadingState";
import { TranslationDisclaimer } from "@/components/TranslationDisclaimer";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";
import type { AyahDetailResponse } from "@/types";

export default function AyahDetailPage() {
  const params = useParams();
  const router = useRouter();
  const suraParam = typeof params.sura === "string" ? params.sura : "";
  const ayahParam = typeof params.ayah === "string" ? params.ayah : "";
  const [ayah, setAyah] = useState<AyahDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(false);
  const {
    setCurrentAyah,
    setLastReadAyah,
    readingContext,
    favorites,
    addFavorite,
    removeFavorite,
    translationLanguage,
    appLanguage,
  } = useAppStore();

  const backHref = readingContext?.returnPath ?? "/";
  const backLabel =
    readingContext?.source === "search"
      ? t("toResults", appLanguage)
      : readingContext?.source === "sura"
        ? t("toSura", appLanguage)
        : t("back", appLanguage);

  const isFavorite = ayah ? favorites.some((f) => f.id === ayah.id) : false;

  useEffect(() => {
    const uid = getTelegramUserId() ?? DEV_MOCK_USER_ID;
    fetch(
      `/api/user/favorites?telegramUserId=${encodeURIComponent(uid)}&lang=${encodeURIComponent(translationLanguage)}`
    )
      .then((r) => r.json())
      .then((data) => useAppStore.getState().setFavorites(data.favorites ?? []))
      .catch(() => {});
  }, [translationLanguage]);

  useEffect(() => {
    if (!suraParam || !ayahParam) return;
    fetch(
      `/api/ayah/${suraParam}/${ayahParam}?lang=${encodeURIComponent(translationLanguage)}`
    )
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setAyah(data);
        setCurrentAyah(data);
        setLastReadAyah(data);
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [suraParam, ayahParam, translationLanguage, router, setCurrentAyah, setLastReadAyah]);

  useEffect(() => {
    if (!ayah) return;
    const uid = getTelegramUserId() ?? DEV_MOCK_USER_ID;
    fetch("/api/user/last-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramUserId: uid, ayahId: ayah.id }),
    }).catch(console.error);
  }, [ayah?.id]);

  const handleToggleFavorite = async () => {
    if (!ayah) return;
    const uid = getTelegramUserId() ?? DEV_MOCK_USER_ID;
    setFavLoading(true);
    try {
      const res = await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramUserId: uid, ayahId: ayah.id }),
      });
      const data = await res.json();
      if (data.added) {
        addFavorite(ayah);
      } else {
        removeFavorite(ayah.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFavLoading(false);
    }
  };

  if (loading || !ayah) {
    return (
      <div className="min-h-screen">
        <Header title={t("ayah", appLanguage)} showBack backHref={backHref} />
        <LoadingState />
      </div>
    );
  }

  const suraName = ayah.sura?.nameRu ?? ayah.sura?.nameAr ?? `${t("surah", appLanguage)} ${ayah.suraId}`;

  return (
    <div className="min-h-screen pb-28">
      <Header
        title={`${suraName} • ${ayah.ayahNumber}`}
        showBack
        backHref={backHref}
      />
      <main className="px-5 py-5">
        <article className="rounded-3xl bg-tg-secondary-bg/70 border border-tg-hint/10 overflow-hidden card-elevated">
          <div className="p-6">
            <p
              className="text-tg-text text-[1.35rem] leading-loose"
              dir="rtl"
              style={{
                fontFamily:
                  "var(--font-arabic), 'Traditional Arabic', 'Scheherazade New', serif",
              }}
            >
              {ayah.arabicText}
            </p>
            {ayah.translationText && (
              <>
                <p className="mt-5 text-tg-hint text-[15px] leading-relaxed border-t border-tg-hint/20 pt-5">
                  {ayah.translationText}
                </p>
                <TranslationDisclaimer />
              </>
            )}
          </div>
        </article>

        <div className="mt-6 space-y-4">
          <AyahNavigation
            prev={ayah.prev}
            next={ayah.next}
            backHref={backHref}
            backLabel={backLabel}
          />
          <div className="flex gap-3">
            <FavoriteButton
              isFavorite={isFavorite}
              onToggle={handleToggleFavorite}
              loading={favLoading}
            />
            <Link
              href="/search"
              className="flex-1 py-3.5 px-4 rounded-2xl bg-tg-secondary-bg/80 border border-tg-hint/10 text-tg-text text-center text-sm font-medium touch-manipulation hover:border-tg-hint/20 transition-colors"
            >
              {t("toSearch", appLanguage)}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
