"use client";

import type { TelegramUser } from "@/types";

const TELEGRAM_WEBAPP = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

export function isTelegramWebApp(): boolean {
  return Boolean(TELEGRAM_WEBAPP);
}

export function initTelegram(): void {
  if (TELEGRAM_WEBAPP) {
    TELEGRAM_WEBAPP.ready();
    TELEGRAM_WEBAPP.expand();
  }
}

export function getTelegramUser(): TelegramUser | null {
  return TELEGRAM_WEBAPP?.initDataUnsafe?.user ?? null;
}

/**
 * Safe way to get Telegram user ID.
 * In production, validate initData on server; for MVP we use client-side only.
 * Returns string for consistency with API (telegramUserId).
 */
export function getTelegramUserId(): string | null {
  const user = getTelegramUser();
  return user ? String(user.id) : null;
}

export function getTelegramTheme(): "light" | "dark" {
  if (!TELEGRAM_WEBAPP?.themeParams) return "light";
  const bg = TELEGRAM_WEBAPP.themeParams.bg_color;
  if (!bg) return "light";
  const hex = bg.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "light" : "dark";
}

/** For local dev: mock user id when not in Telegram */
export const DEV_MOCK_USER_ID = "dev-user";
