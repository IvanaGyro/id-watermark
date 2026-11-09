import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { Mode } from './logic';

export interface Strings {
  namesLabel: string;
  namesPlaceholder: string;
  sample: string;
  modeLabel: string;
  modes: Record<Mode, { title: string; desc: string }>;
  excludeSummary: string;
  excludeHint: string;
  excludeFirst: string;
  excludeSecond: string;
  excludeAdd: string;
  detailsSummary: string;
  detailsHint: string;
  titleLabel: string;
  titlePlaceholder: string;
  budgetLabel: string;
  budgetPlaceholder: string;
  dateLabel: string;
  noteLabel: string;
  notePlaceholder: string;
  start: string;
  privacyNote: string;
  linksHeading: string;
  linksNote: string;
  copyAll: string;
  copyAllHint: string;
  copyOne: string;
  share: string;
  organizerSummary: string;
  organizerHint: string;
  copyResults: string;
  handoffLead: string;
  handoffNote: string;
  boardAria: string;
  revealedHeading: string;
  tapToOpen: string;
  scratchHint: string;
  revealAll: string;
  canvasAria: string;
  makeOwn: string;
  doneHeading: string;
  client: {
    sampleNames: string[];
    count: PluralForms;
    errorFew: string;
    errorMany: string;
    errorDuplicate: string;
    errorImpossible: string;
    invalidLink: string;
    excludeNeedTwo: string;
    pairLabel: string;
    removePair: string;
    linksProgress: string;
    inviteMessage: string;
    copyAllLine: string;
    shareTitle: string;
    /** Offer a LINE button on each link: LINE is the default chat app in this market. */
    line: boolean;
    defaultTitle: string;
    progress: string;
    handoffGo: string;
    skip: string;
    pickLead: string;
    boxAria: string;
    giveTitle: string;
    getTitle: string;
    getMessage: string;
    nextPass: string;
    lastPass: string;
    nextStage: string;
    lastStage: string;
    rowGive: string;
    rowGet: string;
    donePass: string;
    doneStage: string;
    resultsReveal: string;
    resultsAll: string;
    redraw: string;
    redrawArm: string;
    inviteHello: string;
    inviteWarn: string;
    budgetFact: string;
    dateFact: string;
    noteFact: string;
    revealed: string;
    scratchHere: string;
    fullscreen: string;
    exitFullscreen: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    namesLabel: '參加名單',
    namesPlaceholder: '一行一個名字，例如：\n小明\n小美\n阿傑\n雅婷',
    sample: '填入範例',
    modeLabel: '怎麼抽',
    modes: {
      link: { title: '傳連結各自抽', desc: '每人一條專屬連結，刮開才知道要送給誰。還沒見面也能抽。' },
      pass: { title: '手機輪流抽', desc: '大家在現場，手機傳一圈。每人只看到自己抽到誰。' },
      stage: { title: '大螢幕公開抽', desc: '聚會當場交換禮物。投影或圍著看，一個一個揭曉。' },
    },
    excludeSummary: '有人不想抽到彼此？（選填）',
    excludeHint: '情侶、夫妻或家人可以設成不互抽，兩個人就不會抽到對方。',
    excludeFirst: '第一個人',
    excludeSecond: '第二個人',
    excludeAdd: '設為不互抽',
    detailsSummary: '加上活動資訊（選填）',
    detailsHint: '大家看到結果時，也會看到這些資訊。',
    titleLabel: '活動名稱',
    titlePlaceholder: '公司聖誕交換禮物',
    budgetLabel: '預算',
    budgetPlaceholder: '500 元以內',
    dateLabel: '交換日期',
    noteLabel: '備註',
    notePlaceholder: '當天請包好帶到公司',
    start: '開始抽籤',
    privacyNote: '不用註冊。名單和結果只存在這台裝置與連結裡，不會傳到本站伺服器。',
    linksHeading: '連結準備好了',
    linksNote: '每個人的連結都不一樣，請傳給本人。畫面不會顯示誰抽到誰，主辦人也能一起抽。',
    copyAll: '複製全部連結',
    copyAllHint: '貼到群組最省事，但點到別人的連結就會看到別人的結果。',
    copyOne: '複製邀請',
    share: '分享',
    organizerSummary: '主辦人沒參加？查看全部結果',
    organizerHint: '打開就會看到所有人的結果。如果你也要抽，請不要打開。',
    copyResults: '複製結果',
    handoffLead: '請把手機交給',
    handoffNote: '其他人先別看畫面，才不會破壞驚喜。',
    boardAria: '選一個禮物盒',
    revealedHeading: '已揭曉',
    tapToOpen: '點一下拆開',
    scratchHint: '用手指或滑鼠刮開塗層',
    revealAll: '全部刮開',
    canvasAria: '刮開塗層就能看到結果，用手指或滑鼠刮開，也可以按「全部刮開」',
    makeOwn: '我也要辦一場',
    doneHeading: '全部抽完了',
    client: {
      sampleNames: ['小明', '小美', '阿傑', '雅婷', '志豪', '怡君'],
      count: { other: '{n} 人' },
      errorFew: '至少要 {min} 個人才能抽籤。',
      errorMany: '最多 {max} 人，目前有 {n} 人。',
      errorDuplicate: '「{names}」重複了，請改成不同的名字，例如加上姓氏。',
      errorImpossible: '「不互抽」設太多組，沒辦法讓每個人都抽到對象。請移除幾組再試一次。',
      invalidLink: '這條抽籤連結不完整，請主辦人重新傳一次。',
      excludeNeedTwo: '請選兩個不同的人。',
      pairLabel: '{a} 和 {b}',
      removePair: '移除 {pair}',
      linksProgress: '已傳給 {done} / {total} 人',
      inviteMessage: '{name}，交換禮物抽籤來了！這是你的專屬連結，刮開就知道要送給誰，不要給別人看喔：\n{url}',
      copyAllLine: '{name}：{url}',
      shareTitle: '交換禮物抽籤',
      line: true,
      defaultTitle: '交換禮物抽籤',
      progress: '第 {current} / {total} 位',
      handoffGo: '我是 {name}，開始抽',
      skip: '{name} 不在，先跳過',
      pickLead: '{name}，選一個禮物盒',
      boxAria: '禮物盒 {n}',
      giveTitle: '{name}，你要送禮物給',
      getTitle: '{name} 拿到',
      getMessage: '{target}\n準備的禮物',
      nextPass: '記住了，換下一位',
      lastPass: '記住了，結束抽籤',
      nextStage: '下一位',
      lastStage: '看全部結果',
      rowGive: '{from} 送給 {to}',
      rowGet: '{from} 拿到 {to} 的禮物',
      donePass: '大家都知道要送給誰了。想保留驚喜，就等交換那天再公布。',
      doneStage: '每個人都拿到禮物了，沒有人抽到自己。',
      resultsReveal: '公布全部結果',
      resultsAll: '全部結果',
      redraw: '重新抽籤',
      redrawArm: '再按一次確認，這次結果會作廢',
      inviteHello: '{name}，你的交換禮物籤來了',
      inviteWarn: '這是 {name} 的專屬連結。如果你不是 {name}，請先別拆，才不會破壞驚喜。',
      budgetFact: '預算',
      dateFact: '交換日期',
      noteFact: '備註',
      revealed: '揭曉：{text}',
      scratchHere: '刮開這裡',
      fullscreen: '全螢幕',
      exitFullscreen: '離開全螢幕',
    },
  },
  en: {
    namesLabel: 'Participants',
    namesPlaceholder: 'One name per line, for example:\nAlex\nSam\nJordan\nTaylor',
    sample: 'Use sample names',
    modeLabel: 'How do you want to draw?',
    modes: {
      link: { title: 'Send private links', desc: 'Everyone gets their own link and scratches it to see who they’re buying for. No need to meet first.' },
      pass: { title: 'Pass the phone', desc: 'Everyone is in the room. Hand the phone around, and each person sees only their own match.' },
      stage: { title: 'Reveal on the big screen', desc: 'For swapping gifts on the spot. Project it or gather round and reveal one by one.' },
    },
    excludeSummary: 'Anyone who shouldn’t draw each other? (optional)',
    excludeHint: 'Keep couples or family members apart, so neither one draws the other.',
    excludeFirst: 'First person',
    excludeSecond: 'Second person',
    excludeAdd: 'Keep apart',
    detailsSummary: 'Add event details (optional)',
    detailsHint: 'Everyone sees these details along with their result.',
    titleLabel: 'Event name',
    titlePlaceholder: 'Office Secret Santa',
    budgetLabel: 'Budget',
    budgetPlaceholder: 'Up to $25',
    dateLabel: 'Exchange date',
    noteLabel: 'Note',
    notePlaceholder: 'Bring your gift wrapped',
    start: 'Start the draw',
    privacyNote: 'No sign-up. Names and results stay on this device and inside the links, and never reach our server.',
    linksHeading: 'Your links are ready',
    linksNote: 'Each person has a different link, so send it to them directly. This screen never shows who drew whom, so the organizer can play too.',
    copyAll: 'Copy all links',
    copyAllHint: 'Pasting them in a group chat is easiest, but opening someone else’s link shows their result.',
    copyOne: 'Copy invite',
    share: 'Share',
    organizerSummary: 'Not playing? See all results',
    organizerHint: 'This shows everyone’s result. If you’re in the draw too, leave it closed.',
    copyResults: 'Copy results',
    handoffLead: 'Hand the phone to',
    handoffNote: 'Everyone else, look away so the surprise holds.',
    boardAria: 'Pick a gift box',
    revealedHeading: 'Revealed so far',
    tapToOpen: 'Tap to unwrap',
    scratchHint: 'Scratch the layer with your finger or mouse',
    revealAll: 'Reveal all',
    canvasAria: 'Scratch-off layer hiding your result. Scratch it with your finger or mouse, or use “Reveal all”.',
    makeOwn: 'Start your own draw',
    doneHeading: 'That’s everyone!',
    client: {
      sampleNames: ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Riley'],
      count: { one: '{n} person', other: '{n} people' },
      errorFew: 'You need at least {min} people for a draw.',
      errorMany: 'The limit is {max} people, and you have {n}.',
      errorDuplicate: '“{names}” appears more than once. Use different names, for example by adding a last name.',
      errorImpossible: 'Too many people are kept apart, so not everyone can get a match. Remove a few pairs and try again.',
      invalidLink: 'This draw link is incomplete. Ask the organizer to send it again.',
      excludeNeedTwo: 'Choose two different people.',
      pairLabel: '{a} and {b}',
      removePair: 'Remove {pair}',
      linksProgress: 'Sent to {done} of {total}',
      inviteMessage: '{name}, it’s time for our gift exchange! This link is just for you. Scratch it to see who you’re buying for, and keep it secret:\n{url}',
      copyAllLine: '{name}: {url}',
      shareTitle: 'Secret Santa draw',
      line: false,
      defaultTitle: 'Secret Santa draw',
      progress: 'Person {current} of {total}',
      handoffGo: 'I’m {name}, let’s draw',
      skip: '{name} isn’t here, skip for now',
      pickLead: '{name}, pick a gift box',
      boxAria: 'Gift box {n}',
      giveTitle: '{name}, you’re buying for',
      getTitle: '{name} gets',
      getMessage: 'the gift from\n{target}',
      nextPass: 'Got it, next person',
      lastPass: 'Got it, finish the draw',
      nextStage: 'Next person',
      lastStage: 'See all results',
      rowGive: '{from} buys for {to}',
      rowGet: '{from} gets the gift from {to}',
      donePass: 'Everyone knows who they’re buying for. To keep the surprise, save the full list for exchange day.',
      doneStage: 'Everyone has a gift, and nobody drew themselves.',
      resultsReveal: 'Reveal all results',
      resultsAll: 'All results',
      redraw: 'Draw again',
      redrawArm: 'Press again to confirm. These results will be void',
      inviteHello: '{name}, your gift exchange draw is here',
      inviteWarn: 'This link is just for {name}. If you’re not {name}, please don’t open it and spoil the surprise.',
      budgetFact: 'Budget',
      dateFact: 'Exchange date',
      noteFact: 'Note',
      revealed: 'Revealed: {text}',
      scratchHere: 'Scratch here',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
    },
  },
  ja: {
    namesLabel: '参加者',
    namesPlaceholder: '1 行に 1 人ずつ入力してください。例：\nたろう\nはなこ\nけんた\nゆい',
    sample: 'サンプルを入れる',
    modeLabel: 'くじの引き方',
    modes: {
      link: { title: 'リンクを送って各自で引く', desc: '一人ずつ専用リンクを送ります。削ると贈る相手がわかります。集まる前でも使えます。' },
      pass: { title: 'スマホを回して引く', desc: 'みんなが同じ場所にいるときに。スマホを順に回し、自分の結果だけを確認します。' },
      stage: { title: '大画面でみんなで引く', desc: 'その場でプレゼントを交換するときに。画面を囲んで一人ずつ発表します。' },
    },
    excludeSummary: 'お互いに当たらないようにしたい人はいますか？（任意）',
    excludeHint: 'カップルや家族を指定すると、その 2 人はお互いに当たりません。',
    excludeFirst: '1 人目',
    excludeSecond: '2 人目',
    excludeAdd: '当たらないようにする',
    detailsSummary: 'イベント情報を追加（任意）',
    detailsHint: '結果と一緒に全員に表示されます。',
    titleLabel: 'イベント名',
    titlePlaceholder: 'クリスマス会のプレゼント交換',
    budgetLabel: '予算',
    budgetPlaceholder: '1,000 円まで',
    dateLabel: '交換日',
    noteLabel: 'メモ',
    notePlaceholder: '当日はラッピングして持ってきてください',
    start: 'くじを始める',
    privacyNote: '登録は不要です。名前と結果はこの端末とリンクの中だけにあり、当サイトのサーバーには送信されません。',
    linksHeading: 'リンクができました',
    linksNote: 'リンクは一人ずつ異なるので、本人に送ってください。誰が誰に当たったかはこの画面に表示されないため、幹事も一緒に参加できます。',
    copyAll: 'すべてのリンクをコピー',
    copyAllHint: 'グループに貼るのが手軽ですが、他の人のリンクを開くとその人の結果が見えてしまいます。',
    copyOne: '招待をコピー',
    share: '共有',
    organizerSummary: '幹事は参加しない場合：全員の結果を見る',
    organizerHint: '開くと全員の結果が表示されます。自分も参加する場合は開かないでください。',
    copyResults: '結果をコピー',
    handoffLead: 'この人にスマホを渡してください',
    handoffNote: '他の人は画面を見ないでくださいね。',
    boardAria: 'プレゼントを選ぶ',
    revealedHeading: '発表済み',
    tapToOpen: 'タップして開ける',
    scratchHint: '指やマウスで削ってください',
    revealAll: '全部削る',
    canvasAria: '結果を隠すスクラッチ部分。指やマウスで削るか、「全部削る」ボタンを押してください',
    makeOwn: '自分もくじを作る',
    doneHeading: '全員引き終わりました',
    client: {
      sampleNames: ['たろう', 'はなこ', 'けんた', 'ゆい', 'そうた', 'みさき'],
      count: { other: '{n} 人' },
      errorFew: 'くじには {min} 人以上必要です。',
      errorMany: '上限は {max} 人です。現在 {n} 人います。',
      errorDuplicate: '「{names}」が重複しています。名字を付けるなどして区別してください。',
      errorImpossible: '「当たらない組み合わせ」が多すぎて、全員に相手を割り当てられません。いくつか削除してください。',
      invalidLink: 'このリンクは不完全です。幹事にもう一度送ってもらってください。',
      excludeNeedTwo: '異なる 2 人を選んでください。',
      pairLabel: '{a} と {b}',
      removePair: '{pair} を削除',
      linksProgress: '{total} 人中 {done} 人に送信済み',
      inviteMessage: '{name}さん、プレゼント交換のくじです。あなた専用のリンクなので、他の人には見せないでくださいね。削ると贈る相手がわかります。\n{url}',
      copyAllLine: '{name}：{url}',
      shareTitle: 'プレゼント交換くじ引き',
      line: true,
      defaultTitle: 'プレゼント交換くじ引き',
      progress: '{total} 人中 {current} 人目',
      handoffGo: '{name}です、くじを引く',
      skip: '{name}さんは不在なので後にする',
      pickLead: '{name}さん、プレゼントを選んでください',
      boxAria: 'プレゼント {n}',
      giveTitle: '{name}さんがプレゼントを贈る相手は',
      getTitle: '{name}さんが受け取るのは',
      getMessage: '{target}さんの\nプレゼント',
      nextPass: '覚えた、次の人へ',
      lastPass: '覚えた、くじを終える',
      nextStage: '次の人へ',
      lastStage: '全員の結果を見る',
      rowGive: '{from} → {to}',
      rowGet: '{from} は {to} のプレゼントを受け取る',
      donePass: '全員が贈る相手を確認しました。お楽しみのために、全員の結果は交換の日まで取っておきましょう。',
      doneStage: '全員にプレゼントが行き渡りました。自分のプレゼントに当たった人はいません。',
      resultsReveal: '全員の結果を発表する',
      resultsAll: '全員の結果',
      redraw: 'くじを引き直す',
      redrawArm: 'もう一度押すと確定します。今回の結果は無効になります',
      inviteHello: '{name}さん、プレゼント交換のくじが届きました',
      inviteWarn: 'これは{name}さん専用のリンクです。ご本人でなければ、開けないでください。',
      budgetFact: '予算',
      dateFact: '交換日',
      noteFact: 'メモ',
      revealed: '結果：{text}',
      scratchHere: 'ここを削ってね',
      fullscreen: '全画面',
      exitFullscreen: '全画面を終了',
    },
  },
});
