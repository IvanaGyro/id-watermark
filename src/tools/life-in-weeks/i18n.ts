import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { BirthError, Remaining, Stage } from './logic';

export type CountKey = keyof Remaining;
export type LegendKey = 'lived' | 'current' | 'ahead' | 'bonus';

export interface Strings {
  birthLabel: string;
  lifespanLabel: string;
  lifespanHint: string;
  /** Unit after the lifespan and stage age fields. */
  ageUnit: string;
  heroLabel: string;
  progressAria: string;
  gridTitle: string;
  gridCaption: string;
  stagesNote: string;
  download: string;
  share: string;
  shareHint: string;
  /** Lucide icon per count. */
  countIcons: Record<CountKey, string>;
  stagesTitle: string;
  stagesOn: string;
  schoolStart: string;
  schoolEnd: string;
  retire: string;
  peopleTitle: string;
  peopleIntro: string;
  nameLabel: string;
  namePlaceholder: string;
  ageLabel: string;
  perYearLabel: string;
  remove: string;
  add: string;
  peopleNote: string;
  saveHint: string;
  client: {
    /** Which counts to show, in order (農曆新年 only in zh-TW). */
    countKeys: CountKey[];
    /** Each count: an optional counter word after the number (「 個」「回」) and a label under it. */
    counts: Record<CountKey, { suffix?: string; label: PluralForms }>;
    /** {lifespan} */
    leftTitle: string;
    /** {lifespan} */
    countsNote: string;
    legend: Record<LegendKey, string>;
    stages: Record<Stage, string>;
    /** {age} {week} */
    nowLine: string;
    birthday: string;
    /** {n} */
    livedWeeks: PluralForms;
    aheadWeeks: PluralForms;
    /** {lifespan} */
    bonusLine: string;
    errors: Record<BirthError, string>;
    /** Hover / tap info for one cell: {age} {week} {range}. */
    cellInfo: string;
    cellStatus: Record<'lived' | 'current' | 'ahead', string>;
    cellHint: string;
    /** Joins parts of a line: 「・」 / ' · '. */
    sep: string;
    /** {total} {lived} */
    canvasAria: string;
    visits: PluralForms;
    /** {name} */
    visitsNamed: PluralForms;
    /** {m} */
    visitsMore: PluralForms;
    /** {n} */
    visitsZero: PluralForms;
    /** {lifespan} */
    visitsBonus: string;
    /** Shown until the age and visits fields are filled. */
    visitsEmpty: string;
    posterTitle: string;
    /** {date} {lifespan} */
    posterSub: string;
    posterLived: string;
    fileName: string;
  };
}

const countIcons: Record<CountKey, string> = {
  weekends: 'Sofa',
  summers: 'Sun',
  newYears: 'PartyPopper',
  lunarNewYears: 'Sparkles',
  birthdays: 'Cake',
};

export default defineToolI18n<Strings>({
  'zh-TW': {
    birthLabel: '生日',
    lifespanLabel: '預期壽命（假設）',
    lifespanHint: '這是你自己設定的假設，不是預測。壽命因人、因時代而不同，可以隨意調整。',
    ageUnit: '歲',
    heroLabel: '你的人生已經走過',
    progressAria: '人生進度',
    gridTitle: '你的人生，一週一格',
    gridCaption: '每一列是一年，左邊的數字是年齡；每一格是一週。',
    stagesNote: '深色是已經走過，淺色是還在前面。',
    download: '下載 PNG 圖',
    share: '複製分享連結',
    shareHint: '分享連結裡有你的生日與設定，傳出去前請確認。',
    countIcons,
    stagesTitle: '人生階段',
    stagesOn: '在格子上標出人生階段',
    schoolStart: '開始上學',
    schoolEnd: '畢業',
    retire: '退休',
    peopleTitle: '和重要的人，還能見幾次面',
    peopleIntro: '填入對方現在的年齡和一年大概見幾次面，用同樣的壽命設定，估算你們還能見面幾次。',
    nameLabel: '稱呼',
    namePlaceholder: '例如：媽媽',
    ageLabel: '對方年齡',
    perYearLabel: '一年見幾次',
    remove: '移除',
    add: '新增一位',
    peopleNote: '這只是粗略的估計。多回家吃一頓飯、多打一通電話，這個數字就會變大，好好珍惜每一次相聚。',
    saveHint: '設定只存在這個瀏覽器，不會上傳。',
    client: {
      countKeys: ['weekends', 'summers', 'newYears', 'lunarNewYears', 'birthdays'],
      counts: {
        weekends: { suffix: ' 個', label: { other: '週末' } },
        summers: { suffix: ' 個', label: { other: '夏天' } },
        newYears: { suffix: ' 次', label: { other: '元旦' } },
        lunarNewYears: { suffix: ' 次', label: { other: '農曆新年' } },
        birthdays: { suffix: ' 次', label: { other: '生日' } },
      },
      leftTitle: '活到 {lifespan} 歲的話，你還有',
      countsNote:
        '從今天算到 {lifespan} 歲生日，今天也算在內。週末以星期六計算；夏天到 8 月 31 日為止都還算這一個；農曆新年依農曆日期換算，2100 年以後以一年一次估算。',
      legend: { lived: '已經走過', current: '這一週', ahead: '還在前面', bonus: '額外的時光' },
      stages: { child: '童年', school: '求學', work: '工作', retired: '退休' },
      nowLine: '你今年 {age} 歲，這是人生的第 {week} 週。',
      birthday: '生日快樂！',
      livedWeeks: { other: '已走過 {n} 週' },
      aheadWeeks: { other: '還有 {n} 週在前面' },
      bonusLine: '你已經走過設定的 {lifespan} 歲。接下來的每一週都是額外的時光，好好享受。',
      errors: {
        empty: '請輸入生日',
        invalid: '請輸入正確的日期',
        future: '生日不能晚於今天',
        tooOld: '請輸入 1900 年以後的生日',
      },
      cellInfo: '{age} 歲的第 {week} 週（{range}）',
      cellStatus: { lived: '已經走過', current: '就是這一週', ahead: '還在前面' },
      cellHint: '滑過或點一下格子，看看那是哪一週。',
      sep: '・',
      canvasAria: '人生週曆：共 {total} 格，已經走過 {lived} 格',
      visits: { other: '還能見面約 {n} 次' },
      visitsNamed: { other: '和{name}還能見面約 {n} 次' },
      visitsMore: { other: '每年多見一次，就多出約 {m} 次' },
      visitsZero: { other: '就算一年只見一次，也還有約 {n} 次' },
      visitsBonus: '已經超過你設定的 {lifespan} 歲，每一次見面都是珍貴的禮物',
      visitsEmpty: '填入對方年齡和一年見幾次，看看還能見幾次面',
      posterTitle: '我的人生，一週一格',
      posterSub: '{date} 出生・假設活到 {lifespan} 歲',
      posterLived: '已經走過',
      fileName: '人生進度條.png',
    },
  },
  en: {
    birthLabel: 'Date of birth',
    lifespanLabel: 'Expected lifespan (your assumption)',
    lifespanHint: 'This is an assumption you choose, not a prediction. Lifespans vary from person to person and over time, so set any number you like.',
    ageUnit: 'years',
    heroLabel: 'Your life so far',
    progressAria: 'Life progress',
    gridTitle: 'Your life in weeks',
    gridCaption: 'Each row is one year, with your age on the left. Each box is one week.',
    stagesNote: 'Darker boxes are lived, lighter ones are still ahead.',
    download: 'Download PNG',
    share: 'Copy share link',
    shareHint: 'The link contains your date of birth and settings. Check before you send it.',
    countIcons,
    stagesTitle: 'Life stages',
    stagesOn: 'Color the grid by life stage',
    schoolStart: 'School starts at age',
    schoolEnd: 'School ends at age',
    retire: 'Retire at age',
    peopleTitle: 'Time with the people you love',
    peopleIntro: 'Enter someone’s age and how many times a year you see them. Using the same lifespan setting, see roughly how many visits are still ahead.',
    nameLabel: 'Name',
    namePlaceholder: 'e.g. Mom',
    ageLabel: 'Their age',
    perYearLabel: 'Visits per year',
    remove: 'Remove',
    add: 'Add a person',
    peopleNote: 'A rough estimate, not a countdown. One more dinner or one more call makes this number grow. Make them count.',
    saveHint: 'Your settings stay in this browser and are never uploaded.',
    client: {
      countKeys: ['weekends', 'summers', 'newYears', 'birthdays'],
      counts: {
        weekends: { label: { one: 'weekend', other: 'weekends' } },
        summers: { label: { one: 'summer', other: 'summers' } },
        newYears: { label: { one: 'New Year’s Day', other: 'New Year’s Days' } },
        lunarNewYears: { label: { one: 'Lunar New Year', other: 'Lunar New Years' } },
        birthdays: { label: { one: 'birthday', other: 'birthdays' } },
      },
      leftTitle: 'Living to {lifespan}, you still have',
      countsNote:
        'Counted from today through the day you turn {lifespan}, today included. A weekend counts by its Saturday, and a summer counts until August 31.',
      legend: { lived: 'Lived', current: 'This week', ahead: 'Ahead', bonus: 'Bonus time' },
      stages: { child: 'Childhood', school: 'School', work: 'Work', retired: 'Retirement' },
      nowLine: 'You are {age}, living week {week} of your life.',
      birthday: 'Happy birthday! ',
      livedWeeks: { one: '{n} week lived', other: '{n} weeks lived' },
      aheadWeeks: { one: '{n} week ahead', other: '{n} weeks ahead' },
      bonusLine: 'You have passed the {lifespan} years you set. Every week from here is extra time to enjoy.',
      errors: {
        empty: 'Enter your date of birth',
        invalid: 'Enter a valid date',
        future: 'Your date of birth can’t be in the future',
        tooOld: 'Enter a date from 1900 onward',
      },
      cellInfo: 'Age {age}, week {week} ({range})',
      cellStatus: { lived: 'lived', current: 'this week', ahead: 'ahead' },
      cellHint: 'Hover over or tap a box to see which week it is.',
      sep: ' · ',
      canvasAria: 'Life in weeks: {lived} of {total} weeks lived',
      visits: { one: 'About {n} more visit', other: 'About {n} more visits' },
      visitsNamed: { one: 'About {n} more visit with {name}', other: 'About {n} more visits with {name}' },
      visitsMore: { one: 'One more visit a year adds about {m}.', other: 'One more visit a year adds about {m}.' },
      visitsZero: { one: 'Even once a year adds up to about {n} visit.', other: 'Even once a year adds up to about {n} visits.' },
      visitsBonus: 'Already past the {lifespan} years you set. Every visit is a gift.',
      visitsEmpty: 'Fill in their age and visits per year to see an estimate',
      posterTitle: 'My life in weeks',
      posterSub: 'Born {date} · assuming {lifespan} years',
      posterLived: 'lived',
      fileName: 'life-in-weeks.png',
    },
  },
  ja: {
    birthLabel: '生年月日',
    lifespanLabel: '想定する寿命（仮の数字）',
    lifespanHint: '予測ではなく、ご自身で決める仮の数字です。寿命は人によっても時代によっても異なるので、自由に変えてください。',
    ageUnit: '歳',
    heroLabel: 'あなたの人生の進み具合',
    progressAria: '人生の進み具合',
    gridTitle: '人生を 1 週ずつ並べると',
    gridCaption: '1 行が 1 年（左の数字は年齢）、1 マスが 1 週間です。',
    stagesNote: '濃い色が過ごした週、薄い色がこれからの週です。',
    download: 'PNG で保存',
    share: '共有リンクをコピー',
    shareHint: 'リンクには生年月日と設定が含まれます。送る前にご確認ください。',
    countIcons,
    stagesTitle: 'ライフステージ',
    stagesOn: 'ライフステージで色分けする',
    schoolStart: '入学',
    schoolEnd: '卒業',
    retire: '退職',
    peopleTitle: '大切な人と、あと何回会える？',
    peopleIntro: '相手の今の年齢と 1 年に会う回数を入れると、同じ寿命の設定で、これから会える回数のめやすがわかります。',
    nameLabel: '呼び名',
    namePlaceholder: '例：母',
    ageLabel: '相手の年齢',
    perYearLabel: '1 年に会う回数',
    remove: '削除',
    add: '人を追加',
    peopleNote: 'あくまでおおよその目安です。会いに行く回数や電話を少し増やすだけで、この数字は大きくなります。一回一回を大切に。',
    saveHint: '設定はこのブラウザにだけ保存され、送信されません。',
    client: {
      countKeys: ['weekends', 'summers', 'newYears', 'birthdays'],
      counts: {
        weekends: { suffix: '回', label: { other: '週末' } },
        summers: { suffix: '回', label: { other: '夏' } },
        newYears: { suffix: '回', label: { other: 'お正月' } },
        lunarNewYears: { suffix: '回', label: { other: '旧正月' } },
        birthdays: { suffix: '回', label: { other: '誕生日' } },
      },
      leftTitle: '{lifespan}歳までに、まだこれだけあります',
      countsNote:
        '今日から{lifespan}歳の誕生日までを数えています（今日を含みます）。週末は土曜日で数え、夏は 8 月 31 日までをひと区切りとしています。',
      legend: { lived: '過ごした週', current: '今週', ahead: 'これから', bonus: 'おまけの時間' },
      stages: { child: '子ども時代', school: '学生時代', work: '仕事', retired: 'セカンドライフ' },
      nowLine: 'いま{age}歳、人生{week}週目を過ごしています。',
      birthday: 'お誕生日おめでとうございます！',
      livedWeeks: { other: '過ごした週 {n}' },
      aheadWeeks: { other: 'これからの週 {n}' },
      bonusLine: '設定した{lifespan}歳を超えました。ここからの毎週は、楽しむためのおまけの時間です。',
      errors: {
        empty: '生年月日を入力してください',
        invalid: '正しい日付を入力してください',
        future: '生年月日が今日より後になっています',
        tooOld: '1900年以降の日付を入力してください',
      },
      cellInfo: '{age}歳の{week}週目（{range}）',
      cellStatus: { lived: '過ごした週', current: '今週', ahead: 'これから' },
      cellHint: 'マスにカーソルを合わせるかタップすると、どの週かがわかります。',
      sep: '・',
      canvasAria: '人生カレンダー：全{total}マスのうち{lived}マスが経過',
      visits: { other: 'あと約{n}回会えます' },
      visitsNamed: { other: '{name}とあと約{n}回会えます' },
      visitsMore: { other: '1 年に 1 回増やすと、約{m}回増えます' },
      visitsZero: { other: '1 年に 1 回会うだけでも、約{n}回になります' },
      visitsBonus: '設定した{lifespan}歳を超えています。会えるたびが贈りものです',
      visitsEmpty: '相手の年齢と 1 年に会う回数を入れると、めやすが表示されます',
      posterTitle: 'わたしの人生カレンダー',
      posterSub: '{date}生まれ・{lifespan}歳までと仮定',
      posterLived: '経過',
      fileName: '人生カレンダー.png',
    },
  },
});
