import type { Locale, LocalizedText } from './types';

/**
 * Select a localized value while gracefully falling back to the other language.
 * Whitespace-only translations are treated as absent.
 */
export function localizeText(text: LocalizedText, locale: Locale): string {
  const preferred = text[locale]?.trim();
  if (preferred) return preferred;

  const fallbackLocale: Locale = locale === 'zh' ? 'en' : 'zh';
  return text[fallbackLocale]?.trim() ?? '';
}
