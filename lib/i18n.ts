import type { AppLanguage } from "@/types";
import ru from "@/locales/ru.json";
import uz from "@/locales/uz.json";
import tr from "@/locales/tr.json";
import ar from "@/locales/ar.json";

type Dict = Record<string, string>;

const locales: Record<AppLanguage, Dict> = {
  ru: ru as Dict,
  uz: uz as Dict,
  tr: tr as Dict,
  ar: ar as Dict,
};

export function t(key: string, lang: AppLanguage): string {
  const d = locales[lang];
  if (!d) return key;
  return d[key] ?? (locales.ru as Dict)[key] ?? key;
}

export const langLabels: Record<AppLanguage, string> = {
  ru: "Русский",
  uz: "O'zbek",
  tr: "Türkçe",
  ar: "العربية",
};

export const transLabels: Record<string, string> = {
  ar: "العربية",
  ru: "Русский",
  uz: "O'zbek",
  tr: "Türkçe",
};
