export type ReadingSource = "home" | "sura" | "search" | "favorites";

export interface ReadingContext {
  source: ReadingSource;
  returnPath?: string;
}

export type AppLanguage = "ru" | "uz" | "tr" | "ar";
export type TranslationLanguage = "ar" | "ru" | "uz" | "tr";

export interface AyahWithSura {
  id: string;
  suraId: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string | null;
  globalIndex: number;
  sura?: {
    id: number;
    nameRu: string | null;
    nameAr: string | null;
    ayahCount: number;
  };
}

export interface AyahDetailResponse extends AyahWithSura {
  prev: { id: string; suraId: number; ayahNumber: number } | null;
  next: { id: string; suraId: number; ayahNumber: number } | null;
}

export interface SearchResultItem {
  id: string;
  suraId: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string | null;
  sura?: { nameRu: string | null; nameAr: string | null };
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: { user?: TelegramUser };
        themeParams: Record<string, string>;
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}
