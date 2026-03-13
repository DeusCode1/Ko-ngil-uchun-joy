"use client";

import { useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  loading?: boolean;
}

export function FavoriteButton({
  isFavorite,
  onToggle,
  loading,
}: FavoriteButtonProps) {
  const appLanguage = useAppStore((s) => s.appLanguage);

  const handleClick = useCallback(() => {
    if (!loading) onToggle();
  }, [onToggle, loading]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-tg-secondary-bg/80 border border-tg-hint/10 text-tg-text text-sm font-medium touch-manipulation disabled:opacity-50"
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {loading ? (
        <span className="text-tg-hint">...</span>
      ) : isFavorite ? (
        <>★ {t("inFavorites", appLanguage)}</>
      ) : (
        <>☆ {t("addToFavorites", appLanguage)}</>
      )}
    </button>
  );
}
