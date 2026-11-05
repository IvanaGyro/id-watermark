import { describe, expect, it } from 'vitest';
import { LOCALES } from '../i18n/locales';
import { fishingFestival, highlightParts, plainCopy, promoCopy, promoUrl } from './promos';

describe('promo copy', () => {
  it('splits highlighted keywords', () => {
    expect(highlightParts('釣魚也能抽**一番賞**！')).toEqual([
      { text: '釣魚也能抽', hl: false },
      { text: '一番賞', hl: true },
      { text: '！', hl: false },
    ]);
    expect(highlightParts('**A** and **B**')).toEqual([
      { text: 'A', hl: true },
      { text: ' and ', hl: false },
      { text: 'B', hl: true },
    ]);
    expect(plainCopy('Love a **prize draw**?')).toBe('Love a prize draw?');
  });
  it('uses placement copy and falls back to the default', () => {
    const zh = fishingFestival.text['zh-TW'];
    expect(promoCopy(zh, 'ichiban-kuji').hook).toContain('一番賞');
    expect(promoCopy(zh, 'nowhere')).toEqual({ hook: zh.hook, pitch: zh.pitch });
  });
  it('has balanced markers and the same placements in every locale', () => {
    const keys = Object.keys(fishingFestival.text['zh-TW'].placements ?? {}).sort();
    for (const locale of LOCALES) {
      const text = fishingFestival.text[locale];
      expect(Object.keys(text.placements ?? {}).sort()).toEqual(keys);
      for (const c of [text, ...Object.values(text.placements ?? {})]) {
        for (const s of [c.hook, c.pitch]) expect((s.match(/\*\*/g) ?? []).length % 2).toBe(0);
      }
    }
  });
  it('adds the language and install referrer to the store link', () => {
    const url = new URL(promoUrl(fishingFestival, 'ja', 'spin-wheel'));
    expect(url.searchParams.get('id')).toBe('com.iraiya.fishingfest');
    expect(url.searchParams.get('hl')).toBe('ja');
    expect(new URLSearchParams(url.searchParams.get('referrer') ?? '').get('utm_campaign')).toBe('spin-wheel');
  });
});
