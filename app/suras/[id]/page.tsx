"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { LoadingState } from "@/components/LoadingState";
import { BottomNav } from "@/components/BottomNav";
import { useAppStore } from "@/store/useAppStore";

interface AyahItem {
  id: string;
  ayahNumber: number;
  arabicText: string;
  translationText: string | null;
  globalIndex: number;
}

interface SuraDetail {
  id: number;
  nameRu: string | null;
  nameAr: string | null;
  ayahCount: number;
  ayahs: AyahItem[];
}

export default function SuraDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [sura, setSura] = useState<SuraDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { setReadingContext, translationLanguage } = useAppStore();

  useEffect(() => {
    if (!id) return;
    fetch(
      `/api/suras/${id}?lang=${encodeURIComponent(translationLanguage)}`
    )
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setSura)
      .catch(() => router.push("/suras"))
      .finally(() => setLoading(false));
  }, [id, translationLanguage, router]);

  const name = sura?.nameRu ?? sura?.nameAr ?? `Sura ${id}`;

  return (
    <div className="min-h-screen pb-24">
      <Header title={name} showBack backHref="/suras" />
      <main className="px-5 py-5">
        {loading ? (
          <LoadingState />
        ) : sura ? (
          <ul className="space-y-4">
            {sura.ayahs.map((ayah) => {
              const [suraId] = ayah.id.split(":");
              return (
                <li key={ayah.id}>
                  <Link
                    href={`/ayah/${suraId}/${ayah.ayahNumber}`}
                    onClick={() =>
                      setReadingContext({
                        source: "sura",
                        returnPath: `/suras/${id}`,
                      })
                    }
                    className="block p-5 rounded-3xl bg-tg-secondary-bg/70 border border-tg-hint/10 text-tg-text touch-manipulation active:scale-[0.99] hover:border-tg-hint/20 transition-transform card-elevated"
                  >
                    <span className="text-xs text-tg-hint font-medium">
                      {ayah.ayahNumber}
                    </span>
                    <p
                      className="mt-1.5 text-base leading-relaxed"
                      dir="rtl"
                      style={{
                        fontFamily:
                          "var(--font-arabic), 'Traditional Arabic', serif",
                      }}
                    >
                      {ayah.arabicText}
                    </p>
                    {ayah.translationText && (
                      <p className="mt-1.5 text-sm text-tg-hint line-clamp-2">
                        {ayah.translationText}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </main>
      <BottomNav />
    </div>
  );
}
