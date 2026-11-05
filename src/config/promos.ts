// House promotions: the site owner's own apps and games, shown as plain links (not AdSense).
// Rendered by src/components/AppPromo.astro. Images live in public/promo/.
import type { Locale } from '../i18n/locales';

export interface AppPromoText {
  /** Small chip above the app name, e.g. 推薦遊戲. */
  badge: string;
  name: string;
  pitch: string;
  cta: string;
  /** Alt text for the banner image. */
  alt: string;
}

export interface AppPromo {
  id: string;
  /** Store URL without locale; `hl` and the install referrer are added per locale and placement. */
  storeUrl: string;
  image: { src: string; width: number; height: number };
  icon: { src: string; width: number; height: number };
  text: Record<Locale, AppPromoText>;
}

export const fishingFestival: AppPromo = {
  id: 'fishing-festival',
  storeUrl: 'https://play.google.com/store/apps/details?id=com.iraiya.fishingfest',
  image: { src: '/promo/fishing-festival-640.webp', width: 640, height: 312 },
  icon: { src: '/promo/fishing-festival-icon-128.webp', width: 128, height: 128 },
  text: {
    'zh-TW': {
      badge: '推薦遊戲',
      name: '伊萊雅－大漁祭',
      pitch: '抓準時機起鉤、穿越八片海域，釣到的魚還能換成祭典抽籤。喜歡抽一番賞的你，來試試釣魚版的抽獎吧！',
      cta: 'Google Play 免費下載',
      alt: '《伊萊雅－大漁祭》：在祭典碼頭釣魚的女孩與一張刮開的抽獎券',
    },
    en: {
      badge: 'Featured game',
      name: 'Iraiya - Great Fishing Festival',
      pitch: 'Time the hook, cross eight seas and turn every catch into a festival prize draw. A pixel fishing game for anyone who loves a good kuji pull.',
      cta: 'Get it free on Google Play',
      alt: 'Iraiya - Great Fishing Festival: a girl fishing on a festival pier next to a torn-open prize ticket',
    },
    ja: {
      badge: 'おすすめゲーム',
      name: 'イライヤ－大漁祭',
      pitch: '起鉤のタイミングを合わせて 8 つの海域を巡り、釣った魚で祭りのくじを引くピクセル釣りゲーム。くじ好きの方にぜひ。',
      cta: 'Google Play で無料ダウンロード',
      alt: 'イライヤ－大漁祭：祭りの桟橋で釣りをする少女と、めくれたくじ券',
    },
  },
};

const PLAY_HL: Record<Locale, string> = { 'zh-TW': 'zh_TW', en: 'en', ja: 'ja' };

/** Store link with the UI language and a Play install referrer naming where the click came from. */
export function promoUrl(promo: AppPromo, locale: Locale, placement: string): string {
  const url = new URL(promo.storeUrl);
  url.searchParams.set('hl', PLAY_HL[locale]);
  url.searchParams.set(
    'referrer',
    new URLSearchParams({ utm_source: 'tool.6yuwei.com', utm_medium: 'house_promo', utm_campaign: placement }).toString(),
  );
  return url.toString();
}
