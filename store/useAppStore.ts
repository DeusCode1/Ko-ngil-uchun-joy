"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReadingContext } from "@/types";
import type {
  AyahWithSura,
  AyahDetailResponse,
  SearchResultItem,
  AppLanguage,
  TranslationLanguage,
} from "@/types";

const APP_LANGS: AppLanguage[] = ["ru", "uz", "tr", "ar"];
const TRANS_LANGS: TranslationLanguage[] = ["ar", "ru", "uz", "tr"];

interface AppState {
  currentAyah: AyahDetailResponse | null;
  lastReadAyah: AyahWithSura | null;
  searchQuery: string;
  searchResults: SearchResultItem[];
  favorites: AyahWithSura[];
  readingContext: ReadingContext | null;
  appLanguage: AppLanguage;
  translationLanguage: TranslationLanguage;
  setCurrentAyah: (ayah: AyahDetailResponse | null) => void;
  setLastReadAyah: (ayah: AyahWithSura | null) => void;
  setSearchQuery: (q: string) => void;
  setSearchResults: (results: SearchResultItem[]) => void;
  setFavorites: (list: AyahWithSura[]) => void;
  addFavorite: (ayah: AyahWithSura) => void;
  removeFavorite: (ayahId: string) => void;
  setReadingContext: (ctx: ReadingContext | null) => void;
  setAppLanguage: (lang: AppLanguage) => void;
  setTranslationLanguage: (lang: TranslationLanguage) => void;
  clearSearch: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentAyah: null,
      lastReadAyah: null,
      searchQuery: "",
      searchResults: [],
      favorites: [],
      readingContext: null,
      appLanguage: "ru",
      translationLanguage: "ru",
      setCurrentAyah: (currentAyah) => set({ currentAyah }),
      setLastReadAyah: (lastReadAyah) => set({ lastReadAyah }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSearchResults: (searchResults) => set({ searchResults }),
      setFavorites: (favorites) => set({ favorites }),
      addFavorite: (ayah) =>
        set((s) => ({
          favorites: s.favorites.some((f) => f.id === ayah.id)
            ? s.favorites
            : [...s.favorites, ayah],
        })),
      removeFavorite: (ayahId) =>
        set((s) => ({
          favorites: s.favorites.filter((f) => f.id !== ayahId),
        })),
      setReadingContext: (readingContext) => set({ readingContext }),
      setAppLanguage: (appLanguage) => set({ appLanguage }),
      setTranslationLanguage: (translationLanguage) =>
        set({ translationLanguage }),
      clearSearch: () => set({ searchQuery: "", searchResults: [] }),
    }),
    {
      name: "kongil-uchun-joy",
      partialize: (s) => ({
        appLanguage: s.appLanguage,
        translationLanguage: s.translationLanguage,
      }),
    }
  )
);

export { APP_LANGS, TRANS_LANGS };
