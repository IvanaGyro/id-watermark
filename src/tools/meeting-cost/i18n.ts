import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { Mode, PayPeriod, Phase, Recurrence, RewardId } from './logic';

export interface Strings {
  amountAria: string;
  progressAria: string;
  reset: string;
  statMinute: string;
  statHour: string;
  statPeople: string;
  statAverage: string;
  settings: string;
  modeAria: string;
  modes: Record<Mode, string>;
  periodAria: string;
  /** Pay period options (quick mode tabs and row selects). */
  periods: Record<PayPeriod, string>;
  quickCount: string;
  /** Label of the quick-mode pay field, per pay period. */
  averagePay: Record<PayPeriod, string>;
  /** Default labels of the sample rows, in the order of logic.ts SAMPLE_ROWS. */
  sampleLabels: string[];
  rowLabelPlaceholder: string;
  rowLabelAria: string;
  rowPeriod: string;
  rowCount: string;
  rowPay: string;
  removeRow: string;
  addRow: string;
  currency: string;
  workDays: string;
  hoursPerDay: string;
  overhead: string;
  overheadHint: string;
  liveHint: string;
  saveHint: string;
  planTitle: string;
  planMinutes: string;
  presetsAria: string;
  /** {m} = minutes. */
  preset: string;
  recurrence: string;
  recurrences: Record<Recurrence, string>;
  recurrenceHint: string;
  planMeeting: string;
  planMonth: string;
  planYear: string;
  /** Lucide icon name per reward. */
  rewardIcons: Record<RewardId, string>;
  rewardsTitle: string;
  rewardsHint: string;
  client: {
    status: Record<Phase | 'over', string>;
    start: string;
    pause: string;
    resume: string;
    /** {t} = elapsed time. */
    elapsed: string;
    /** {m} = planned minutes, {t} = time left. */
    left: string;
    /** {t} = time over the plan. */
    over: string;
    /** A count of a reward, {n} = count. */
    amounts: Record<RewardId, PluralForms>;
    /** {thing} = an amounts entry. */
    headline: string;
    /** Before the cheapest reward is reached. {t} = meeting time still needed, {thing} = one of the cheapest reward. */
    headlineSoon: string;
    /** Before the start. {m} = planned minutes, {amount} = planned cost. */
    headlineIdle: string;
    noAttendees: string;
    /** {n} = attendees, {amount} = cost per minute. */
    rateLine: PluralForms;
    /** Under each row: {each} = per person per hour, {total} = the row per hour. */
    rowOut: string;
    /** Under the quick fields: {each}, {total}. */
    quickOut: string;
    /** {days}, {hours}, {total} = paid hours a month. */
    basis: string;
    /** {n} = hours. */
    hours: PluralForms;
    planHoursOnce: string;
    planHoursYear: string;
    /** {h} = hours per attendee per year, {d} = working days. */
    noteHours: string;
    /** {m} = minutes to cut, {amount} = saving per year. */
    noteSave: string;
    /** One-off meeting: {m}, {amount}. */
    noteSaveOnce: string;
    noRewards: string;
    /** Tab title while the meter has time on it, {amount}. */
    title: string;
    fullscreen: string;
    exitFullscreen: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    amountAria: '這場會議到目前為止的薪水成本',
    progressAria: '會議進度（和預定時間相比）',
    reset: '重來',
    statMinute: '每分鐘',
    statHour: '每小時',
    statPeople: '與會人數',
    statAverage: '平均每人每小時',
    settings: '與會者與薪水',
    modeAria: '估算方式',
    modes: { quick: '快速估算', detail: '依職位細算' },
    periodAria: '薪資計算方式',
    periods: { month: '月薪', year: '年薪', hour: '時薪' },
    quickCount: '與會人數',
    averagePay: { month: '平均月薪', year: '平均年薪', hour: '平均時薪' },
    sampleLabels: ['主管', '工程師', '實習生'],
    rowLabelPlaceholder: '選填，例如主管',
    rowLabelAria: '職位或身分',
    rowPeriod: '計薪方式',
    rowCount: '人數',
    rowPay: '薪水',
    removeRow: '刪除這一列',
    addRow: '新增一列',
    currency: '幣別',
    workDays: '每月上班天數',
    hoursPerDay: '每天工時（小時）',
    overhead: '額外成本倍數',
    overheadHint:
      '填 1 只算薪水。想把公司另外負擔的勞健保、勞退、福利和辦公室成本也算進去，可以調高，例如 1.3 代表每 100 元薪水另有 30 元其他成本。',
    liveHint: '會議中途有人加入或先離開，直接改人數就好：之後用新的人數計算，已經燒掉的金額不會變。',
    saveHint: '設定只存在這個瀏覽器，不會上傳。',
    planTitle: '開會前先算：這個會要花多少？',
    planMinutes: '預計開多久（分鐘）',
    presetsAria: '常用的會議長度',
    preset: '{m} 分',
    recurrence: '多久開一次',
    recurrences: { once: '單次', daily: '每天', weekly: '每週', monthly: '每月' },
    recurrenceHint: '「每天」以每月上班天數計算，例如每天早上的站立會議。',
    planMeeting: '每場',
    planMonth: '每月',
    planYear: '每年',
    rewardIcons: { coffee: 'Coffee', bubbleTea: 'CupSoda', lunch: 'Utensils', movie: 'Clapperboard', dinner: 'Soup', concert: 'Ticket' },
    rewardsTitle: '這場會議燒掉的錢，可以換成',
    rewardsHint: '價格為一般行情的大約值。',
    client: {
      status: {
        idle: '會議還沒開始，錢包還很安全',
        running: '會議進行中，薪水正在燃燒',
        paused: '暫停中，先喘口氣',
        over: '已經超過預定時間，要不要準備收尾？',
      },
      start: '開始開會',
      pause: '暫停',
      resume: '繼續',
      elapsed: '已開會 {t}',
      left: '預定 {m} 分鐘・還剩 {t}',
      over: '超時 {t}',
      amounts: {
        coffee: { other: '{n} 杯咖啡' },
        bubbleTea: { other: '{n} 杯珍奶' },
        lunch: { other: '{n} 個便當' },
        movie: { other: '{n} 張電影票' },
        dinner: { other: '{n} 頓火鍋' },
        concert: { other: '{n} 張演唱會門票' },
      },
      headline: '這場會議已經燒掉 {thing}',
      headlineSoon: '再開 {t} 就燒掉 {thing}',
      headlineIdle: '預計開 {m} 分鐘，大約會燒掉 {amount}',
      noAttendees: '先在下方填與會人數和薪水',
      rateLine: { other: '{n} 人・每分鐘 {amount}' },
      rowOut: '每人每小時 {each}，這一列每小時 {total}',
      quickOut: '每人每小時 {each}，全部每小時 {total}',
      basis: '時薪 = 月薪 ÷（{days} 天 × {hours} 小時 = {total} 小時），年薪先除以 12。',
      hours: { other: '{n} 小時' },
      planHoursOnce: '全員合計時間',
      planHoursYear: '每人每年開會',
      noteHours: '每位與會者一年要花 {h} 小時在這個會上，大約 {d} 個工作天。',
      noteSave: '每場縮短 {m} 分鐘，一年就省下 {amount}。',
      noteSaveOnce: '提早 {m} 分鐘結束，就省下 {amount}。',
      noRewards: '換算只支援新台幣、美元、日圓。',
      title: '{amount}・會議燒錢中',
      fullscreen: '全螢幕',
      exitFullscreen: '離開全螢幕',
    },
  },
  en: {
    amountAria: 'Salary cost of this meeting so far',
    progressAria: 'Meeting progress against the planned length',
    reset: 'Reset',
    statMinute: 'Per minute',
    statHour: 'Per hour',
    statPeople: 'Attendees',
    statAverage: 'Average per person per hour',
    settings: 'Attendees and pay',
    modeAria: 'Estimate type',
    modes: { quick: 'Quick estimate', detail: 'By role' },
    periodAria: 'Pay period',
    periods: { month: 'Monthly', year: 'Yearly', hour: 'Hourly' },
    quickCount: 'Number of attendees',
    averagePay: { month: 'Average monthly salary', year: 'Average annual salary', hour: 'Average hourly wage' },
    sampleLabels: ['Manager', 'Engineer', 'Contractor'],
    rowLabelPlaceholder: 'Optional, e.g. Manager',
    rowLabelAria: 'Role',
    rowPeriod: 'Pay period',
    rowCount: 'People',
    rowPay: 'Pay',
    removeRow: 'Remove this row',
    addRow: 'Add a row',
    currency: 'Currency',
    workDays: 'Working days per month',
    hoursPerDay: 'Paid hours per day',
    overhead: 'Overhead multiplier',
    overheadHint:
      'Leave it at 1 to count salary only. Raise it to include what the employer pays on top, such as payroll taxes, benefits and office space: 1.3 means every $100 of salary comes with $30 of other costs.',
    liveHint: 'Someone joins or leaves mid-meeting? Just change the headcount. The new number applies from that moment on, and what has already been spent stays as it is.',
    saveHint: 'Your settings stay in this browser and are never uploaded.',
    planTitle: 'Plan ahead: what will this meeting cost?',
    planMinutes: 'Planned length (minutes)',
    presetsAria: 'Common meeting lengths',
    preset: '{m} min',
    recurrence: 'How often',
    recurrences: { once: 'One-off', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' },
    recurrenceHint: '“Daily” means every working day, like a morning stand-up.',
    planMeeting: 'Per meeting',
    planMonth: 'Per month',
    planYear: 'Per year',
    rewardIcons: { coffee: 'Coffee', bubbleTea: 'CupSoda', lunch: 'Sandwich', movie: 'Clapperboard', dinner: 'UtensilsCrossed', concert: 'Ticket' },
    rewardsTitle: 'This meeting’s cost so far, in everyday terms',
    rewardsHint: 'Prices are rough everyday averages.',
    client: {
      status: {
        idle: 'The meeting hasn’t started. The budget is safe.',
        running: 'Meeting in progress. The meter is running.',
        paused: 'Paused. Catch your breath.',
        over: 'Past the planned time. Ready to wrap up?',
      },
      start: 'Start meeting',
      pause: 'Pause',
      resume: 'Resume',
      elapsed: 'Elapsed {t}',
      left: '{m} min planned · {t} left',
      over: '{t} over time',
      amounts: {
        coffee: { one: '{n} cup of coffee', other: '{n} cups of coffee' },
        bubbleTea: { one: '{n} bubble tea', other: '{n} bubble teas' },
        lunch: { one: '{n} lunch', other: '{n} lunches' },
        movie: { one: '{n} movie ticket', other: '{n} movie tickets' },
        dinner: { one: '{n} dinner out', other: '{n} dinners out' },
        concert: { one: '{n} concert ticket', other: '{n} concert tickets' },
      },
      headline: 'This meeting has already cost {thing}',
      headlineSoon: 'Another {t} and it will have cost {thing}',
      headlineIdle: 'A {m}-minute meeting costs about {amount}',
      noAttendees: 'Add attendees and pay below to begin',
      rateLine: { one: '{n} person · {amount} a minute', other: '{n} people · {amount} a minute' },
      rowOut: '{each} per person per hour · {total} per hour for this row',
      quickOut: '{each} per person per hour · {total} per hour in total',
      basis: 'Hourly pay = monthly pay ÷ ({days} days × {hours} hours = {total} hours). Annual salaries are divided by 12 first.',
      hours: { one: '{n} hour', other: '{n} hours' },
      planHoursOnce: 'Total attendee time',
      planHoursYear: 'Per person per year',
      noteHours: 'Each attendee spends {h} hours a year in this meeting, about {d} working days.',
      noteSave: 'Cut each meeting by {m} minutes and save {amount} a year.',
      noteSaveOnce: 'Finish {m} minutes early and save {amount}.',
      noRewards: 'Equivalents are available for TWD, USD and JPY.',
      title: '{amount} · Meeting cost',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
    },
  },
  ja: {
    amountAria: 'この会議でここまでにかかった人件費',
    progressAria: '予定時間に対する会議の進み具合',
    reset: 'リセット',
    statMinute: '1分あたり',
    statHour: '1時間あたり',
    statPeople: '参加人数',
    statAverage: '1人1時間あたり',
    settings: '参加者と給与',
    modeAria: '計算方法',
    modes: { quick: 'かんたん計算', detail: '役職ごとに計算' },
    periodAria: '給与の形態',
    periods: { month: '月給', year: '年収', hour: '時給' },
    quickCount: '参加人数',
    averagePay: { month: '平均月給', year: '平均年収', hour: '平均時給' },
    sampleLabels: ['部長', 'エンジニア', 'アルバイト'],
    rowLabelPlaceholder: '任意（例：部長）',
    rowLabelAria: '役職',
    rowPeriod: '給与形態',
    rowCount: '人数',
    rowPay: '給与',
    removeRow: 'この行を削除',
    addRow: '行を追加',
    currency: '通貨',
    workDays: '月の出勤日数',
    hoursPerDay: '1日の労働時間',
    overhead: '間接コストの倍率',
    overheadHint:
      '1なら給与だけで計算します。会社が負担する社会保険料や福利厚生、オフィスの家賃なども含めたいときは数字を上げてください。たとえば1.3は、給与100円ごとにほかのコストが30円かかるという意味です。',
    liveHint: '会議の途中で人が増えたり減ったりしたら、人数を変えるだけで大丈夫です。その時点から新しい人数で計算し、それまでの金額はそのまま残ります。',
    saveHint: '設定はこのブラウザにだけ保存され、送信されません。',
    planTitle: '事前に試算：この会議にいくらかかる？',
    planMinutes: '予定時間（分）',
    presetsAria: 'よく使う会議の長さ',
    preset: '{m}分',
    recurrence: '頻度',
    recurrences: { once: '1回だけ', daily: '毎日', weekly: '毎週', monthly: '毎月' },
    recurrenceHint: '「毎日」は月の出勤日数で計算します。毎朝の朝会などに。',
    planMeeting: '1回あたり',
    planMonth: '1か月',
    planYear: '1年',
    rewardIcons: { coffee: 'Coffee', bubbleTea: 'CupSoda', lunch: 'Utensils', movie: 'Clapperboard', dinner: 'Beef', concert: 'Ticket' },
    rewardsTitle: 'この会議のコストを換算すると',
    rewardsHint: '価格は一般的なおおよその目安です。',
    client: {
      status: {
        idle: '会議はまだ始まっていません',
        running: '会議中。人件費がじわじわ増えています',
        paused: '一時停止中。ひと息つきましょう',
        over: '予定時間をオーバー。そろそろまとめませんか？',
      },
      start: '会議を開始',
      pause: '一時停止',
      resume: '再開',
      elapsed: '経過 {t}',
      left: '予定 {m}分・残り {t}',
      over: '{t} オーバー',
      amounts: {
        coffee: { other: 'コーヒー {n}杯' },
        bubbleTea: { other: 'タピオカ {n}杯' },
        lunch: { other: 'ランチ {n}回' },
        movie: { other: '映画 {n}本' },
        dinner: { other: '焼肉 {n}回' },
        concert: { other: 'ライブ {n}回' },
      },
      headline: 'この会議で、もう{thing}分のコストがかかりました',
      headlineSoon: 'あと {t} で{thing}分',
      headlineIdle: '{m}分の会議で、およそ {amount}',
      noAttendees: '下の欄に参加人数と給与を入れてください',
      rateLine: { other: '参加 {n}人・1分あたり {amount}' },
      rowOut: '1人1時間 {each}・この行の合計 {total}／時間',
      quickOut: '1人1時間 {each}・全員で {total}／時間',
      basis: '時給 = 月給 ÷（{days}日 × {hours}時間 = {total}時間）。年収は12で割ってから計算します。',
      hours: { other: '{n}時間' },
      planHoursOnce: '全員の合計時間',
      planHoursYear: '1人あたり年間',
      noteHours: '参加者1人あたり年間 {h}時間、およそ {d}日分の勤務時間をこの会議に使っています。',
      noteSave: '1回あたり{m}分短くすると、年間 {amount} の節約になります。',
      noteSaveOnce: '{m}分早く終われば、{amount} の節約になります。',
      noRewards: '換算は円・台湾ドル・米ドルのみ対応しています。',
      title: '{amount}・会議コスト',
      fullscreen: '全画面',
      exitFullscreen: '全画面を終了',
    },
  },
});
