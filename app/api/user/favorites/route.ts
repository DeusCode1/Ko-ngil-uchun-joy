import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAyahTexts } from "@/lib/ayah-text";

export async function GET(req: NextRequest) {
  const telegramUserId = req.nextUrl.searchParams.get("telegramUserId");
  const lang = req.nextUrl.searchParams.get("lang") ?? "ru";
  if (!telegramUserId) {
    return NextResponse.json(
      { error: "telegramUserId required" },
      { status: 400 }
    );
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { telegramUserId },
      orderBy: { createdAt: "desc" },
      include: {
        ayah: {
          include: {
            sura: {
              select: { id: true, nameRu: true, nameAr: true, ayahCount: true },
            },
            texts: { select: { languageCode: true, text: true } },
          },
        },
      },
    });
    const list = favorites.map((f) => {
      const a = f.ayah;
      const { arabicText, translationText } = getAyahTexts(a.texts, lang);
      return {
        id: a.id,
        suraId: a.suraId,
        ayahNumber: a.ayahNumber,
        globalIndex: a.globalIndex,
        arabicText,
        translationText,
        sura: a.sura,
      };
    });
    return NextResponse.json({ favorites: list });
  } catch (e) {
    console.error("GET /api/user/favorites", e);
    return NextResponse.json(
      { error: "Failed to get favorites" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: { telegramUserId: string; ayahId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { telegramUserId, ayahId } = body;
  if (!telegramUserId || !ayahId) {
    return NextResponse.json(
      { error: "telegramUserId and ayahId required" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        telegramUserId_ayahId: { telegramUserId, ayahId },
      },
    });
    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ added: false, ok: true });
    }
    await prisma.favorite.create({
      data: { telegramUserId, ayahId },
    });
    return NextResponse.json({ added: true, ok: true });
  } catch (e) {
    console.error("POST /api/user/favorites", e);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}
