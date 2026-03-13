"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { SuraListItem } from "@/components/SuraListItem";
import { LoadingState } from "@/components/LoadingState";
import { BottomNav } from "@/components/BottomNav";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";

interface Sura {
  id: number;
  nameRu: string | null;
  nameAr: string | null;
  ayahCount: number;
}

export default function SurasPage() {
  const [suras, setSuras] = useState<Sura[]>([]);
  const [loading, setLoading] = useState(true);
  const appLanguage = useAppStore((s) => s.appLanguage);

  useEffect(() => {
    fetch("/api/suras")
      .then((r) => r.json())
      .then(setSuras)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-24">
      <Header title={t("suras", appLanguage)} showBack backHref="/" />
      <main className="px-5 py-5">
        {loading ? (
          <LoadingState />
        ) : (
          <ul className="space-y-4">
            {suras.map((sura) => (
              <li key={sura.id}>
                <SuraListItem sura={sura} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
