import { defineToolI18n } from '../../i18n/tool';
import type { ColorName, Direction } from './logic';

export interface Strings {
  /** Sign text before the visitor types anything. */
  defaultText: string;
  stageAria: string;
  textLabel: string;
  textPlaceholder: string;
  fullscreen: string;
  copyLink: string;
  share: string;
  landscapeHint: string;
  motion: string;
  dirs: Record<Direction, string>;
  textColor: string;
  bgColor: string;
  /** aria-label of the custom color pickers. */
  customText: string;
  customBg: string;
  colors: Record<ColorName, string>;
  speed: string;
  size: string;
  blink: string;
  dots: string;
  mirror: string;
  lowContrast: string;
  /** Full-screen controls. */
  tip: string;
  rotate: string;
  exitFullscreen: string;
  saveHint: string;
  client: {
    /** Size output at 100 %. */
    fill: string;
    /** Size output below 100 %, {n} = percent. */
    percent: string;
    copied: string;
    shareTitle: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    defaultText: '歡迎回家，一路辛苦了！',
    stageAria: '跑馬燈預覽',
    textLabel: '跑馬燈文字',
    textPlaceholder: '輸入要顯示的文字',
    fullscreen: '全螢幕顯示',
    copyLink: '複製分享連結',
    share: '分享',
    landscapeHint: '全螢幕時把手機橫拿，字最大；點一下畫面就會出現「離開全螢幕」按鈕。',
    motion: '捲動方式',
    dirs: { left: '向左捲動', right: '向右捲動', static: '靜止置中' },
    textColor: '文字顏色',
    bgColor: '背景顏色',
    customText: '自訂文字顏色',
    customBg: '自訂背景顏色',
    colors: {
      red: '紅色',
      orange: '橘色',
      yellow: '黃色',
      green: '綠色',
      cyan: '水藍色',
      pink: '粉紅色',
      white: '白色',
      black: '黑色',
      navy: '深藍色',
      purple: '紫色',
    },
    speed: '捲動速度',
    size: '文字大小',
    blink: '閃爍',
    dots: 'LED 點陣效果',
    mirror: '左右鏡像',
    lowContrast: '文字和背景顏色太接近，遠一點就看不清楚，建議換一個對比更強的顏色。',
    tip: '點一下畫面可以隱藏或顯示按鈕',
    rotate: '轉向',
    exitFullscreen: '離開全螢幕',
    saveHint: '設定只存在這個瀏覽器。分享連結把文字寫在網址「#」後面，這一段不會傳到伺服器。',
    client: {
      fill: '填滿高度',
      percent: '{n}%',
      copied: '已複製連結',
      shareTitle: '手機跑馬燈',
    },
  },
  en: {
    defaultText: 'Welcome home! We missed you',
    stageAria: 'Sign preview',
    textLabel: 'Message',
    textPlaceholder: 'Type your message',
    fullscreen: 'Full screen',
    copyLink: 'Copy share link',
    share: 'Share',
    landscapeHint: 'Turn your phone sideways in full screen for the biggest letters. Tap the screen to bring up “Exit full screen”.',
    motion: 'Motion',
    dirs: { left: 'Scroll left', right: 'Scroll right', static: 'Static' },
    textColor: 'Text color',
    bgColor: 'Background',
    customText: 'Custom text color',
    customBg: 'Custom background color',
    colors: {
      red: 'Red',
      orange: 'Orange',
      yellow: 'Yellow',
      green: 'Green',
      cyan: 'Cyan',
      pink: 'Pink',
      white: 'White',
      black: 'Black',
      navy: 'Navy',
      purple: 'Purple',
    },
    speed: 'Speed',
    size: 'Text size',
    blink: 'Blink',
    dots: 'LED dot effect',
    mirror: 'Mirror',
    lowContrast: 'The text and background colors are too close to read from a distance. Try a stronger contrast.',
    tip: 'Tap the screen to show or hide these buttons',
    rotate: 'Rotate',
    exitFullscreen: 'Exit full screen',
    saveHint: 'Your settings stay in this browser. Share links keep the message after the “#” in the URL, a part that is never sent to the server.',
    client: {
      fill: 'Fill height',
      percent: '{n}%',
      copied: 'Link copied',
      shareTitle: 'LED Scrolling Text',
    },
  },
  ja: {
    defaultText: 'おかえりなさい！お疲れさま',
    stageAria: '電光掲示板のプレビュー',
    textLabel: '表示する文字',
    textPlaceholder: 'ここに文字を入力',
    fullscreen: '全画面で表示',
    copyLink: '共有リンクをコピー',
    share: '共有',
    landscapeHint: '全画面ではスマホを横向きにすると文字が最大になります。画面をタップすると「全画面を終了」ボタンが出ます。',
    motion: '表示方法',
    dirs: { left: '左へ流す', right: '右へ流す', static: '中央に固定' },
    textColor: '文字の色',
    bgColor: '背景の色',
    customText: '文字の色を自由に選ぶ',
    customBg: '背景の色を自由に選ぶ',
    colors: {
      red: '赤',
      orange: 'オレンジ',
      yellow: '黄',
      green: '緑',
      cyan: '水色',
      pink: 'ピンク',
      white: '白',
      black: '黒',
      navy: '紺',
      purple: '紫',
    },
    speed: '流れる速さ',
    size: '文字の大きさ',
    blink: '点滅',
    dots: 'LED ドット表示',
    mirror: '左右反転',
    lowContrast: '文字と背景の色が近く、離れると読みにくくなります。差がはっきりした色に変えてみてください。',
    tip: '画面をタップするとボタンを表示・非表示',
    rotate: '向きを変える',
    exitFullscreen: '全画面を終了',
    saveHint: '設定はこのブラウザにだけ保存されます。共有リンクでは文字を URL の「#」より後ろに入れるため、この部分はサーバーに送られません。',
    client: {
      fill: '高さいっぱい',
      percent: '{n}%',
      copied: 'コピーしました',
      shareTitle: 'スマホ電光掲示板',
    },
  },
});
