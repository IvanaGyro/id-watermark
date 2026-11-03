import { defineToolI18n } from '../../i18n/tool';
import type { CharsetId, WidthPresetId } from './logic';

export interface Strings {
  dropTitle: string;
  dropHint: string;
  outputLabel: string;
  plain: string;
  color: string;
  backgroundLabel: string;
  light: string;
  dark: string;
  previewAria: string;
  copyText: string;
  downloadTxt: string;
  downloadPng: string;
  copyHtml: string;
  htmlHint: string;
  settings: string;
  /** Text before the width number: `${widthBefore}<output>100</output>` */
  widthBefore: string;
  widthHint: string;
  presets: Record<WidthPresetId, string>;
  charsetLabel: string;
  charsets: Record<CharsetId, string>;
  customLabel: string;
  customPlaceholder: string;
  autoSort: string;
  mixedWidth: string;
  brightness: string;
  contrast: string;
  autoLevels: string;
  invert: string;
  dither: string;
  edges: string;
  reset: string;
  backgroundHint: string;
  privacy: string;
  client: {
    /** Font stack of the preview, the glyph measurements and the PNG. */
    font: string;
    sampleName: string;
    /** {name} {w} {h} */
    source: string;
    loading: string;
    error: string;
    /** {cols} {rows} {n} */
    stats: string;
    /** Shown under the character set, before the ramp itself. */
    rampLabel: string;
    brailleNote: string;
    copied: string;
    saved: string;
  };
}

const ZH_FONT = "Menlo, Consolas, 'DejaVu Sans Mono', 'Liberation Mono', 'Droid Sans Mono', ui-monospace, 'PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', monospace";
const JA_FONT = "Menlo, Consolas, 'DejaVu Sans Mono', 'Liberation Mono', 'Droid Sans Mono', ui-monospace, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', Meiryo, monospace";
const EN_FONT = "Menlo, Consolas, 'DejaVu Sans Mono', 'Liberation Mono', 'Droid Sans Mono', ui-monospace, 'PingFang TC', 'Noto Sans CJK TC', 'Microsoft JhengHei', monospace";

export default defineToolI18n<Strings>({
  'zh-TW': {
    dropTitle: '點擊選擇圖片，或拖曳到這裡',
    dropHint: '支援 JPG、PNG、WebP、GIF、iPhone HEIC，也可以按 Ctrl/Cmd + V 貼上截圖。還沒選圖時先用範例圖片示範。',
    outputLabel: '輸出',
    plain: '純文字',
    color: '彩色',
    backgroundLabel: '背景',
    light: '淺色',
    dark: '深色',
    previewAria: '文字畫預覽',
    copyText: '複製文字',
    downloadTxt: '下載 TXT',
    downloadPng: '下載 PNG',
    copyHtml: '複製 HTML',
    htmlHint: '「複製 HTML」會連同等寬字型、行高和顏色一起複製，適合貼到支援格式文字的文件或電子郵件；聊天軟體通常只收得到純文字。',
    settings: '文字畫設定',
    widthBefore: '寬度（半形字數）：',
    widthHint: '中文字等全形字一個佔兩格。貼到手機聊天時如果自動換行，請把寬度調小。',
    presets: { phone: '手機訊息', chat: '聊天貼文', poster: '大型海報' },
    charsetLabel: '字元組',
    charsets: {
      classic: '經典 ASCII',
      simple: '簡潔',
      blocks: '方塊 ░▒▓█',
      braille: '點字（最細緻）',
      cjk: '中文字',
      custom: '自訂',
    },
    customLabel: '自訂字元',
    customPlaceholder: '例如 .oO@ 或 一二田',
    autoSort: '依字的濃淡自動排序（關閉時照輸入順序，由淡到濃）',
    mixedWidth: '全形與半形字元混在一起時，每行的寬度會對不齊，建議只用其中一種。',
    brightness: '亮度',
    contrast: '對比',
    autoLevels: '自動調整明暗範圍',
    invert: '反轉明暗',
    dither: '抖色（Dithering）',
    edges: '強調輪廓',
    reset: '恢復預設',
    backgroundHint: '背景請選和要貼上的地方相同的顏色：淺色背景用濃的字畫暗部，深色背景則用濃的字畫亮部。',
    privacy: '圖片只在你的瀏覽器中處理，不會上傳；設定會記在這個瀏覽器，圖片不會保存。',
    client: {
      font: ZH_FONT,
      sampleName: '範例圖片',
      source: '{name}・{w} × {h}',
      loading: '讀取圖片中…',
      error: '無法讀取這張圖片，請換一張試試。',
      stats: '每行 {cols} 字 × {rows} 行，共 {n} 字',
      rampLabel: '由淡到濃：',
      brailleNote: '每個點字有 2 × 4 個點，同樣寬度能畫出最多細節。',
      copied: '已複製',
      saved: '已下載',
    },
  },
  en: {
    dropTitle: 'Click to choose an image, or drop it here',
    dropHint: 'JPG, PNG, WebP, GIF and iPhone HEIC. You can also paste a screenshot with Ctrl/Cmd + V. A sample picture is shown until you pick one.',
    outputLabel: 'Output',
    plain: 'Plain text',
    color: 'Color',
    backgroundLabel: 'Background',
    light: 'Light',
    dark: 'Dark',
    previewAria: 'ASCII art preview',
    copyText: 'Copy text',
    downloadTxt: 'Download .txt',
    downloadPng: 'Download PNG',
    copyHtml: 'Copy as HTML',
    htmlHint: '“Copy as HTML” keeps the monospace font, line spacing and colors, for documents and email that accept formatted text. Chat apps usually receive plain text only.',
    settings: 'Settings',
    widthBefore: 'Width (columns): ',
    widthHint: 'A full-width character, such as a Chinese character, takes two columns. If lines wrap in a chat app, lower the width.',
    presets: { phone: 'Phone message', chat: 'Chat post', poster: 'Big poster' },
    charsetLabel: 'Character set',
    charsets: {
      classic: 'Classic ASCII',
      simple: 'Simple',
      blocks: 'Blocks ░▒▓█',
      braille: 'Braille (most detail)',
      cjk: 'Chinese characters',
      custom: 'Custom',
    },
    customLabel: 'Custom characters',
    customPlaceholder: 'For example .oO@ or 01',
    autoSort: 'Sort by ink density (when off, type them from light to dark)',
    mixedWidth: 'Full-width and half-width characters are mixed, so lines will not line up. Use one kind only.',
    brightness: 'Brightness',
    contrast: 'Contrast',
    autoLevels: 'Auto levels',
    invert: 'Invert',
    dither: 'Dithering',
    edges: 'Emphasize edges',
    reset: 'Reset',
    backgroundHint: 'Match the background where you will paste the art. On light, dense characters draw the shadows; on dark, they draw the highlights.',
    privacy: 'Your picture is processed in this browser and never uploaded. Settings are saved in this browser; the picture is not.',
    client: {
      font: EN_FONT,
      sampleName: 'Sample picture',
      source: '{name} · {w} × {h}',
      loading: 'Loading the picture…',
      error: 'This picture could not be read. Try another one.',
      stats: '{cols} characters × {rows} lines, {n} in total',
      rampLabel: 'Light to dark: ',
      brailleNote: 'Each braille character holds 2 × 4 dots, the most detail per column.',
      copied: 'Copied',
      saved: 'Saved',
    },
  },
  ja: {
    dropTitle: '画像をクリックして選択、またはここにドロップ',
    dropHint: 'JPG・PNG・WebP・GIF・iPhone の HEIC に対応。Ctrl/Cmd + V でスクリーンショットも貼り付けられます。画像を選ぶまではサンプル画像を表示します。',
    outputLabel: '出力',
    plain: 'テキスト',
    color: 'カラー',
    backgroundLabel: '背景',
    light: 'ライト',
    dark: 'ダーク',
    previewAria: 'アスキーアートのプレビュー',
    copyText: 'テキストをコピー',
    downloadTxt: 'TXT で保存',
    downloadPng: 'PNG で保存',
    copyHtml: 'HTML でコピー',
    htmlHint: '「HTML でコピー」は等幅フォント・行の高さ・色ごとコピーします。書式付きテキストを貼れる文書やメール向けで、チャットアプリには通常テキストだけが届きます。',
    settings: '設定',
    widthBefore: '横幅（半角文字数）：',
    widthHint: '漢字などの全角文字は半角 2 文字分として数えます。スマホのチャットで折り返されるときは横幅を小さくしてください。',
    presets: { phone: 'スマホのメッセージ', chat: 'チャット投稿', poster: '大きなポスター' },
    charsetLabel: '文字セット',
    charsets: {
      classic: '定番 ASCII',
      simple: 'シンプル',
      blocks: 'ブロック ░▒▓█',
      braille: '点字（高精細）',
      cjk: '漢字',
      custom: 'カスタム',
    },
    customLabel: 'カスタム文字',
    customPlaceholder: '例：.oO@ や 一二田',
    autoSort: '文字の濃さで自動的に並べ替える（オフのときは入力順＝薄い順）',
    mixedWidth: '全角と半角が混ざっているため、行の幅がそろいません。どちらか一方だけにしてください。',
    brightness: '明るさ',
    contrast: 'コントラスト',
    autoLevels: '明暗を自動補正',
    invert: '明暗を反転',
    dither: 'ディザリング',
    edges: '輪郭を強調',
    reset: '初期設定に戻す',
    backgroundHint: '背景は貼り付け先と同じ色を選んでください。ライトでは濃い文字で暗い部分を、ダークでは濃い文字で明るい部分を描きます。',
    privacy: '画像はこのブラウザ内で処理され、アップロードされません。設定はこのブラウザに保存されますが、画像は保存されません。',
    client: {
      font: JA_FONT,
      sampleName: 'サンプル画像',
      source: '{name}・{w} × {h}',
      loading: '画像を読み込み中…',
      error: 'この画像を読み込めませんでした。別の画像でお試しください。',
      stats: '1 行 {cols} 文字 × {rows} 行（計 {n} 文字）',
      rampLabel: '薄い順：',
      brailleNote: '点字 1 文字に 2 × 4 個の点があり、同じ横幅でいちばん細かく描けます。',
      copied: 'コピーしました',
      saved: '保存しました',
    },
  },
});
