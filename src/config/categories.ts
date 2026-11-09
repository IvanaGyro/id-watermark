import type { Locale } from '../i18n/locales';

/** Localized view of a category (what pages render). */
export interface Category {
  id: string;
  name: string;
  /** Short line used on cards and nav. */
  blurb: string;
  /** Longer SEO copy rendered on the category page. */
  description: string;
  /** Optional <title> (without brand). Falls back to ui.category.title. */
  title?: string;
  /** Lucide icon name (PascalCase). */
  icon: string;
}

export type CategoryText = Pick<Category, 'name' | 'blurb' | 'description' | 'title'>;

interface CategoryDef {
  id: string;
  icon: string;
  /** Text per locale. A category only appears in a locale when it has text AND at least one tool there. */
  text: Partial<Record<Locale, CategoryText>>;
}

// Category order here is the display order everywhere.
const defs = [
  {
    id: 'finance',
    icon: 'Coins',
    text: {
      'zh-TW': {
        name: '薪資與理財',
        blurb: '實領薪水、年終、發票對獎、股票手續費',
        description:
          '上班族與家庭理財最常查的試算工具：實領薪水與勞健保扣款、年終獎金扣稅、綜合所得稅、加班費、特休、資遣費、失業給付、勞退月退休金、統一發票對獎、股票手續費、股息殖利率、融資維持率、貸款、定存與即時匯率。依台灣現行法規與費率設計，並附計算公式說明。',
      },
      en: {
        name: 'Money & Finance',
        blurb: 'Loans, mortgages, savings, exchange rates',
        title: 'Free Money & Finance Calculators Online',
        description:
          'Everyday money calculators: loan and mortgage payments, compound interest, savings growth, dividends and investment returns. Enter your numbers and get an instant answer with the formula explained, so you can see exactly where each figure comes from.',
      },
      ja: {
        name: 'お金・資産運用',
        blurb: '手取り計算、ローン、定期預金、為替',
        title: 'お金の計算ツール：ローン・複利・積立シミュレーション',
        description:
          '毎日のお金の計算に役立つツール集です。ローンや住宅ローンの返済額、複利・積立のシミュレーション、配当利回りなどを、数字を入れるだけですぐに計算できます。計算式もあわせて解説しているので、結果の根拠がひと目でわかります。',
      },
    },
  },
  {
    id: 'calc',
    icon: 'Calculator',
    text: {
      'zh-TW': {
        name: '計算機',
        blurb: 'BMI、房貸、電費、坪數換算',
        description:
          '生活與理財常用的計算機：BMI、百分比、折扣、房貸月付、複利、電費、分帳、坪數與單位換算。輸入數字即時算出結果，並附上公式說明，方便你理解每個數字怎麼來。',
      },
      en: {
        name: 'Calculators',
        blurb: 'Tips, sales tax, GPA, fractions, BMI',
        title: 'Free Online Calculators: BMI, Percentage, Discount & More',
        description:
          'Quick calculators for everyday life: BMI, percentages, discounts, splitting the bill, unit conversion and more. Results update as you type, and each tool explains the formula behind the number.',
      },
      ja: {
        name: '計算ツール',
        blurb: '消費税、日割り、坪換算、割り勘、BMI',
        title: '無料の計算ツール：BMI・パーセント・割引計算など',
        description:
          '暮らしの中でよく使う計算ツールです。BMI、パーセント、割引・割引率、割り勘、単位換算など。入力するとすぐに結果が表示され、計算式の解説もついています。',
      },
    },
  },
  {
    id: 'time',
    icon: 'Clock',
    text: {
      'zh-TW': {
        name: '時間與日期',
        blurb: '台灣時間、跨年倒數、行事曆、計時器',
        description:
          '和時間有關的工具：台灣標準時間校時、跨年與春節倒數、九合一投票指南、日期相差幾天、實歲與虛歲、世界時區換算，以及碼錶、倒數計時器與番茄鐘。適合搶票、安排行程與專注工作。',
      },
      en: {
        name: 'Time & Date',
        blurb: 'Exact time, time cards, time zones, timers',
        title: 'Free Time & Date Tools: Date Calculator, Timers, Time Zones',
        description:
          'Tools for working with time: count the days between dates, calculate age, convert between time zones, and use a stopwatch, countdown timer or Pomodoro timer right in your browser.',
      },
      ja: {
        name: '時間・日付',
        blurb: '和暦変換、祝日、時報、日数計算、タイマー',
        title: '時間・日付の便利ツール：日数計算・時差・タイマー',
        description:
          '時間と日付に関するツールです。日付の間の日数計算、満年齢の計算、世界の時差の変換のほか、ストップウォッチ、カウントダウンタイマー、ポモドーロタイマーもブラウザですぐに使えます。',
      },
    },
  },
  {
    id: 'text',
    icon: 'Type',
    text: {
      'zh-TW': {
        name: '文字處理',
        blurb: '字數統計、繁簡轉換、文字比對',
        description:
          '寫報告、整理文案、處理資料時最常用的文字工具：字數統計、繁體簡體互轉、大小寫與全形半形轉換、逐行排序去重、兩段文字差異比對等，全部在瀏覽器內完成，內容不會上傳到任何伺服器。',
      },
      en: {
        name: 'Text Tools',
        blurb: 'Word counter, case converter, text compare',
        title: 'Free Online Text Tools: Word Counter, Case Converter & More',
        description:
          'Everyday text tools for writers, students and editors: word and character counter, case converter, line sorter and deduplicator, and a side-by-side text diff. Everything runs in your browser, so your text is never uploaded.',
      },
      ja: {
        name: 'テキスト',
        blurb: '文字数カウント、ローマ字、カナ変換、漢数字',
        title: '無料のテキストツール：文字数カウント・変換・比較',
        description:
          'レポートや原稿、SNS 投稿の作成に役立つテキストツールです。文字数カウント、大文字・小文字変換、行の並べ替えと重複削除、2 つの文章の差分比較など。処理はすべてブラウザ内で行われ、文章がサーバーに送信されることはありません。',
      },
    },
  },
  {
    id: 'pdf',
    icon: 'FileText',
    text: {
      'zh-TW': {
        name: 'PDF 工具',
        blurb: '合併、分割、圖片轉 PDF',
        description:
          '免上傳的 PDF 工具：合併多個 PDF、分割與擷取頁面、JPG 與 PNG 圖片轉 PDF、PDF 轉圖片。檔案只在你的瀏覽器中處理，處理合約、成績單等私密文件也安心。',
      },
      en: {
        name: 'PDF Tools',
        blurb: 'Merge, split, images to PDF',
        title: 'Free PDF Tools Without Uploading: Merge, Split, Convert',
        description:
          'PDF tools that never upload your files: merge PDFs, split or extract pages, convert JPG and PNG images to PDF, and turn PDF pages into images. Files are processed only in your browser, so contracts and other private documents stay on your device.',
      },
      ja: {
        name: 'PDF',
        blurb: '結合、分割、画像を PDF に',
        title: 'アップロード不要の PDF ツール：結合・分割・変換',
        description:
          'アップロード不要の PDF ツールです。複数の PDF の結合、ページの分割・抽出、JPG・PNG 画像の PDF 変換、PDF の画像化に対応。ファイルはブラウザ内だけで処理されるため、契約書などの大切な書類も安心です。',
      },
    },
  },
  {
    id: 'image',
    icon: 'Image',
    text: {
      'zh-TW': {
        name: '圖片工具',
        blurb: '壓縮、轉檔、調整尺寸',
        description:
          '免上傳的圖片工具：壓縮 JPG / PNG / WebP、格式互轉、批次調整尺寸、圖片轉 Base64。圖片只在你的瀏覽器裡處理，隱私有保障，速度也更快。',
      },
      en: {
        name: 'Image Tools',
        blurb: 'Compress, convert, resize',
        title: 'Free Image Tools: Compress, Convert & Resize Images Online',
        description:
          'Image tools that work without uploading: compress JPG, PNG and WebP, convert between formats, resize in bulk and encode images as Base64. Your photos are processed locally in the browser, which is both private and fast.',
      },
      ja: {
        name: '画像',
        blurb: '圧縮、形式変換、リサイズ',
        title: '無料の画像ツール：圧縮・形式変換・リサイズ',
        description:
          'アップロード不要の画像ツールです。JPG・PNG・WebP の圧縮、形式の変換、まとめてリサイズ、Base64 への変換に対応。画像はブラウザ内で処理されるので、プライバシーも守られ、処理も高速です。',
      },
    },
  },
  {
    id: 'health',
    icon: 'HeartPulse',
    text: {
      'zh-TW': {
        name: '健康計算',
        blurb: 'TDEE、體脂、預產期、排卵期',
        description:
          '和身體與生活有關的計算工具：每日熱量消耗 TDEE 與基礎代謝 BMR、體脂率、每日喝水量、預產期與懷孕週數、排卵期與安全期推算。結果僅供參考，身體狀況請以醫師建議為準。',
      },
      en: {
        name: 'Health & Fitness',
        blurb: 'Calories, body fat, due date, water intake',
        title: 'Free Health & Fitness Calculators: TDEE, Body Fat & More',
        description:
          'Calculators for your body and daily habits: TDEE and BMR calorie needs, body fat percentage, daily water intake, pregnancy due date and ovulation. Results are estimates for general reference — always follow your doctor\'s advice.',
      },
      ja: {
        name: '健康',
        blurb: '消費カロリー、体脂肪率、出産予定日',
        title: '健康計算ツール：消費カロリー・体脂肪率・出産予定日',
        description:
          'からだと生活習慣に関する計算ツールです。1 日の消費カロリー（TDEE）と基礎代謝（BMR）、体脂肪率、1 日に必要な水分量、出産予定日、排卵日の目安を計算できます。結果はあくまで目安です。体調については医師の判断を優先してください。',
      },
    },
  },
  {
    id: 'test',
    icon: 'Gauge',
    text: {
      'zh-TW': {
        name: '線上測試',
        blurb: '打字速度、CPS、鍵盤、螢幕測試',
        description:
          '測試你自己和你的裝置：中英文打字速度測試、CPS 點擊速度、反應速度測試，以及鍵盤按鍵、螢幕壞點、麥克風與視訊鏡頭檢測。打開網頁就能測，不需要安裝任何軟體。',
      },
      en: {
        name: 'Online Tests',
        blurb: 'Typing speed, click speed, keyboard and screen tests',
        title: 'Free Online Tests: Typing Speed, CPS, Keyboard & Screen',
        description:
          'Test yourself and your devices: typing speed test, clicks-per-second test and reaction time test, plus keyboard, dead-pixel, microphone and webcam checks. Open the page and start — no software to install.',
      },
      ja: {
        name: 'オンラインテスト',
        blurb: 'タイピング、クリック速度、キーボード、画面',
        title: '無料オンラインテスト：タイピング・CPS・キーボード・画面',
        description:
          '自分とデバイスをチェックできるツールです。タイピング速度テスト、CPS（クリック速度）テスト、反応速度テストのほか、キーボード、ドット抜け、マイク、Web カメラの動作確認ができます。ソフトのインストールは不要です。',
      },
    },
  },
  {
    id: 'generator',
    icon: 'Sparkles',
    text: {
      'zh-TW': {
        name: '產生器',
        blurb: '密碼、QR Code、抽籤、亂數',
        description:
          '需要隨機或自動產生內容時使用：高強度密碼產生器、QR Code 產生器、抽籤與隨機分組、交換禮物抽籤、亂數產生器。採用瀏覽器內建的加密等級亂數來源，結果公平可信。',
      },
      en: {
        name: 'Generators',
        blurb: 'Passwords, QR codes, random picks',
        title: 'Free Online Generators: Passwords, QR Codes & Random Numbers',
        description:
          'Generate what you need in a click: strong random passwords, QR codes, random numbers and random name picks. Randomness comes from your browser\'s cryptographically secure generator, so results are fair and unpredictable.',
      },
      ja: {
        name: 'ジェネレーター',
        blurb: 'パスワード、QR コード、乱数',
        title: '無料ジェネレーター：パスワード・QR コード・乱数',
        description:
          'ランダムな値や自動生成が必要なときに。強力なパスワード生成、QR コード作成、乱数生成、抽選などに対応しています。ブラウザ標準の暗号論的乱数を使うため、公平で予測できない結果が得られます。',
      },
    },
  },
  {
    id: 'dev',
    icon: 'Code',
    text: {
      'zh-TW': {
        name: '開發者工具',
        blurb: 'JSON、Base64、雜湊、正規表達式',
        description:
          '給工程師的日常小工具：JSON 格式化與驗證、Base64 與 URL 編碼、UUID 產生、SHA 雜湊、JWT 解碼、正規表達式測試、時間戳轉換與色碼轉換。無需安裝套件，打開網頁就能用。',
      },
      en: {
        name: 'Developer Tools',
        blurb: 'JSON, Base64, hashes, regex',
        title: 'Free Online Developer Tools: JSON, Base64, Regex & More',
        description:
          'Small daily tools for developers: JSON formatter and validator, Base64 and URL encoding, UUID generator, SHA hashes, JWT decoder, regex tester, Unix timestamp converter and color converter. Nothing to install — just open and use.',
      },
      ja: {
        name: '開発者向け',
        blurb: 'JSON、Base64、ハッシュ、正規表現',
        title: '開発者向け無料ツール：JSON・Base64・正規表現など',
        description:
          'エンジニアの日常作業に役立つ小さなツール集です。JSON の整形と検証、Base64 と URL エンコード、UUID 生成、SHA ハッシュ、JWT デコード、正規表現テスト、UNIX 時間の変換、カラーコード変換など。インストール不要ですぐに使えます。',
      },
    },
  },
] as const satisfies readonly CategoryDef[];

export type CategoryId = (typeof defs)[number]['id'];

export const categoryIds: readonly CategoryId[] = defs.map((d) => d.id);

function localize(def: CategoryDef, locale: Locale): Category | null {
  const text = def.text[locale];
  return text ? { id: def.id, icon: def.icon, ...text } : null;
}

/** All categories that have text in `locale`, in display order. Filter by tool count at the call site. */
export function categoriesFor(locale: Locale): Category[] {
  return defs.map((d) => localize(d, locale)).filter((c): c is Category => c !== null);
}

/** zh-TW categories (backward compatible export). */
export const categories: readonly Category[] = categoriesFor('zh-TW');

export function getCategory(id: string, locale: Locale = 'zh-TW'): Category {
  const def = defs.find((d) => d.id === id);
  if (!def) throw new Error(`Unknown category: ${id}`);
  const category = localize(def, locale);
  if (!category) throw new Error(`Category "${id}" has no text for locale "${locale}"`);
  return category;
}
