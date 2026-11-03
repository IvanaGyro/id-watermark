import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { PayPeriod, RewardId, WorkStatus } from './logic';

export interface Strings {
  amountAria: string;
  progressAria: string;
  settings: string;
  currency: string;
  periodAria: string;
  periods: Record<PayPeriod, string>;
  /** Label of the amount field, per pay period. */
  payLabel: Record<PayPeriod, string>;
  workDays: string;
  start: string;
  end: string;
  breakOn: string;
  breakStart: string;
  breakEnd: string;
  statDaily: string;
  statHourly: string;
  statMinute: string;
  statSecond: string;
  /** Lucide icon name per reward. */
  rewardIcons: Record<RewardId, string>;
  rewardsTitle: string;
  rewardsHint: string;
  saveHint: string;
  client: {
    status: Record<WorkStatus, string>;
    /** {t} = time left, {time} = start time. */
    countdown: Record<WorkStatus, string>;
    /** A count of a reward, {n} = count. */
    amounts: Record<RewardId, PluralForms>;
    /** {thing} = an amounts entry. */
    headline: string;
    /** Before the cheapest reward is earned. {t} = paid working time, {thing} = one of the cheapest reward. */
    headlineSoon: string;
    /** {h} = paid hours per day. */
    workHours: string;
    noRewards: string;
    /** Tab title while working, {amount}. */
    title: string;
    fullscreen: string;
    exitFullscreen: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    amountAria: '今天已經賺到的錢',
    progressAria: '今日上班進度',
    settings: '薪水與上班時間',
    currency: '幣別',
    periodAria: '薪資計算方式',
    periods: { month: '月薪', year: '年薪', hour: '時薪' },
    payLabel: { month: '月薪', year: '年薪', hour: '時薪' },
    workDays: '每月上班天數',
    start: '上班時間',
    end: '下班時間',
    breakOn: '午休不算薪水',
    breakStart: '午休開始',
    breakEnd: '午休結束',
    statDaily: '日薪',
    statHourly: '時薪',
    statMinute: '每分鐘',
    statSecond: '每秒',
    rewardIcons: { coffee: 'Coffee', bubbleTea: 'CupSoda', lunch: 'Utensils', movie: 'Clapperboard', dinner: 'Soup', concert: 'Ticket' },
    rewardsTitle: '今天賺到的錢，可以換成',
    rewardsHint: '價格為一般行情的大約值。',
    saveHint: '設定只存在這個瀏覽器，不會上傳。',
    client: {
      status: {
        before: '還沒上班，先養精蓄銳',
        working: '薪動力運轉中，每一秒都在進帳',
        break: '午休中，好好吃飯，下午繼續賺',
        after: '今天辛苦了，薪水全額入帳',
      },
      countdown: {
        before: '距離上班 {t}',
        working: '距離下班 {t}',
        break: '午休還有 {t}',
        after: '明天 {time} 再出發',
      },
      amounts: {
        coffee: { other: '{n} 杯咖啡' },
        bubbleTea: { other: '{n} 杯珍奶' },
        lunch: { other: '{n} 個便當' },
        movie: { other: '{n} 張電影票' },
        dinner: { other: '{n} 頓火鍋' },
        concert: { other: '{n} 張演唱會門票' },
      },
      headline: '你今天已經賺到 {thing}',
      headlineSoon: '再上班 {t} 就賺到 {thing}',
      workHours: '每天實際上班 {h} 小時',
      noRewards: '換算只支援新台幣、美元、日圓。',
      title: '{amount}・薪動力',
      fullscreen: '全螢幕',
      exitFullscreen: '離開全螢幕',
    },
  },
  en: {
    amountAria: 'Money earned so far today',
    progressAria: 'Workday progress',
    settings: 'Pay and working hours',
    currency: 'Currency',
    periodAria: 'Pay period',
    periods: { month: 'Monthly', year: 'Yearly', hour: 'Hourly' },
    payLabel: { month: 'Monthly salary', year: 'Annual salary', hour: 'Hourly wage' },
    workDays: 'Working days per month',
    start: 'Start time',
    end: 'End time',
    breakOn: 'Unpaid lunch break',
    breakStart: 'Break starts',
    breakEnd: 'Break ends',
    statDaily: 'Per day',
    statHourly: 'Per hour',
    statMinute: 'Per minute',
    statSecond: 'Per second',
    rewardIcons: { coffee: 'Coffee', bubbleTea: 'CupSoda', lunch: 'Sandwich', movie: 'Clapperboard', dinner: 'UtensilsCrossed', concert: 'Ticket' },
    rewardsTitle: 'What today’s pay buys',
    rewardsHint: 'Prices are rough everyday averages.',
    saveHint: 'Your settings stay in this browser and are never uploaded.',
    client: {
      status: {
        before: 'Not on the clock yet. Rest up.',
        working: 'Moneytivation is on. You earn every second.',
        break: 'Lunch break. Eat well, earn more later.',
        after: 'Great work today. Full pay earned.',
      },
      countdown: {
        before: 'Work starts in {t}',
        working: 'Clock-out in {t}',
        break: 'Break ends in {t}',
        after: 'Back at it tomorrow at {time}',
      },
      amounts: {
        coffee: { one: '{n} cup of coffee', other: '{n} cups of coffee' },
        bubbleTea: { one: '{n} bubble tea', other: '{n} bubble teas' },
        lunch: { one: '{n} lunch', other: '{n} lunches' },
        movie: { one: '{n} movie ticket', other: '{n} movie tickets' },
        dinner: { one: '{n} dinner out', other: '{n} dinners out' },
        concert: { one: '{n} concert ticket', other: '{n} concert tickets' },
      },
      headline: 'You have already earned {thing} today',
      headlineSoon: '{t} more work earns {thing}',
      workHours: 'Paid time per day: {h} hours',
      noRewards: 'Equivalents are available for TWD, USD and JPY.',
      title: '{amount} · Moneytivation',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
    },
  },
  ja: {
    amountAria: '今日これまでに稼いだ金額',
    progressAria: '今日の勤務の進み具合',
    settings: '給料と勤務時間',
    currency: '通貨',
    periodAria: '給与の形態',
    periods: { month: '月給', year: '年収', hour: '時給' },
    payLabel: { month: '月給', year: '年収', hour: '時給' },
    workDays: '月の出勤日数',
    start: '始業時刻',
    end: '終業時刻',
    breakOn: '昼休みは無給',
    breakStart: '昼休み開始',
    breakEnd: '昼休み終了',
    statDaily: '日給',
    statHourly: '時給',
    statMinute: '1分あたり',
    statSecond: '1秒あたり',
    rewardIcons: { coffee: 'Coffee', bubbleTea: 'CupSoda', lunch: 'Utensils', movie: 'Clapperboard', dinner: 'Beef', concert: 'Ticket' },
    rewardsTitle: '今日の稼ぎを換算すると',
    rewardsHint: '価格は一般的なおおよその目安です。',
    saveHint: '設定はこのブラウザにだけ保存され、送信されません。',
    client: {
      status: {
        before: 'まだ始業前。英気を養いましょう',
        working: 'やる金チャージ中。1秒ごとに稼いでいます',
        break: '昼休み中。しっかり食べて午後も稼ごう',
        after: '今日もお疲れさまでした。日給ゲット',
      },
      countdown: {
        before: '始業まで {t}',
        working: '定時まで {t}',
        break: '昼休み残り {t}',
        after: '明日は {time} から',
      },
      amounts: {
        coffee: { other: 'コーヒー {n}杯' },
        bubbleTea: { other: 'タピオカ {n}杯' },
        lunch: { other: 'ランチ {n}回' },
        movie: { other: '映画 {n}本' },
        dinner: { other: '焼肉 {n}回' },
        concert: { other: 'ライブ {n}回' },
      },
      headline: '今日はもう{thing}分を稼ぎました',
      headlineSoon: 'あと {t} 働けば{thing}分',
      workHours: '1日の実働 {h}時間',
      noRewards: '換算は円・台湾ドル・米ドルのみ対応しています。',
      title: '{amount}・やる金メーター',
      fullscreen: '全画面',
      exitFullscreen: '全画面を終了',
    },
  },
});
