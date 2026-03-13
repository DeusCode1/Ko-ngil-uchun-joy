import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAyahTexts } from "@/lib/ayah-text";

const SEARCH_LIMIT = 50;

function parseAyahReference(q: string): { suraId: number; ayahNumber: number } | null {
  const trimmed = q.trim();
  const colon = /^(\d+):(\d+)$/.exec(trimmed);
  if (colon) {
    const suraId = parseInt(colon[1]!, 10);
    const ayahNumber = parseInt(colon[2]!, 10);
    if (suraId >= 1 && suraId <= 114 && ayahNumber >= 1) return { suraId, ayahNumber };
  }
  const dot = /^(\d+)\.(\d+)$/.exec(trimmed);
  if (dot) {
    const suraId = parseInt(dot[1]!, 10);
    const ayahNumber = parseInt(dot[2]!, 10);
    if (suraId >= 1 && suraId <= 114 && ayahNumber >= 1) return { suraId, ayahNumber };
  }
  const space = /^(\d+)\s+(\d+)$/.exec(trimmed);
  if (space) {
    const suraId = parseInt(space[1]!, 10);
    const ayahNumber = parseInt(space[2]!, 10);
    if (suraId >= 1 && suraId <= 114 && ayahNumber >= 1) return { suraId, ayahNumber };
  }
  const suraAyah = /sura\s*(\d+)\s*aya?t?\s*(\d+)/i.exec(trimmed);
  if (suraAyah) {
    const suraId = parseInt(suraAyah[1]!, 10);
    const ayahNumber = parseInt(suraAyah[2]!, 10);
    if (suraId >= 1 && suraId <= 114 && ayahNumber >= 1) return { suraId, ayahNumber };
  }
  return null;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const lang = req.nextUrl.searchParams.get("lang") ?? "ru";
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    const ref = parseAyahReference(q);
    if (ref) {
      const ayahId = `${ref.suraId}:${ref.ayahNumber}`;
      const ayah = await prisma.ayah.findUnique({
        where: { id: ayahId },
        include: {
          sura: { select: { nameRu: true, nameAr: true } },
          texts: { select: { languageCode: true, text: true } },
        },
      });
      if (ayah) {
        const { arabicText, translationText } = getAyahTexts(ayah.texts, lang);
        return NextResponse.json({
          results: [
            {
              id: ayah.id,
              suraId: ayah.suraId,
              ayahNumber: ayah.ayahNumber,
              arabicText,
              translationText,
              sura: ayah.sura,
            },
          ],
        });
      }
      return NextResponse.json({ results: [] });
    }

    const suraOnly = /^(\d+)$/.exec(q);
    if (suraOnly) {
      const suraId = parseInt(suraOnly[1]!, 10);
      if (suraId >= 1 && suraId <= 114) {
        const ayahs = await prisma.ayah.findMany({
          where: { suraId },
          orderBy: { ayahNumber: "asc" },
          take: SEARCH_LIMIT,
          include: {
            sura: { select: { nameRu: true, nameAr: true } },
            texts: { select: { languageCode: true, text: true } },
          },
        });
        const results = ayahs.map((a) => {
          const { arabicText, translationText } = getAyahTexts(a.texts, lang);
          return {
            id: a.id,
            suraId: a.suraId,
            ayahNumber: a.ayahNumber,
            arabicText,
            translationText,
            sura: a.sura,
          };
        });
        return NextResponse.json({ results });
      }
    }

    const searchLangs = lang === "ar" ? ["ar"] : ["ar", lang];
    const textRows = await prisma.ayahText.findMany({
      where: {
        languageCode: { in: searchLangs },
        text: { contains: q },
      },
      take: SEARCH_LIMIT * 2,
      include: {
        ayah: {
          include: {
            sura: { select: { nameRu: true, nameAr: true } },
            texts: { select: { languageCode: true, text: true } },
          },
        },
      },
    });

    const seen = new Set<string>();
    const results: {
      id: string;
      suraId: number;
      ayahNumber: number;
      arabicText: string;
      translationText: string | null;
      sura: { nameRu: string | null; nameAr: string | null };
    }[] = [];
    for (const row of textRows) {
      if (results.length >= SEARCH_LIMIT) break;
      const ayahId = row.ayah.id;
      if (seen.has(ayahId)) continue;
      seen.add(ayahId);
      const { arabicText, translationText } = getAyahTexts(row.ayah.texts, lang);
      results.push({
        id: ayahId,
        suraId: row.ayah.suraId,
        ayahNumber: row.ayah.ayahNumber,
        arabicText,
        translationText,
        sura: row.ayah.sura,
      });
    }
    results.sort((a, b) => a.suraId - b.suraId || a.ayahNumber - b.ayahNumber);
    return NextResponse.json({ results });
  } catch (e) {
    console.error("GET /api/search", e);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
