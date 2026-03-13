"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (q: string) => void;
  debounceMs?: number;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  debounceMs = 300,
  placeholder,
  autoFocus,
}: SearchInputProps) {
  const appLanguage = useAppStore((s) => s.appLanguage);
  const [local, setLocal] = useState(value);
  const place = placeholder ?? t("searchPlaceholder", appLanguage);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (!local.trim()) {
      onSearch("");
      return;
    }
    const t = setTimeout(() => onSearch(local.trim()), debounceMs);
    return () => clearTimeout(t);
  }, [local, debounceMs, onSearch]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setLocal(v);
      onChange(v);
    },
    [onChange]
  );

  return (
    <input
      type="search"
      value={local}
      onChange={handleChange}
      placeholder={place}
      autoFocus={autoFocus}
      autoComplete="off"
      className="w-full px-4 py-3.5 rounded-2xl bg-tg-secondary-bg/70 border border-tg-hint/10 text-tg-text placeholder-tg-hint focus:outline-none focus:ring-2 focus:ring-tg-button/40 focus:border-tg-button text-base"
      aria-label="Search ayahs"
    />
  );
}
