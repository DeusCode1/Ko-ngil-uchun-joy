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
    const state = await prisma.userState.findUnique({
      where: { telegramUserId },
    });
    if (!state?.lastReadAyahId) {
      return NextResponse.json({ ayah: null });
    }
    const ayah = await prisma.ayah.findUnique({
      where: { id: state.lastReadAyahId },
      include: {
        sura: {
          select: { id: true, nameRu: true, nameAr: true, ayahCount: true },
        },
        texts: { select: { languageCode: true, text: true } },
      },
    });
    if (!ayah) return NextResponse.json({ ayah: null });
    const { arabicText, translationText } = getAyahTexts(ayah.texts, lang);
    return NextResponse.json({
      ayah: {
        id: ayah.id,
        suraId: ayah.suraId,
        ayahNumber: ayah.ayahNumber,
        globalIndex: ayah.globalIndex,
        arabicText,
        translationText,
        sura: ayah.sura,
      },
    });
  } catch (e) {
    console.error("GET /api/user/last-read", e);
    return NextResponse.json(
      { error: "Failed to get last read" },
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
    await prisma.userState.upsert({
      where: { telegramUserId },
      create: { telegramUserId, lastReadAyahId: ayahId },
      update: { lastReadAyahId: ayahId },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/user/last-read", e);
    return NextResponse.json(
      { error: "Failed to save last read" },
      { status: 500 }
    );
  }
}
