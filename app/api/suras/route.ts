import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const suras = await prisma.sura.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        nameRu: true,
        nameAr: true,
        ayahCount: true,
      },
    });
    return NextResponse.json(suras);
  } catch (e) {
    console.error("GET /api/suras", e);
    return NextResponse.json(
      { error: "Failed to fetch suras" },
      { status: 500 }
    );
  }
}
