/**
 * Import translation for existing ayahs.
 * Format: one line per ayah: sura|ayah|text
 *
 * Usage:
 *   npm run import:translation -- --file=./data/ru.txt --lang=ru
 *   npm run import:translation -- --file=./data/uz.txt --lang=uz
 *   npm run import:translation -- --file=./data/tr.txt --lang=tr
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SUPPORTED_LANGS = ["ar", "ru", "uz", "tr"] as const;
const MAX_LINE_LENGTH = 100_000;
const DELIMITER = "|";

function getArg(name: string): string | null {
  const prefix = `--${name}=`;
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith(prefix)) return arg.slice(prefix.length).trim();
  }
  return null;
}

function getFileArg(): string {
  const file = getArg("file");
  if (!file) {
    console.error(
      "Usage: npm run import:translation -- --file=./data/ru.txt --lang=ru"
    );
    process.exit(1);
  }
  const p = resolve(process.cwd(), file);
  if (!existsSync(p)) {
    console.error(`File not found: ${p}`);
    process.exit(1);
  }
  return p;
}

function getLangArg(): (typeof SUPPORTED_LANGS)[number] {
  const lang = getArg("lang");
  if (!lang || !SUPPORTED_LANGS.includes(lang as (typeof SUPPORTED_LANGS)[number])) {
    console.error(
      `--lang= required. Supported: ${SUPPORTED_LANGS.join(", ")}`
    );
    process.exit(1);
  }
  return lang as (typeof SUPPORTED_LANGS)[number];
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

async function main() {
  const filePath = getFileArg();
  const lang = getLangArg();
  console.log(`Reading: ${filePath}, language: ${lang}`);

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
    `Parsed ${parsed.length} lines, ${errorCount} skipped or invalid.`
  );

  if (parsed.length === 0) {
    console.error("No valid lines to import.");
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  let notFound = 0;

  for (const p of parsed) {
    const ayahId = `${p.sura}:${p.ayah}`;
    const ayah = await prisma.ayah.findUnique({ where: { id: ayahId } });
    if (!ayah) {
      console.warn(`Ayah not found: ${ayahId}, skip.`);
      notFound++;
      continue;
    }

    const existing = await prisma.ayahText.findUnique({
      where: {
        ayahId_languageCode: { ayahId, languageCode: lang },
      },
    });

    if (existing) {
      await prisma.ayahText.update({
        where: { id: existing.id },
        data: { text: p.text },
      });
      updated++;
    } else {
      await prisma.ayahText.create({
        data: { ayahId, languageCode: lang, text: p.text },
      });
      created++;
    }
  }

  console.log(
    `Done. Created: ${created}, updated: ${updated}, ayah not found: ${notFound}.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
