"use client";

import { useCallback, useEffect } from "react";
import { Header } from "@/components/Header";
import { SearchInput } from "@/components/SearchInput";
import { AyahCard } from "@/components/AyahCard";
import { EmptyState } from "@/components/EmptyState";
import { BottomNav } from "@/components/BottomNav";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";
import type { SearchResultItem } from "@/types";

function mapToAyahWithSura(item: SearchResultItem) {
  return {
    id: item.id,
    suraId: item.suraId,
    ayahNumber: item.ayahNumber,
    arabicText: item.arabicText,
    translationText: item.translationText,
    globalIndex: 0,
    sura: item.sura
      ? {
          id: item.suraId,
          nameRu: item.sura.nameRu ?? null,
          nameAr: item.sura.nameAr ?? null,
          ayahCount: 0,
        }
      : undefined,
  };
}

export default function SearchPage() {
  const {
    searchQuery,
    searchResults,
    setSearchQuery,
    setSearchResults,
    setReadingContext,
    translationLanguage,
    appLanguage,
  } = useAppStore();

  const runSearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setSearchResults([]);
        return;
      }
      fetch(
        `/api/search?q=${encodeURIComponent(q)}&lang=${encodeURIComponent(translationLanguage)}`
      )
        .then((r) => r.json())
        .then((data) => setSearchResults(data.results ?? []))
        .catch(console.error);
    },
    [setSearchResults, translationLanguage]
  );

  useEffect(() => {
    setReadingContext({ source: "search", returnPath: "/search" });
  }, [setReadingContext]);

  return (
    <div className="min-h-screen pb-24">
      <Header title={t("search", appLanguage)} showBack backHref="/" />
      <main className="px-5 py-5 space-y-5">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={runSearch}
        />
        {searchResults.length > 0 ? (
          <ul className="space-y-4">
            {searchResults.map((item) => (
              <li key={item.id}>
                <AyahCard
                  ayah={mapToAyahWithSura(item)}
                  showSuraName
                  showTranslation
                  compact
                  onClick={() =>
                    setReadingContext({
                      source: "search",
                      returnPath: "/search",
                    })
                  }
                />
              </li>
            ))}
          </ul>
        ) : searchQuery.trim() ? (
          <EmptyState
            title={t("noResults", appLanguage)}
            description={t("searchHint", appLanguage)}
          />
        ) : (
          <EmptyState
            title={t("enterQuery", appLanguage)}
            description={t("searchHint", appLanguage)}
          />
        )}
      </main>
      <BottomNav />
    </div>
  );
}
