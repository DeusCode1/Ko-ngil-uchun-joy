/**
 * Import Arabic Quran text.
 * Format: one line per ayah: sura|ayah|text
 *
 * Usage: npm run import:quran -- --file=./data/quran.txt
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MAX_LINE_LENGTH = 100_000;
const DELIMITER = "|";

function getFileArg(): string {
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--file=")) {
      const file = arg.slice("--file=".length).trim();
      const p = resolve(process.cwd(), file);
      if (existsSync(p)) return p;
      console.error(`File not found: ${p}`);
      process.exit(1);
    }
  }
  console.error("Usage: npm run import:quran -- --file=./data/quran.txt");
  process.exit(1);
}

interface ParsedLine {
  sura: number;
  ayah: number;
  text: string;
  lineNumber: number;
}

function parseLine(line: string, lineNumber: number): ParsedLine | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(DELIMITER);
  if (parts.length < 3) {
    console.warn(
      `[Line ${lineNumber}] Invalid format (expected sura|ayah|text): ${trimmed.slice(0, 80)}...`
    );
    return null;
  }

  const sura = parseInt(parts[0]!.trim(), 10);
  const ayah = parseInt(parts[1]!.trim(), 10);
  const text = parts.slice(2).join(DELIMITER).trim();

  if (Number.isNaN(sura) || sura < 1 || sura > 114) {
    console.warn(`[Line ${lineNumber}] Invalid sura number: ${sura}`);
    return null;
  }
  if (Number.isNaN(ayah) || ayah < 1) {
    console.warn(`[Line ${lineNumber}] Invalid ayah number: ${ayah}`);
    return null;
  }
  if (!text) {
    console.warn(`[Line ${lineNumber}] Empty text for ${sura}:${ayah}`);
    return null;
  }

  return { sura, ayah, text, lineNumber };
}

function buildSurasFromAyahs(parsed: ParsedLine[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const { sura } of parsed) {
    map.set(sura, (map.get(sura) ?? 0) + 1);
  }
  return map;
}

async function main() {
  const filePath = getFileArg();
  console.log(`Reading: ${filePath}`);

  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch (e) {
    console.error("Failed to read file:", e);
    process.exit(1);
  }

  const lines = content.split(/\r?\n/);
  const parsed: ParsedLine[] = [];
  let errorCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.length > MAX_LINE_LENGTH) {
      console.warn(`[Line ${i + 1}] Line too long, skipped`);
      errorCount++;
      continue;
    }
    const result = parseLine(line, i + 1);
    if (result) parsed.push(result);
    else if (line.trim()) errorCount++;
  }

  console.log(
    `Parsed ${parsed.length} ayahs, ${errorCount} lines skipped or invalid.`
  );

  if (parsed.length === 0) {
    console.error("No valid ayahs to import.");
    process.exit(1);
  }

  const ayahCountBySura = buildSurasFromAyahs(parsed);

  await prisma.$transaction(async (tx) => {
    await tx.ayahText.deleteMany({});
    await tx.ayah.deleteMany({});
    await tx.sura.deleteMany({});

    const surasToCreate = Array.from(ayahCountBySura.entries()).map(
      ([id, ayahCount]) => ({
        id: Number(id),
        ayahCount,
        nameRu: null,
        nameAr: null,
      })
    );
    await tx.sura.createMany({ data: surasToCreate });

    const ayahsToCreate = parsed.map((p, index) => ({
      id: `${p.sura}:${p.ayah}`,
      suraId: p.sura,
      ayahNumber: p.ayah,
      globalIndex: index + 1,
    }));

    for (let i = 0; i < ayahsToCreate.length; i += 500) {
      const chunk = ayahsToCreate.slice(i, i + 500);
      await tx.ayah.createMany({ data: chunk });
    }

    for (let i = 0; i < parsed.length; i += 500) {
      const chunk = parsed.slice(i, i + 500).map((p) => ({
        ayahId: `${p.sura}:${p.ayah}`,
        languageCode: "ar",
        text: p.text,
      }));
      await tx.ayahText.createMany({ data: chunk });
    }
  });

  console.log(
    `Done. Created ${ayahCountBySura.size} suras, ${parsed.length} ayahs, ${parsed.length} Arabic texts.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
