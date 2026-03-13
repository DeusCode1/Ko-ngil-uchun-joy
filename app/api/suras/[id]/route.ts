import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAyahTexts } from "@/lib/ayah-text";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id, 10);
  const lang = req.nextUrl.searchParams.get("lang") ?? "ru";
  if (Number.isNaN(id) || id < 1 || id > 114) {
    return NextResponse.json({ error: "Invalid sura id" }, { status: 400 });
  }
  try {
    const sura = await prisma.sura.findUnique({
      where: { id },
      include: {
        ayahs: {
          orderBy: { ayahNumber: "asc" },
          include: {
            texts: { select: { languageCode: true, text: true } },
          },
        },
      },
    });
    if (!sura) {
      return NextResponse.json({ error: "Sura not found" }, { status: 404 });
    }

    const ayahs = sura.ayahs.map((a) => {
      const { arabicText, translationText } = getAyahTexts(a.texts, lang);
      return {
        id: a.id,
        ayahNumber: a.ayahNumber,
        globalIndex: a.globalIndex,
        arabicText,
        translationText,
      };
    });

    return NextResponse.json({
      id: sura.id,
      nameRu: sura.nameRu,
      nameAr: sura.nameAr,
      ayahCount: sura.ayahCount,
      ayahs,
    });
  } catch (e) {
    console.error("GET /api/suras/:id", e);
    return NextResponse.json(
      { error: "Failed to fetch sura" },
      { status: 500 }
    );
  }
}
