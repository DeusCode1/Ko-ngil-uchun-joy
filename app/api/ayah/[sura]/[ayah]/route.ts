import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAyahTexts } from "@/lib/ayah-text";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sura: string; ayah: string }> }
) {
  const { sura: suraParam, ayah: ayahParam } = await params;
  const lang = req.nextUrl.searchParams.get("lang") ?? "ru";
  const suraId = parseInt(suraParam, 10);
  const ayahNumber = parseInt(ayahParam, 10);
  if (
    Number.isNaN(suraId) ||
    Number.isNaN(ayahNumber) ||
    suraId < 1 ||
    ayahNumber < 1
  ) {
    return NextResponse.json(
      { error: "Invalid sura or ayah" },
      { status: 400 }
    );
  }

  const ayahId = `${suraId}:${ayahNumber}`;

  try {
    const ayah = await prisma.ayah.findUnique({
      where: { id: ayahId },
      include: {
        sura: {
          select: { id: true, nameRu: true, nameAr: true, ayahCount: true },
        },
        texts: { select: { languageCode: true, text: true } },
      },
    });

    if (!ayah) {
      return NextResponse.json({ error: "Ayah not found" }, { status: 404 });
    }

    const { arabicText, translationText } = getAyahTexts(ayah.texts, lang);

    const prev = await prisma.ayah.findFirst({
      where: { globalIndex: ayah.globalIndex - 1 },
      select: { id: true, suraId: true, ayahNumber: true },
    });

    const next = await prisma.ayah.findFirst({
      where: { globalIndex: ayah.globalIndex + 1 },
      select: { id: true, suraId: true, ayahNumber: true },
    });

    return NextResponse.json({
      id: ayah.id,
      suraId: ayah.suraId,
      ayahNumber: ayah.ayahNumber,
      globalIndex: ayah.globalIndex,
      arabicText,
      translationText,
      sura: ayah.sura,
      prev,
      next,
    });
  } catch (e) {
    console.error("GET /api/ayah/:sura/:ayah", e);
    return NextResponse.json(
      { error: "Failed to fetch ayah" },
      { status: 500 }
    );
  }
}
