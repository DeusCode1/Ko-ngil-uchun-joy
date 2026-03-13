/**
 * Helper: get arabicText and translationText from AyahText[] by languageCode
 */
export function getAyahTexts(
  texts: { languageCode: string; text: string }[],
  lang: string
): { arabicText: string; translationText: string | null } {
  const ar = texts.find((t) => t.languageCode === "ar");
  const tr =
    lang === "ar" ? null : texts.find((t) => t.languageCode === lang);
  return {
    arabicText: ar?.text ?? "",
    translationText: tr?.text ?? null,
  };
}

export const SUPPORTED_TRANSLATION_LANGS = ["ar", "ru", "uz", "tr"] as const;
export const SUPPORTED_APP_LANGS = ["ru", "uz", "tr", "ar"] as const;
