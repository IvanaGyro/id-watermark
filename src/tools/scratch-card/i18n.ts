import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { CoverId, PresetId, ThemeId } from './logic';

export interface PresetText {
  label: string;
  title: string;
  /** Message presets. */
  message?: string;
  /** Prize presets: one result per entry. */
  prizes?: string[];
}

export interface Strings {
  presetsLabel: string;
  modeLabel: string;
  modeMessage: string;
  modePrize: string;
  messageLabel: string;
  messagePlaceholder: string;
  prizesLabel: string;
  prizesPlaceholder: string;
  /** Says plainly that the result is drawn again every time the link is opened. */
  prizeNote: string;
  titleLabel: string;
  titlePlaceholder: string;
  fromLabel: string;
  fromPlaceholder: string;
  coverLabel: string;
  covers: Record<CoverId, string>;
  themeLabel: string;
  themes: Record<ThemeId, string>;
  /** Text around the threshold percentage: before + 50 + after. */
  thresholdBefore: string;
  thresholdAfter: string;
  thresholdHint: string;
  previewLabel: string;
  resetCover: string;
  shareHeading: string;
  linkLabel: string;
  copyLink: string;
  share: string;
  openLink: string;
  qrCaption: string;
  qrDownload: string;
  qrAria: string;
  privacyNote: string;
  draftHint: string;
  invalidLink: string;
  scratchHint: string;
  revealAll: string;
  makeOwn: string;
  prizeRecipientNote: string;
  canvasAria: string;
  client: {
    presets: Record<PresetId, PresetText>;
    /** Printed on the scratch layer. */
    scratchHere: string;
    /** Heading on a received card without a title. */
    defaultTitle: string;
    /** {name} = sender. */
    fromLine: string;
    previewEmpty: string;
    previewNeedPrizes: string;
    errorEmpty: string;
    errorPrizes: string;
    /** {n} results, {max} = limit. */
    prizesCount: PluralForms;
    /** {n} lines over the {max} limit. */
    prizesOverflow: string;
    qrTooLong: string;
    /** Web Share title, {name} = sender. */
    shareTitle: string;
    shareTitleAnon: string;
    shareText: string;
    /** Screen reader announcement, {text} = what was under the layer. */
    revealed: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    presetsLabel: '快速套用',
    modeLabel: '刮開後顯示',
    modeMessage: '一則訊息',
    modePrize: '隨機抽獎',
    messageLabel: '刮開後的訊息',
    messagePlaceholder: '寫下想藏起來的話，可以換行',
    prizesLabel: '可能的結果（每行一個）',
    prizesPlaceholder: '頭獎：禮券 1,000 元\n二獎：電影票 2 張\n銘謝惠顧',
    prizeNote:
      '每次打開連結都會重新隨機抽出一個結果，重新整理也會重抽，適合好玩的小遊戲，不適合正式抽獎。想提高某個結果的機率，就多寫幾行一樣的。',
    titleLabel: '卡片標題（選填）',
    titlePlaceholder: '給你的驚喜',
    fromLabel: '署名（選填）',
    fromPlaceholder: '例如：小明',
    coverLabel: '刮層樣式',
    covers: { silver: '銀色', gold: '金色', rose: '玫瑰粉', mint: '薄荷綠', hearts: '愛心', stars: '星星' },
    themeLabel: '卡片底色',
    themes: { cream: '奶油', blush: '粉紅', sky: '天空藍', mint: '薄荷', lilac: '薰衣草', night: '夜空' },
    thresholdBefore: '刮開 ',
    thresholdAfter: '% 就自動揭曉',
    thresholdHint: '比例越低越快揭曉，對方也可以直接按「全部刮開」。',
    previewLabel: '預覽：先刮刮看',
    resetCover: '重新蓋上',
    shareHeading: '傳給對方',
    linkLabel: '卡片連結',
    copyLink: '複製連結',
    share: '分享',
    openLink: '開啟看看',
    qrCaption: '對方也可以用手機掃描這個 QR Code 打開卡片。',
    qrDownload: '下載 QR Code',
    qrAria: '卡片連結的 QR Code',
    privacyNote: '卡片內容直接寫在連結裡，不會上傳到任何伺服器；但拿到連結的人都能打開來看，請只傳給你想給的人。',
    draftHint: '草稿只存在這個瀏覽器，下次打開會自動帶入。',
    invalidLink:
      '這個刮刮卡連結不完整或已損壞，打不開。可能是複製時少了一段，請向對方要完整的連結，或自己做一張新的。',
    scratchHint: '用手指或滑鼠刮開塗層',
    revealAll: '全部刮開',
    makeOwn: '我也要做一張',
    prizeRecipientNote: '結果是打開卡片時隨機抽出的。',
    canvasAria: '刮刮卡塗層，用手指或滑鼠刮開，也可以按「全部刮開」',
    client: {
      presets: {
        confession: { label: '告白', title: '有句話想跟你說', message: '我喜歡你很久了，\n可以跟我交往嗎？' },
        birthday: { label: '生日驚喜', title: '生日快樂', message: '生日快樂！\n今晚的大餐我請客' },
        gender: { label: '性別揭曉', title: '寶寶是男生還是女生？', message: '是女生！' },
        prize: {
          label: '抽獎',
          title: '刮刮樂試手氣',
          prizes: ['頭獎：禮券 1,000 元', '二獎：電影票 2 張', '三獎：手搖飲 1 杯', '銘謝惠顧', '銘謝惠顧'],
        },
        proposal: { label: '求婚', title: '先深呼吸，再慢慢刮', message: '你願意\n和我共度餘生嗎？' },
        news: { label: '好消息', title: '有個好消息要告訴你', message: '我錄取了！\n下個月開始上班' },
      },
      scratchHere: '刮開這裡',
      defaultTitle: '你收到一張刮刮卡',
      fromLine: '來自 {name}',
      previewEmpty: '先寫下要藏起來的訊息',
      previewNeedPrizes: '至少寫 2 個結果',
      errorEmpty: '寫下要藏起來的訊息後，就能產生連結。',
      errorPrizes: '至少要有 2 個結果才能隨機抽。',
      prizesCount: { other: '{n} 個結果（最多 {max} 個）' },
      prizesOverflow: '超過 {max} 個，多出的 {n} 行不會放進卡片。',
      qrTooLong: '內容太長，無法做成 QR Code，請直接傳連結。',
      shareTitle: '{name} 送你一張刮刮卡',
      shareTitleAnon: '送你一張刮刮卡',
      shareText: '刮開看看裡面寫了什麼',
      revealed: '刮開了：{text}',
    },
  },
  en: {
    presetsLabel: 'Start from an idea',
    modeLabel: 'Under the scratch layer',
    modeMessage: 'A message',
    modePrize: 'A random prize',
    messageLabel: 'Hidden message',
    messagePlaceholder: 'Write what you want to hide. Line breaks are fine.',
    prizesLabel: 'Possible results (one per line)',
    prizesPlaceholder: 'Grand prize: $50 gift card\nMovie night for two\nBetter luck next time',
    prizeNote:
      'A new result is drawn at random every time the link is opened, reloads included. Great for a fun game, not for an official giveaway. List a result twice to make it twice as likely.',
    titleLabel: 'Card title (optional)',
    titlePlaceholder: 'A surprise for you',
    fromLabel: 'From (optional)',
    fromPlaceholder: 'e.g. Alex',
    coverLabel: 'Scratch layer',
    covers: { silver: 'Silver', gold: 'Gold', rose: 'Rose', mint: 'Mint', hearts: 'Hearts', stars: 'Stars' },
    themeLabel: 'Card color',
    themes: { cream: 'Cream', blush: 'Blush', sky: 'Sky', mint: 'Mint', lilac: 'Lilac', night: 'Night' },
    thresholdBefore: 'Reveal automatically at ',
    thresholdAfter: '% scratched',
    thresholdHint: 'A lower number reveals sooner. The recipient can also tap “Reveal all”.',
    previewLabel: 'Preview: try scratching it',
    resetCover: 'Cover again',
    shareHeading: 'Send it',
    linkLabel: 'Card link',
    copyLink: 'Copy link',
    share: 'Share',
    openLink: 'Open it',
    qrCaption: 'They can also scan this QR code with a phone to open the card.',
    qrDownload: 'Download QR code',
    qrAria: 'QR code of the card link',
    privacyNote:
      'The card lives inside the link itself and is never uploaded. Anyone who has the link can open it, so only send it to the people you mean it for.',
    draftHint: 'Your draft is saved in this browser only and comes back next time.',
    invalidLink:
      'This scratch card link is incomplete or damaged, so it can’t be opened. Part of it may have been cut off when it was copied. Ask the sender for the full link, or make a card of your own.',
    scratchHint: 'Scratch the layer with your finger or mouse',
    revealAll: 'Reveal all',
    makeOwn: 'Make your own card',
    prizeRecipientNote: 'The result was drawn at random when you opened the card.',
    canvasAria: 'Scratch-off layer. Scratch it with your finger or mouse, or use “Reveal all”.',
    client: {
      presets: {
        confession: { label: 'Confession', title: 'I have something to tell you', message: 'I really like you.\nWill you go out with me?' },
        birthday: { label: 'Birthday', title: 'Happy birthday', message: 'Happy birthday!\nDinner tonight is on me.' },
        gender: { label: 'Gender reveal', title: 'Boy or girl?', message: 'It’s a girl!' },
        prize: {
          label: 'Prize draw',
          title: 'Lucky scratch card',
          prizes: ['Grand prize: $50 gift card', 'Movie night for two', 'Free coffee', 'Better luck next time', 'Better luck next time'],
        },
        proposal: { label: 'Proposal', title: 'Take a deep breath first', message: 'Will you marry me?' },
        news: { label: 'Big news', title: 'I have some big news', message: 'We’re having a baby!' },
      },
      scratchHere: 'Scratch here',
      defaultTitle: 'You got a scratch card',
      fromLine: 'From {name}',
      previewEmpty: 'Write your hidden message first',
      previewNeedPrizes: 'Add at least 2 results',
      errorEmpty: 'Write a hidden message to get a link.',
      errorPrizes: 'Add at least 2 results to draw from.',
      prizesCount: { one: '{n} result (up to {max})', other: '{n} results (up to {max})' },
      prizesOverflow: 'Only the first {max} are used; {n} more lines are left out.',
      qrTooLong: 'This card is too long for a QR code. Send the link instead.',
      shareTitle: '{name} sent you a scratch card',
      shareTitleAnon: 'A scratch card for you',
      shareText: 'Scratch it to see what it says.',
      revealed: 'Revealed: {text}',
    },
  },
  ja: {
    presetsLabel: 'テンプレート',
    modeLabel: '削ると出てくるもの',
    modeMessage: 'メッセージ',
    modePrize: 'ランダム抽選',
    messageLabel: '隠すメッセージ',
    messagePlaceholder: '伝えたいことを書いてください。改行もできます',
    prizesLabel: '結果の候補（1行に1つ）',
    prizesPlaceholder: '1等：ギフト券 3,000円\n2等：映画チケット 2枚\nはずれ',
    prizeNote:
      'リンクを開くたびに候補からランダムで1つが選ばれます（再読み込みでも選び直し）。ちょっとした遊び向けで、正式な抽選には向きません。同じ結果を2行書くと、出る確率が2倍になります。',
    titleLabel: 'カードのタイトル（任意）',
    titlePlaceholder: 'あなたへのサプライズ',
    fromLabel: '差出人（任意）',
    fromPlaceholder: '例：たかし',
    coverLabel: '削る部分のデザイン',
    covers: { silver: 'シルバー', gold: 'ゴールド', rose: 'ローズ', mint: 'ミント', hearts: 'ハート', stars: '星' },
    themeLabel: 'カードの色',
    themes: { cream: 'クリーム', blush: 'ピンク', sky: 'スカイ', mint: 'ミント', lilac: 'すみれ', night: 'ナイト' },
    thresholdBefore: '',
    thresholdAfter: '% 削ったら自動で全部表示',
    thresholdHint: '数字が小さいほど早く表示されます。受け取った人は「全部削る」ボタンでも見られます。',
    previewLabel: 'プレビュー（試しに削れます）',
    resetCover: 'もう一度覆う',
    shareHeading: '相手に送る',
    linkLabel: 'カードのリンク',
    copyLink: 'リンクをコピー',
    share: '共有',
    openLink: '開いてみる',
    qrCaption: 'スマホでこの QR コードを読み取っても開けます。',
    qrDownload: 'QR コードを保存',
    qrAria: 'カードのリンクの QR コード',
    privacyNote:
      'カードの内容はリンクの中に入っていて、サーバーには送信されません。ただし、リンクを知っている人なら誰でも開けるので、送りたい相手にだけ送ってください。',
    draftHint: '下書きはこのブラウザにだけ保存され、次に開いたときに戻ります。',
    invalidLink:
      'このスクラッチカードのリンクは途中で切れているか壊れているため、開けません。コピーするときに一部が欠けた可能性があります。送った人に完全なリンクをもらうか、自分で新しいカードを作ってみてください。',
    scratchHint: '指やマウスで削ってください',
    revealAll: '全部削る',
    makeOwn: '自分も作ってみる',
    prizeRecipientNote: '結果はカードを開いたときにランダムで選ばれました。',
    canvasAria: 'スクラッチ部分。指やマウスで削るか、「全部削る」ボタンを押してください',
    client: {
      presets: {
        confession: { label: '告白', title: '伝えたいことがあります', message: 'ずっと好きでした。\n付き合ってください。' },
        birthday: { label: '誕生日', title: 'お誕生日おめでとう', message: 'お誕生日おめでとう！\n今夜のごはんはごちそうするね' },
        gender: { label: '性別発表', title: '男の子？女の子？', message: '女の子です！' },
        prize: {
          label: 'くじ引き',
          title: '運だめしスクラッチ',
          prizes: ['1等：ギフト券 3,000円', '2等：映画チケット 2枚', '3等：コーヒー 1杯', 'はずれ', 'はずれ'],
        },
        proposal: { label: 'プロポーズ', title: '深呼吸してから削ってね', message: '結婚してください。' },
        news: { label: 'うれしい報告', title: 'うれしいお知らせがあります', message: '合格しました！' },
      },
      scratchHere: 'ここを削ってね',
      defaultTitle: 'スクラッチカードが届きました',
      fromLine: '{name} より',
      previewEmpty: '先に隠すメッセージを書いてください',
      previewNeedPrizes: '結果を2つ以上書いてください',
      errorEmpty: '隠すメッセージを書くとリンクができます。',
      errorPrizes: '抽選するには結果が2つ以上必要です。',
      prizesCount: { other: '{n}件（最大 {max}件）' },
      prizesOverflow: '使われるのは最初の {max}件までです。残りの {n}行は入りません。',
      qrTooLong: '内容が長すぎて QR コードにできません。リンクを送ってください。',
      shareTitle: '{name} からスクラッチカードが届きました',
      shareTitleAnon: 'スクラッチカードが届きました',
      shareText: '削って中身を見てみてください',
      revealed: '表示されました：{text}',
    },
  },
});
