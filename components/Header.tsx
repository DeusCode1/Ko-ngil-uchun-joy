"use client";

import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  showLangSwitcher?: boolean;
}

export function Header({
  title,
  showBack,
  backHref = "/",
  showLangSwitcher = true,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-tg-bg/98 backdrop-blur-md border-b border-tg-hint/10 safe-bottom">
      <div className="flex items-center gap-3 px-4 py-3 min-h-[52px]">
        {showBack && (
          <Link
            href={backHref}
            className="flex items-center justify-center w-10 h-10 rounded-2xl text-tg-link font-medium touch-manipulation hover:bg-tg-secondary-bg/80 active:opacity-80 transition-opacity shrink-0"
            aria-label="Back"
          >
            ←
          </Link>
        )}
        <h1 className="flex-1 text-[17px] font-semibold text-tg-text truncate min-w-0 leading-tight">
          {title}
        </h1>
        {showLangSwitcher && (
          <div className="shrink-0">
            <LanguageSwitcher />
          </div>
        )}
      </div>
    </header>
  );
}
