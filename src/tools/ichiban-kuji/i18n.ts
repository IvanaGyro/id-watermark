import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { PresetId } from './logic';

export interface Strings {
  setupSummary: string;
  setupHint: string;
  presetsLabel: string;
  presetNames: Record<PresetId, string>;
  titleLabel: string;
  titlePlaceholder: string;
  thTier: string;
  thPrize: string;
  thCount: string;
  addTier: string;
  lastCheck: string;
  lastNamePlaceholder: string;
  priceLabel: string;
  /** Text before / after the price input, e.g. NT$ … or … 円. */
  pricePrefix: string;
  priceSuffix: string;
  apply: string;
  playerLabel: string;
  playerPlaceholder: string;
  draw1: string;
  draw5: string;
  draw10: string;
  drawAll: string;
  undo: string;
  reshuffle: string;
  effects: string;
  sound: string;
  boardHint: string;
  boardAria: string;
  statusTitle: string;
  thLeft: string;
  thNext: string;
  calcTitle: string;
  calcTier: string;
  calcDraws: string;
  fairTitle: string;
  fairHint: string;
  hashLabel: string;
  copyHash: string;
  revealBtn: string;
  revealedLabel: string;
  copyList: string;
  /** Text around the link to the hash generator. */
  verifyBefore: string;
  verifyLink: string;
  verifyAfter: string;
  historyTitle: string;
  copyHistory: string;
  historyEmpty: string;
  playersTitle: string;
  resultClose: string;
  client: {
    lastLabel: string;
    /** Fallback heading when the board has no title. */
    defaultTitle: string;
    /** {left} of {total} tickets left. */
    left: string;
    done: string;
    /** {n} tickets in the setup. */
    total: PluralForms;
    /** Ticket aria labels; {n} = number, {label} = tier. */
    ticketClosed: string;
    ticketOpen: string;
    ticketPeek: string;
    /** {n} = ticket number. */
    ticketNo: string;
    resultOne: string;
    /** {n} draws at once. */
    resultMany: string;
    /** {name} = Last One prize. */
    lastWin: string;
    removeTier: string;
    labelAria: string;
    prizeAria: string;
    countAria: string;
    prizePlaceholder: string;
    errorEmpty: string;
    /** {max} limit, {n} current. */
    errorTooMany: string;
    confirm: string;
    /** {n} draws, {money} spent. */
    spend: PluralForms;
    /** {n} tickets left, {money} to buy them all. */
    spendLeft: PluralForms;
    /** {n} = formatted amount. */
    money: string;
    /** {money} = price per draw. */
    perDraw: string;
    calcChance: string;
    calcExpected: string;
    calcGuarantee: string;
    calcGone: string;
    anon: string;
    /** {name}: {n} draws. */
    playerLine: PluralForms;
    /** {title} = board title. */
    copyHeader: string;
    hour12: boolean;
    fullscreen: string;
    exitFullscreen: string;
    /** Screen reader announcement. */
    announce: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    setupSummary: '獎項設定',
    setupHint: '自訂獎項、數量、最後賞與價格',
    presetsLabel: '快速套用',
    presetNames: { standard: '標準一番賞 80 抽', party: '聚會自製 30 抽', mini: '小型 10 抽' },
    titleLabel: '標題',
    titlePlaceholder: '例如：週五直播一番賞',
    thTier: '獎項',
    thPrize: '獎品內容',
    thCount: '數量',
    addTier: '新增獎項',
    lastCheck: '加碼最後賞（抽到最後一張籤的人另外獲得）',
    lastNamePlaceholder: '最後賞內容，例如：特別色公仔',
    priceLabel: '每抽價格（選填，用來計算花費）',
    pricePrefix: 'NT$',
    priceSuffix: '',
    apply: '套用並洗牌',
    playerLabel: '抽獎者（選填）',
    playerPlaceholder: '例如：小明',
    draw1: '抽 1 抽',
    draw5: '連抽 5 抽',
    draw10: '連抽 10 抽',
    drawAll: '全部抽完',
    undo: '復原上一抽',
    reshuffle: '重新洗牌',
    effects: '開獎畫面與特效',
    sound: '音效',
    boardHint: '點任一張籤直接開籤，或用上方按鈕隨機抽。',
    boardAria: '籤板',
    statusTitle: '剩餘獎項',
    thLeft: '剩餘',
    thNext: '下一抽',
    calcTitle: '中獎機率計算',
    calcTier: '想要的獎項',
    calcDraws: '再抽幾抽',
    fairTitle: '公正性驗證（直播、團抽用）',
    fairHint:
      '開抽前把下面的雜湊值公開（例如貼在直播留言或社團貼文），全部抽完後再公開籤表原文。籤表只要改過一個字，雜湊值就會完全不同，大家就能確認籤沒有被偷換。',
    hashLabel: '籤表雜湊值（SHA-256）',
    copyHash: '複製雜湊值',
    revealBtn: '公開籤表',
    revealedLabel: '籤表原文',
    copyList: '複製籤表',
    verifyBefore: '把籤表原文貼到',
    verifyLink: '雜湊產生器',
    verifyAfter: '，算出的 SHA-256 應該和上面的雜湊值一模一樣。',
    historyTitle: '抽獎紀錄',
    copyHistory: '複製紀錄',
    historyEmpty: '還沒有人抽，點一張籤開始吧！',
    playersTitle: '抽獎者統計',
    resultClose: '繼續抽',
    client: {
      lastLabel: '最後賞',
      defaultTitle: '一番賞',
      left: '剩 {left} / {total} 抽',
      done: '全部抽完了！',
      total: { other: '共 {n} 抽' },
      ticketClosed: '第 {n} 號籤，未開',
      ticketOpen: '第 {n} 號籤：{label}',
      ticketPeek: '第 {n} 號籤（未抽）：{label}',
      ticketNo: '第 {n} 號',
      resultOne: '抽中了！',
      resultMany: '連抽 {n} 抽結果',
      lastWin: '再加最後賞：{name}',
      removeTier: '刪除 {label}',
      labelAria: '獎項名稱',
      prizeAria: '{label} 的獎品內容',
      countAria: '{label} 的數量',
      prizePlaceholder: '例如：大型公仔',
      errorEmpty: '至少要有一張籤：請把任一獎項的數量設為 1 以上。',
      errorTooMany: '最多 {max} 張籤，目前共 {n} 張。',
      confirm: '再按一次確認',
      spend: { other: '已抽 {n} 抽，共 {money}' },
      spendLeft: { other: '包台剩下 {n} 抽需 {money}' },
      money: 'NT${n}',
      perDraw: '每抽 {money}',
      calcChance: '至少抽中 1 個 {label} 的機率',
      calcExpected: '平均要抽 {n} 抽才會抽到第一個',
      calcGuarantee: '最壞情況抽 {n} 抽保證抽到',
      calcGone: '{label} 已經被抽走了。',
      anon: '未填名字',
      playerLine: { other: '{name}：{n} 抽' },
      copyHeader: '【{title}】抽獎紀錄',
      hour12: false,
      fullscreen: '全螢幕',
      exitFullscreen: '離開全螢幕',
      announce: '第 {n} 號籤：{label}',
    },
  },
  en: {
    setupSummary: 'Prize setup',
    setupHint: 'Prizes, counts, Last One prize and price',
    presetsLabel: 'Quick presets',
    presetNames: { standard: 'Standard 80 tickets', party: 'Party draw (30)', mini: 'Mini draw (10)' },
    titleLabel: 'Title',
    titlePlaceholder: 'e.g. Friday stream kuji',
    thTier: 'Tier',
    thPrize: 'Prize',
    thCount: 'Count',
    addTier: 'Add tier',
    lastCheck: 'Add a Last One prize (bonus for whoever draws the final ticket)',
    lastNamePlaceholder: 'Last One prize, e.g. special color figure',
    priceLabel: 'Price per draw (optional, for tracking spend)',
    pricePrefix: '$',
    priceSuffix: '',
    apply: 'Apply and shuffle',
    playerLabel: 'Who is drawing (optional)',
    playerPlaceholder: 'e.g. Alex',
    draw1: 'Draw 1',
    draw5: 'Draw 5',
    draw10: 'Draw 10',
    drawAll: 'Draw all',
    undo: 'Undo last draw',
    reshuffle: 'Reshuffle',
    effects: 'Reveal screen and effects',
    sound: 'Sound',
    boardHint: 'Tap any ticket to open it, or use the buttons above to draw at random.',
    boardAria: 'Ticket board',
    statusTitle: 'Prizes left',
    thLeft: 'Left',
    thNext: 'Next',
    calcTitle: 'Odds calculator',
    calcTier: 'Prize you want',
    calcDraws: 'Draws',
    fairTitle: 'Fairness check (for live streams)',
    fairHint:
      'Post the hash below before the first draw, for example in your stream chat. When the board is empty, publish the ticket list. Change a single character and the hash changes completely, so viewers can confirm the tickets were never swapped.',
    hashLabel: 'Ticket list hash (SHA-256)',
    copyHash: 'Copy hash',
    revealBtn: 'Publish ticket list',
    revealedLabel: 'Ticket list',
    copyList: 'Copy list',
    verifyBefore: 'Paste the ticket list into the ',
    verifyLink: 'hash generator',
    verifyAfter: '. Its SHA-256 should match the hash above exactly.',
    historyTitle: 'Draw history',
    copyHistory: 'Copy history',
    historyEmpty: 'Nobody has drawn yet. Pick a ticket to start!',
    playersTitle: 'By player',
    resultClose: 'Keep drawing',
    client: {
      lastLabel: 'Last One',
      defaultTitle: 'Ichiban Kuji',
      left: '{left} of {total} left',
      done: 'All tickets drawn!',
      total: { one: '{n} ticket', other: '{n} tickets' },
      ticketClosed: 'Ticket {n}, unopened',
      ticketOpen: 'Ticket {n}: {label}',
      ticketPeek: 'Ticket {n} (not drawn): {label}',
      ticketNo: 'No. {n}',
      resultOne: 'You got…',
      resultMany: '{n}-draw results',
      lastWin: 'Plus the Last One prize: {name}',
      removeTier: 'Remove {label}',
      labelAria: 'Tier name',
      prizeAria: 'Prize for {label}',
      countAria: 'Count for {label}',
      prizePlaceholder: 'e.g. Large figure',
      errorEmpty: 'Add at least one ticket: set any tier count to 1 or more.',
      errorTooMany: 'Up to {max} tickets; you have {n}.',
      confirm: 'Tap again to confirm',
      spend: { one: '{n} draw so far, {money} spent', other: '{n} draws so far, {money} spent' },
      spendLeft: { one: 'Buying the last ticket costs {money}', other: 'Buying the remaining {n} costs {money}' },
      money: '${n}',
      perDraw: '{money} per draw',
      calcChance: 'Chance of at least one {label}',
      calcExpected: 'On average you get the first one on draw {n}',
      calcGuarantee: 'Worst case: {n} draws guarantee one',
      calcGone: '{label} has already been drawn.',
      anon: 'No name',
      playerLine: { one: '{name}: {n} draw', other: '{name}: {n} draws' },
      copyHeader: '{title}: draw history',
      hour12: true,
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      announce: 'Ticket {n}: {label}',
    },
  },
  ja: {
    setupSummary: '景品の設定',
    setupHint: '賞の内容・本数・ラストワン賞・価格',
    presetsLabel: 'かんたん設定',
    presetNames: { standard: '一番くじ 80 枚', party: 'パーティー用 30 枚', mini: 'ミニ 10 枚' },
    titleLabel: 'タイトル',
    titlePlaceholder: '例：金曜配信のくじ引き',
    thTier: '賞',
    thPrize: '景品',
    thCount: '本数',
    addTier: '賞を追加',
    lastCheck: 'ラストワン賞を付ける（最後の 1 枚を引いた人がもらえます）',
    lastNamePlaceholder: 'ラストワン賞の景品（例：特別カラーフィギュア）',
    priceLabel: '1 回の価格（任意・使った金額の計算用）',
    pricePrefix: '',
    priceSuffix: '円',
    apply: '設定してシャッフル',
    playerLabel: '引く人（任意）',
    playerPlaceholder: '例：たろう',
    draw1: '1 回引く',
    draw5: '5 連',
    draw10: '10 連',
    drawAll: '全部引く',
    undo: '1 回戻す',
    reshuffle: 'シャッフルし直す',
    effects: '結果画面と演出',
    sound: '効果音',
    boardHint: '好きな番号のくじをタップして開けるか、上のボタンでランダムに引きます。',
    boardAria: 'くじの一覧',
    statusTitle: '残りの景品',
    thLeft: '残り',
    thNext: '次の 1 回',
    calcTitle: '当選確率の計算',
    calcTier: '狙う賞',
    calcDraws: 'あと何回',
    fairTitle: '公正さの確認（配信・グループ購入向け）',
    fairHint:
      '引き始める前に下のハッシュ値を公開し（配信のコメント欄など）、全部引き終わったらくじの一覧を公開します。一覧を 1 文字でも書き換えるとハッシュ値はまったく別のものになるので、くじがすり替えられていないことを誰でも確かめられます。',
    hashLabel: 'くじ一覧のハッシュ値（SHA-256）',
    copyHash: 'ハッシュ値をコピー',
    revealBtn: 'くじの一覧を公開',
    revealedLabel: 'くじの一覧',
    copyList: '一覧をコピー',
    verifyBefore: 'くじの一覧を',
    verifyLink: 'ハッシュ生成ツール',
    verifyAfter: 'に貼り付けると、SHA-256 が上のハッシュ値と完全に一致します。',
    historyTitle: '引いた記録',
    copyHistory: '記録をコピー',
    historyEmpty: 'まだ誰も引いていません。くじを 1 枚選んで始めましょう。',
    playersTitle: '引いた人ごとの集計',
    resultClose: '続けて引く',
    client: {
      lastLabel: 'ラストワン賞',
      defaultTitle: '一番くじ',
      left: '残り {left} / {total} 枚',
      done: '全部引き終わりました！',
      total: { other: '合計 {n} 枚' },
      ticketClosed: '{n} 番のくじ（未開封）',
      ticketOpen: '{n} 番のくじ：{label}',
      ticketPeek: '{n} 番のくじ（未抽選）：{label}',
      ticketNo: '{n} 番',
      resultOne: '当たりは…',
      resultMany: '{n} 連の結果',
      lastWin: 'さらにラストワン賞：{name}',
      removeTier: '{label}を削除',
      labelAria: '賞の名前',
      prizeAria: '{label}の景品',
      countAria: '{label}の本数',
      prizePlaceholder: '例：大型フィギュア',
      errorEmpty: 'くじが 1 枚もありません。どれかの賞の本数を 1 以上にしてください。',
      errorTooMany: 'くじは最大 {max} 枚です（現在 {n} 枚）。',
      confirm: 'もう一度押して確定',
      spend: { other: '{n} 回引いて合計 {money}' },
      spendLeft: { other: '残り {n} 枚をすべて買うと {money}' },
      money: '{n} 円',
      perDraw: '1 回 {money}',
      calcChance: '{label}が 1 つ以上当たる確率',
      calcExpected: '最初の 1 つが出るのは平均 {n} 回目',
      calcGuarantee: '最悪でも {n} 回引けば必ず当たる',
      calcGone: '{label}はもう引かれています。',
      anon: '名前なし',
      playerLine: { other: '{name}：{n} 回' },
      copyHeader: '【{title}】引いた記録',
      hour12: false,
      fullscreen: '全画面',
      exitFullscreen: '全画面を終了',
      announce: '{n} 番のくじ：{label}',
    },
  },
});
