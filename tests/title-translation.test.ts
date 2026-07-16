import { describe, expect, it, vi } from 'vitest';
import {
  extractTranslationCache,
  hasChineseText,
  normalizeTitleKey,
  translateMissingTitles,
} from '../scripts/title-translation';

function translationResponse(value: string): Response {
  return new Response(JSON.stringify([[[value, null, null, null]]]), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Chinese title translation', () => {
  it('uses valid cached Chinese titles and ignores legacy English pseudo-translations', async () => {
    const cache = extractTranslationCache({
      feedItems: [
        { originalTitle: 'SKF launches a bearing', title: { zh: 'SKF 推出新型轴承' } },
        { originalTitle: 'Timken reports results', title: { zh: 'Timken reports results' } },
      ],
    });
    const fetcher = vi.fn();

    const result = await translateMissingTitles(['SKF launches a bearing'], cache, fetcher);

    expect(result.translations.get(normalizeTitleKey('SKF launches a bearing'))).toBe('SKF 推出新型轴承');
    expect(cache.has(normalizeTitleKey('Timken reports results'))).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('deduplicates requests, preserves brand names and accepts only Chinese output', async () => {
    const fetcher = vi.fn().mockImplementation(async (input: string | URL) => {
      const query = new URL(String(input)).searchParams.get('q') ?? '';
      expect(query).toContain('__BSBRAND000__');
      return translationResponse('[BS0000]\n__BSBRAND000__ 推出用于电驱的新型轴承');
    });

    const result = await translateMissingTitles(
      ['SKF launches a bearing for electric drives', 'SKF launches a bearing for electric drives'],
      new Map(),
      fetcher,
    );

    expect(result.requestedCount).toBe(1);
    expect(result.unresolved).toEqual([]);
    expect(result.translations.get(normalizeTitleKey('SKF launches a bearing for electric drives'))).toBe('SKF 推出用于电驱的新型轴承');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('never publishes an English result as a Chinese translation', async () => {
    const fetcher = vi.fn().mockResolvedValue(translationResponse('[BS0000]\nA bearing technology update'));

    const result = await translateMissingTitles(['A bearing technology update'], new Map(), fetcher);

    expect(result.unresolved).toEqual(['A bearing technology update']);
    expect(result.translations.has(normalizeTitleKey('A bearing technology update'))).toBe(false);
  });

  it('keeps an original Chinese title without calling the translation service', async () => {
    const fetcher = vi.fn();
    const result = await translateMissingTitles(['人本轴承发布新产品'], new Map(), fetcher);

    expect(hasChineseText(result.translations.get(normalizeTitleKey('人本轴承发布新产品')) ?? '')).toBe(true);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
