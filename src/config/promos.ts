// House promotions: the site owner's own apps and games, shown as plain links (not AdSense).
// Rendered by src/components/AppPromo.astro. Images live in public/promo/.
import type { Locale } from '../i18n/locales';

/** Copy for one card. Wrap keywords in **double asterisks** to highlight them. */
export interface PromoCopy {
  /** Big one-line hook above the app name, built around the host tool's keywords. */
  hook: string;
  pitch: string;
}

export interface AppPromoText extends PromoCopy {
  /** Small chip above the hook, e.g. 推薦遊戲. */
  badge: string;
  name: string;
  /** Copy tuned to one placement (the `placement` prop of AppPromo); falls back to the default hook and pitch. */
  placements?: Record<string, PromoCopy>;
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

// In-game facts the copy relies on (fisher-ichibankuji docs/project/PLAN.md): fish to earn coins, spend coins on
// kuji-style prize sets from Prize A to G; the Prize A rod unlocks the next set, each set's Last One prize opens a new
// sea; 7 prize sets. Keep claims within these.
export const fishingFestival: AppPromo = {
  id: 'fishing-festival',
  storeUrl: 'https://play.google.com/store/apps/details?id=com.iraiya.fishingfest',
  image: { src: '/promo/fishing-festival-640.webp', width: 640, height: 312 },
  icon: { src: '/promo/fishing-festival-icon-128.webp', width: 128, height: 128 },
  text: {
    'zh-TW': {
      badge: '推薦遊戲',
      name: '伊萊雅－大漁祭',
      hook: '釣魚賺金幣，抽**祭典大獎**！',
      pitch: '抓準時機起鉤，用漁獲換來的金幣抽 **A賞到最後賞**，收集裝備、解鎖新海域的像素釣魚遊戲。',
      placements: {
        'ichiban-kuji': {
          hook: '釣魚也能抽**一番賞**！',
          pitch: '從 **A賞**魚竿到**最後賞**新海域，**7 套獎池**等你抽完。抓準時機起鉤，釣魚賺金幣來抽。',
        },
        'spin-wheel': {
          hook: '愛**抽獎**？來釣魚抽**大獎**！',
          pitch: '釣魚賺金幣來**抽獎**，獎項從 A賞到最後賞；抽中 **A賞**魚竿就能解鎖下一套，共 **7 套獎池**等你抽。',
        },
      },
      cta: 'Google Play 免費下載',
      alt: '《伊萊雅－大漁祭》：在祭典碼頭釣魚的女孩與一張刮開的抽獎券',
    },
    en: {
      badge: 'Featured game',
      name: 'Iraiya - Great Fishing Festival',
      hook: 'Fish for coins, win **festival prizes**!',
      pitch: 'Time the hook, then spend your catch on prize draws from **Prize A to the Last One** to collect gear and open new seas.',
      placements: {
        'ichiban-kuji': {
          hook: 'Pull **kuji prizes** with every catch!',
          pitch: 'Chase the **Prize A** rod and the **Last One** prize across **7 prize sets**, each opening a new sea. Fish for coins, then draw.',
        },
        'spin-wheel': {
          hook: 'Love a **prize draw**? Fish for **big wins**!',
          pitch: 'Catch fish, earn coins and **draw prizes** from A to the Last One. The **Prize A** rod unlocks the next of **7 prize sets**.',
        },
      },
      cta: 'Get it free on Google Play',
      alt: 'Iraiya - Great Fishing Festival: a girl fishing on a festival pier next to a torn-open prize ticket',
    },
    ja: {
      badge: 'おすすめゲーム',
      name: 'イライヤ－大漁祭',
      hook: '釣ってコインを集めて**祭りのくじ**！',
      pitch: 'タイミングよく釣り上げ、集めたコインで **A賞からラストワン賞**までのくじを引いて、装備と新しい海を集めるピクセル釣りゲームです。',
      placements: {
        'ichiban-kuji': {
          hook: '釣りながら**一番くじ**気分！',
          pitch: '**A賞**の釣竿から**ラストワン賞**の新しい海まで、**7 セットの景品**を引き切ろう。釣ってコインを集めて引くピクセル釣りゲームです。',
        },
        'spin-wheel': {
          hook: '**抽選**好きなら釣って**大当たり**！',
          pitch: '魚を釣ってコインを集め、A賞からラストワン賞までの**くじ**を引こう。**A賞**の釣竿で次の景品セットが開き、全部で **7 セット**あります。',
        },
      },
      cta: 'Google Play で無料ダウンロード',
      alt: 'イライヤ－大漁祭：祭りの桟橋で釣りをする少女と、めくれたくじ券',
    },
  },
};

/** The copy for a placement, falling back to the default. */
export function promoCopy(text: AppPromoText, placement: string): PromoCopy {
  return text.placements?.[placement] ?? { hook: text.hook, pitch: text.pitch };
}

/** Split **highlighted** keywords out of copy for rendering. */
export function highlightParts(copy: string): { text: string; hl: boolean }[] {
  return copy
    .split(/\*\*(.+?)\*\*/)
    .map((text, i) => ({ text, hl: i % 2 === 1 }))
    .filter((p) => p.text !== '');
}

/** Copy with the highlight markers removed (for aria labels). */
export function plainCopy(copy: string): string {
  return copy.replace(/\*\*(.+?)\*\*/g, '$1');
}

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
