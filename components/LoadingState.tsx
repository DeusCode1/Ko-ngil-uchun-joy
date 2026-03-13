"use client";

import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";

export function LoadingState() {
  const appLanguage = useAppStore((s) => s.appLanguage);
  return (
    <div className="flex flex-col items-center justify-center py-14 px-5">
      <div className="w-10 h-10 border-2 border-tg-button border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-sm text-tg-hint">{t("loading", appLanguage)}</p>
    </div>
  );
}
