import { defineToolI18n } from '../../i18n/tool';
import type { HeadlineTemplates, OrdinalForms, ThemeId } from './logic';

export interface Strings {
  cakeAria: string;
  quickBlow: string;
  tapHint: string;
  micPrivacy: string;
  meterLabel: string;
  relight: string;
  replay: string;
  makeOwn: string;
  invalidLink: string;
  themes: Record<ThemeId, string>;
  maker: {
    title: string;
    name: string;
    namePlaceholder: string;
    age: string;
    ageHint: string;
    message: string;
    messagePlaceholder: string;
    messageHint: string;
    from: string;
    fromPlaceholder: string;
    theme: string;
    linkTitle: string;
    linkLabel: string;
    copy: string;
    share: string;
    preview: string;
    linkPrivacy: string;
    draftHint: string;
  };
  client: {
    /** zh keeps the age and 歲 together with a no-break space. */
    headline: HeadlineTemplates;
    /** {n} = age; only en uses more than one form. */
    ordinal: OrdinalForms;
    /** {from} = sender. */
    fromLine: string;
    fromNone: string;
    /** Signature under the message, {from}. */
    sign: string;
    wish: string;
    listening: string;
    micTip: string;
    talking: string;
    allOut: string;
    micStart: string;
    micStop: string;
    micErrors: Record<'denied' | 'notFound' | 'unsupported' | 'failed', string>;
    mute: string;
    unmute: string;
    shareTitle: string;
    shareText: string;
    /** {n} / {max} characters. */
    counter: string;
    defaultMessage: string;
    copyFailed: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    cakeAria: '生日蛋糕',
    quickBlow: '用按的吹熄',
    tapHint: '沒有麥克風也沒關係：直接點或滑過蠟燭就能吹熄。',
    micPrivacy: '麥克風的聲音只在你的瀏覽器裡即時分析，不會錄音，也不會上傳。',
    meterLabel: '風力',
    relight: '重新點燃蠟燭',
    replay: '再聽一次生日快樂歌',
    makeOwn: '也做一個送給別人',
    invalidLink: '這個生日蛋糕連結打不開，可能複製時少了一段。你可以在下面自己做一個新的。',
    themes: { strawberry: '草莓', chocolate: '巧克力', matcha: '抹茶', vanilla: '香草', blueberry: '藍莓' },
    maker: {
      title: '做一個生日蛋糕',
      name: '壽星的名字',
      namePlaceholder: '例如：小安',
      age: '幾歲（可不填）',
      ageHint: '10 歲以下每歲插一根蠟燭，11 歲起改插數字蠟燭；不填就插 5 根。',
      message: '想說的話',
      messagePlaceholder: '寫下你的生日祝福',
      messageHint: '蠟燭全部吹熄後才會出現。',
      from: '你的名字',
      fromPlaceholder: '例如：阿哲',
      theme: '蛋糕口味',
      linkTitle: '分享連結',
      linkLabel: '生日蛋糕連結',
      copy: '複製連結',
      share: '分享',
      preview: '預覽收到的樣子',
      linkPrivacy:
        '名字和祝福都放在連結的「#」後面，不會傳到伺服器，LINE 等通訊軟體的連結預覽也看不到內容；但拿到連結的人都能打開來看。',
      draftHint: '草稿只存在這個瀏覽器。',
    },
    client: {
      headline: {
        plain: '生日快樂！',
        name: '{name}，生日快樂！',
        age: '{age} 歲生日快樂！',
        nameAge: '{name}，{age} 歲生日快樂！',
      },
      ordinal: { other: '{n}' },
      fromLine: '{from} 送你一個生日蛋糕',
      fromNone: '送你一個生日蛋糕',
      sign: '— {from}',
      wish: '先閉上眼睛許個願，再吹熄蠟燭。',
      listening: '對著麥克風用力吹氣！',
      micTip: '手機的麥克風通常在底部，對著那裡吹最容易吹熄。',
      talking: '聽起來像在說話。對著麥克風「呼——」吹一口長長的氣試試看。',
      allOut: '蠟燭全吹熄了，願望收到！',
      micStart: '開啟麥克風吹蠟燭',
      micStop: '關閉麥克風',
      micErrors: {
        denied: '沒有取得麥克風權限。可以直接點蠟燭吹熄，或在瀏覽器的網站設定允許麥克風後再試一次。',
        notFound: '找不到麥克風。直接點或滑過蠟燭也能吹熄。',
        unsupported: '這個瀏覽器不能使用麥克風（部分 App 的內建瀏覽器會這樣）。可以直接點蠟燭，或改用 Safari、Chrome 開啟連結。',
        failed: '麥克風無法啟動，可能正被其他 App 使用。直接點蠟燭也能吹熄。',
      },
      mute: '靜音',
      unmute: '開啟聲音',
      shareTitle: '送你一個生日蛋糕',
      shareText: '送你一個生日蛋糕，打開來許個願、吹蠟燭吧！',
      counter: '{n} / {max}',
      defaultMessage: '生日快樂！願你新的一歲平安健康，天天都有好事發生。',
      copyFailed: '無法自動複製，請長按上面的連結手動複製。',
    },
  },
  en: {
    cakeAria: 'Birthday cake',
    quickBlow: 'Blow out with a button',
    tapHint: 'No microphone? Tap or swipe across the candles to blow them out.',
    micPrivacy: 'Sound from your microphone is analyzed live in your browser. It is never recorded or uploaded.',
    meterLabel: 'Wind',
    relight: 'Relight the candles',
    replay: 'Play the song again',
    makeOwn: 'Make one for someone',
    invalidLink: 'This birthday cake link can’t be opened. Part of it may have been cut off when it was copied. You can make a new one below.',
    themes: { strawberry: 'Strawberry', chocolate: 'Chocolate', matcha: 'Matcha', vanilla: 'Vanilla', blueberry: 'Blueberry' },
    maker: {
      title: 'Make a birthday cake',
      name: 'Birthday person',
      namePlaceholder: 'e.g. Alex',
      age: 'Age (optional)',
      ageHint: 'Up to 10, one candle per year. From 11, number candles. Leave it blank for 5 candles.',
      message: 'Your message',
      messagePlaceholder: 'Write your birthday wishes',
      messageHint: 'It appears once all the candles are out.',
      from: 'From',
      fromPlaceholder: 'Your name',
      theme: 'Cake flavor',
      linkTitle: 'Share link',
      linkLabel: 'Birthday cake link',
      copy: 'Copy link',
      share: 'Share',
      preview: 'Preview as the recipient',
      linkPrivacy:
        'The names and message are stored after the # in the link, so they never reach a server and link previews in chat apps don’t show them. Anyone who has the link can read them, though.',
      draftHint: 'Your draft is saved in this browser only.',
    },
    client: {
      headline: {
        plain: 'Happy birthday!',
        name: 'Happy birthday, {name}!',
        age: 'Happy {age} birthday!',
        nameAge: 'Happy {age} birthday, {name}!',
      },
      ordinal: { one: '{n}st', two: '{n}nd', few: '{n}rd', other: '{n}th' },
      fromLine: '{from} sent you a birthday cake',
      fromNone: 'A birthday cake for you',
      sign: '— {from}',
      wish: 'Close your eyes, make a wish, then blow out the candles.',
      listening: 'Blow hard into the microphone!',
      micTip: 'On a phone, the microphone is usually on the bottom edge. Aim there.',
      talking: 'That sounds like talking. Try one long “whoosh” right at the microphone.',
      allOut: 'All out! Your wish is on its way.',
      micStart: 'Blow with the microphone',
      micStop: 'Turn off the microphone',
      micErrors: {
        denied: 'Microphone access was blocked. Tap the candles instead, or allow the microphone in your browser’s site settings and try again.',
        notFound: 'No microphone found. Tap or swipe across the candles instead.',
        unsupported: 'This browser can’t use the microphone (some in-app browsers can’t). Tap the candles, or open the link in Safari or Chrome.',
        failed: 'The microphone couldn’t start. Another app may be using it. Tap the candles instead.',
      },
      mute: 'Mute',
      unmute: 'Sound on',
      shareTitle: 'A birthday cake for you',
      shareText: 'I made you a birthday cake. Open it, make a wish and blow out the candles!',
      counter: '{n} / {max}',
      defaultMessage: 'Happy birthday! Wishing you a year full of good days, good news and good company.',
      copyFailed: 'Couldn’t copy automatically. Press and hold the link above to copy it.',
    },
  },
  ja: {
    cakeAria: 'バースデーケーキ',
    quickBlow: 'ボタンで吹き消す',
    tapHint: 'マイクがなくても大丈夫。ろうそくをタップするか、指でなぞると消せます。',
    micPrivacy: 'マイクの音はブラウザの中でその場で解析するだけで、録音もアップロードもしません。',
    meterLabel: '風の強さ',
    relight: 'もう一度火をつける',
    replay: 'もう一度曲を流す',
    makeOwn: '誰かに贈るケーキを作る',
    invalidLink: 'このバースデーケーキのリンクを開けませんでした。コピーしたときに一部が欠けた可能性があります。下で新しく作れます。',
    themes: { strawberry: 'いちご', chocolate: 'チョコレート', matcha: '抹茶', vanilla: 'バニラ', blueberry: 'ブルーベリー' },
    maker: {
      title: 'バースデーケーキを作る',
      name: 'お祝いする人の名前',
      namePlaceholder: '例：さくら',
      age: '年齢（任意）',
      ageHint: '10歳までは年の数だけろうそくを立て、11歳からは数字のろうそくになります。空欄なら5本です。',
      message: 'メッセージ',
      messagePlaceholder: 'お祝いのメッセージを書きましょう',
      messageHint: 'ろうそくがすべて消えると表示されます。',
      from: 'あなたの名前',
      fromPlaceholder: '例：ゆうき',
      theme: 'ケーキの種類',
      linkTitle: '共有リンク',
      linkLabel: 'バースデーケーキのリンク',
      copy: 'リンクをコピー',
      share: '共有',
      preview: '受け取る側の画面を見る',
      linkPrivacy:
        '名前とメッセージはリンクの「#」より後ろに入っているため、サーバーには送られず、LINE などのリンクプレビューにも表示されません。ただし、リンクを知っている人なら誰でも読めます。',
      draftHint: '下書きはこのブラウザにだけ保存されます。',
    },
    client: {
      headline: {
        plain: 'お誕生日おめでとう！',
        name: '{name}、お誕生日おめでとう！',
        age: '{age}歳のお誕生日おめでとう！',
        nameAge: '{name}、{age}歳のお誕生日おめでとう！',
      },
      ordinal: { other: '{n}' },
      fromLine: '{from} からバースデーケーキが届きました',
      fromNone: 'バースデーケーキが届きました',
      sign: '{from} より',
      wish: '目を閉じて願いごとをしたら、ろうそくを吹き消しましょう。',
      listening: 'マイクに向かって「フーッ」と強く吹いてください',
      micTip: 'スマホのマイクはたいてい本体の下側にあります。そこを狙って吹くと消えやすくなります。',
      talking: '話し声のようです。マイクに向かって長く「フーッ」と吹いてみてください。',
      allOut: 'ぜんぶ消えました！願いがかないますように。',
      micStart: 'マイクで吹き消す',
      micStop: 'マイクをオフにする',
      micErrors: {
        denied: 'マイクの使用が許可されていません。ろうそくをタップして消すか、ブラウザのサイト設定でマイクを許可してからもう一度お試しください。',
        notFound: 'マイクが見つかりません。ろうそくをタップするか、指でなぞって消してください。',
        unsupported: 'このブラウザではマイクを使えません（アプリ内ブラウザでは使えないことがあります）。ろうそくをタップするか、Safari や Chrome でリンクを開いてください。',
        failed: 'マイクを起動できませんでした。ほかのアプリが使用中かもしれません。ろうそくをタップして消してください。',
      },
      mute: 'ミュート',
      unmute: '音を出す',
      shareTitle: 'バースデーケーキを贈ります',
      shareText: 'バースデーケーキを作りました。開いて願いごとをしたら、ろうそくを吹き消してね！',
      counter: '{n} / {max}',
      defaultMessage: 'お誕生日おめでとう！すてきな一年になりますように。',
      copyFailed: '自動でコピーできませんでした。上のリンクを長押ししてコピーしてください。',
    },
  },
});
