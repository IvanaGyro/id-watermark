import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { EventKind, PhaseId } from './logic';

export interface Strings {
  dateLabel: string;
  timeLabel: string;
  zoneLabel: string;
  timeHint: string;
  today: string;
  hemiAria: string;
  north: string;
  south: string;
  download: string;
  copyLink: string;
  cycleTitle: string;
  yearsTitle: string;
  yearsHint: string;
  echoTitle: string;
  echoIntro: string;
  method: string;
  /** City names for the zones in ZONES. */
  zoneNames: Record<string, string>;
  client: {
    /** Zone used when nothing is stored: an IANA id, or 'device' for the browser's zone. */
    defaultZone: string;
    /** 24-hour clock for event times. */
    clock24: boolean;
    /** Extra calendar line: 農曆 date (zh), 旧暦 day (ja) or none. */
    lunar: 'chinese' | 'japanese' | 'none';
    /** zh: {date} = 「七月二十」; ja: {n} = day of the lunar month. */
    lunarLine?: string;
    /** ja: traditional names by 旧暦 day, with readings. */
    traditional?: Record<number, { name: string; reading: string }>;
    phases: Record<PhaseId, string>;
    events: Record<EventKind, string>;
    /** When the Moon can be seen in that phase. */
    visibility: Record<PhaseId, string>;
    statFraction: string;
    statAge: string;
    /** {n} = moon age with one decimal. */
    ageValue: string;
    /** Value and small caption of the waxing / waning figure. */
    waxing: { value: string; note: string };
    waning: { value: string; note: string };
    /** {time} = local time, {zone} = zone name. */
    when: string;
    /** {time} when no time was entered. */
    whenDefault: string;
    /** {full} and {new} are nearestItem strings. */
    nearest: string;
    /** {date}, {rel} = relative day. */
    nearestItem: string;
    daysAgo: PluralForms;
    daysLater: PluralForms;
    sameDay: string;
    yearsExact: string;
    /** {p} = illuminated percent. */
    yearsNear: string;
    yearsNone: string;
    /** {years} = 19, 38 … */
    echoWhen: string;
    /** {age} = moon age, {diff} = signed day difference. */
    echoValue: string;
    /** {date}, {phase}, {p}: accessible label of the big moon. */
    moonLabel: string;
    deviceZone: string;
    invalid: string;
    /** Heading of the downloadable card. */
    cardTitle: string;
    cardFailed: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    dateLabel: '日期',
    timeLabel: '時間（選填）',
    zoneLabel: '時區',
    timeHint: '生日、紀念日或任何一天都可以。沒填時間就看當晚 21:00 的月亮。',
    today: '今天',
    hemiAria: '從哪個半球看',
    north: '北半球',
    south: '南半球',
    download: '下載圖卡',
    copyLink: '複製分享連結',
    cycleTitle: '這一輪月相週期',
    yearsTitle: '哪幾年的這一天會是滿月？',
    yearsHint: '從今天起，這一天月亮剛好滿月，或接近滿月（照亮 97% 以上）的年份。',
    echoTitle: '每 19 年，月亮會回到同一個樣子',
    echoIntro:
      '235 個朔望月約 6,939.7 天，和 19 年只差不到一天，所以同一個日期的月相大約每 19 年重演一次，這就是「默冬週期」。下面是用同一套公式實際算出來的結果：',
    method:
      '月相依 Jean Meeus《Astronomical Algorithms》的月球與太陽位置公式計算，新月、滿月時刻的誤差約在數分鐘內。圖中的月亮以正立方向呈現，實際傾斜角度會隨地點與時間改變。所有計算都在瀏覽器完成，日期不會上傳。',
    zoneNames: {
      'Asia/Taipei': '台北',
      'Asia/Tokyo': '東京',
      'Asia/Hong_Kong': '香港',
      'Asia/Shanghai': '北京／上海',
      'Asia/Seoul': '首爾',
      'Asia/Singapore': '新加坡',
      'Asia/Bangkok': '曼谷',
      'Asia/Kolkata': '印度（新德里）',
      'Asia/Dubai': '杜拜',
      'Europe/London': '倫敦',
      'Europe/Paris': '巴黎',
      'Europe/Berlin': '柏林',
      'America/New_York': '紐約',
      'America/Chicago': '芝加哥',
      'America/Denver': '丹佛',
      'America/Los_Angeles': '洛杉磯',
      'America/Toronto': '多倫多',
      'America/Sao_Paulo': '聖保羅',
      'Pacific/Honolulu': '檀香山',
      'Australia/Sydney': '雪梨',
      'Australia/Perth': '伯斯',
      'Pacific/Auckland': '奧克蘭',
      UTC: '世界協調時間（UTC）',
    },
    client: {
      defaultZone: 'Asia/Taipei',
      clock24: true,
      lunar: 'chinese',
      lunarLine: '農曆{date}',
      phases: {
        new: '新月',
        waxingCrescent: '眉月',
        firstQuarter: '上弦月',
        waxingGibbous: '盈凸月',
        full: '滿月',
        waningGibbous: '虧凸月',
        lastQuarter: '下弦月',
        waningCrescent: '殘月',
      },
      events: { new: '新月', firstQuarter: '上弦月', full: '滿月', lastQuarter: '下弦月' },
      visibility: {
        new: '月亮和太陽幾乎在同一個方向，這晚看不到月亮。',
        waxingCrescent: '傍晚在西方低空，前半夜就落下。',
        firstQuarter: '大約中午升起、午夜前後落下，傍晚到前半夜最好看。',
        waxingGibbous: '下午升起，一直到後半夜才落下。',
        full: '日落時從東方升起，整夜都看得到。',
        waningGibbous: '入夜後才升起，一直掛到隔天早上。',
        lastQuarter: '大約午夜升起，後半夜到清晨最好看。',
        waningCrescent: '後半夜才升起，黎明前在東方低空。',
      },
      statFraction: '照亮比例',
      statAge: '月齡',
      ageValue: '{n} 天',
      waxing: { value: '漸盈', note: '越來越圓' },
      waning: { value: '漸虧', note: '越來越缺' },
      when: '{time}（{zone}）',
      whenDefault: '當晚 {time}（{zone}）',
      nearest: '最近的滿月：{full}・最近的新月：{new}',
      nearestItem: '{date}（{rel}）',
      daysAgo: { other: '{n} 天前' },
      daysLater: { other: '{n} 天後' },
      sameDay: '當天',
      yearsExact: '當天滿月',
      yearsNear: '照亮 {p}%',
      yearsNone: '接下來 100 年內沒有找到。',
      echoWhen: '{years} 年後',
      echoValue: '月齡 {age} 天，相差 {diff} 天',
      moonLabel: '{date}的月亮：{phase}，照亮 {p}%',
      deviceZone: '這台裝置（{zone}）',
      invalid: '請選擇 1900 到 2100 年之間的日期。',
      cardTitle: '生日月亮',
      cardFailed: '這個瀏覽器無法產生圖卡',
    },
  },
  en: {
    dateLabel: 'Date',
    timeLabel: 'Time (optional)',
    zoneLabel: 'Time zone',
    timeHint: 'A birthday, an anniversary or any day. Without a time you see the moon at 9 p.m. that night.',
    today: 'Today',
    hemiAria: 'Viewing hemisphere',
    north: 'Northern',
    south: 'Southern',
    download: 'Download card',
    copyLink: 'Copy share link',
    cycleTitle: 'This lunar cycle',
    yearsTitle: 'Which years bring a full moon on this date?',
    yearsHint: 'Upcoming years when the moon on this date is full, or nearly full (at least 97% lit).',
    echoTitle: 'Every 19 years the moon comes back',
    echoIntro:
      '235 lunar months last about 6,939.7 days, less than a day off 19 years, so the moon phase on a given date comes back roughly every 19 years. This is the Metonic cycle. Here is what the same calculation gives for your date:',
    method:
      'Phases are computed with the lunar and solar theories in Jean Meeus’s Astronomical Algorithms; new and full moon times are good to within a few minutes. The moon is drawn upright, while its real tilt changes with place and time. Everything runs in your browser and your dates are never uploaded.',
    zoneNames: {
      'Asia/Taipei': 'Taipei',
      'Asia/Tokyo': 'Tokyo',
      'Asia/Hong_Kong': 'Hong Kong',
      'Asia/Shanghai': 'Beijing / Shanghai',
      'Asia/Seoul': 'Seoul',
      'Asia/Singapore': 'Singapore',
      'Asia/Bangkok': 'Bangkok',
      'Asia/Kolkata': 'India (New Delhi)',
      'Asia/Dubai': 'Dubai',
      'Europe/London': 'London',
      'Europe/Paris': 'Paris',
      'Europe/Berlin': 'Berlin',
      'America/New_York': 'New York (Eastern)',
      'America/Chicago': 'Chicago (Central)',
      'America/Denver': 'Denver (Mountain)',
      'America/Los_Angeles': 'Los Angeles (Pacific)',
      'America/Toronto': 'Toronto',
      'America/Sao_Paulo': 'São Paulo',
      'Pacific/Honolulu': 'Honolulu',
      'Australia/Sydney': 'Sydney',
      'Australia/Perth': 'Perth',
      'Pacific/Auckland': 'Auckland',
      UTC: 'UTC',
    },
    client: {
      defaultZone: 'device',
      clock24: false,
      lunar: 'none',
      phases: {
        new: 'New moon',
        waxingCrescent: 'Waxing crescent',
        firstQuarter: 'First quarter',
        waxingGibbous: 'Waxing gibbous',
        full: 'Full moon',
        waningGibbous: 'Waning gibbous',
        lastQuarter: 'Last quarter',
        waningCrescent: 'Waning crescent',
      },
      events: { new: 'New moon', firstQuarter: 'First quarter', full: 'Full moon', lastQuarter: 'Last quarter' },
      visibility: {
        new: 'The moon is too close to the Sun to be seen that night.',
        waxingCrescent: 'Low in the west after sunset; it sets in the evening.',
        firstQuarter: 'Rises around noon and sets around midnight; best in the evening.',
        waxingGibbous: 'Rises in the afternoon and stays up until after midnight.',
        full: 'Rises in the east at sunset and is up all night.',
        waningGibbous: 'Rises after dark and stays up into the morning.',
        lastQuarter: 'Rises around midnight; best in the early morning.',
        waningCrescent: 'Rises in the small hours; look low in the east before dawn.',
      },
      statFraction: 'Illuminated',
      statAge: 'Moon age',
      ageValue: '{n} days',
      waxing: { value: 'Waxing', note: 'getting fuller' },
      waning: { value: 'Waning', note: 'getting thinner' },
      when: '{time} ({zone})',
      whenDefault: '{time} that night ({zone})',
      nearest: 'Nearest full moon: {full} · Nearest new moon: {new}',
      nearestItem: '{date} ({rel})',
      daysAgo: { one: '{n} day ago', other: '{n} days ago' },
      daysLater: { one: 'in {n} day', other: 'in {n} days' },
      sameDay: 'same day',
      yearsExact: 'Full moon',
      yearsNear: '{p}% lit',
      yearsNone: 'None in the next 100 years.',
      echoWhen: '{years} years later',
      echoValue: 'Moon age {age} days, {diff} days apart',
      moonLabel: 'The moon on {date}: {phase}, {p}% lit',
      deviceZone: 'This device ({zone})',
      invalid: 'Choose a date between 1900 and 2100.',
      cardTitle: 'Birthday Moon',
      cardFailed: 'This browser could not create the card',
    },
  },
  ja: {
    dateLabel: '日付',
    timeLabel: '時刻（任意）',
    zoneLabel: 'タイムゾーン',
    timeHint: '誕生日や記念日など、どの日でも調べられます。時刻を入れないときは、その日の21時の月を表示します。',
    today: '今日',
    hemiAria: '月を見る場所',
    north: '北半球',
    south: '南半球',
    download: '画像を保存',
    copyLink: '共有リンクをコピー',
    cycleTitle: 'この月の満ち欠け',
    yearsTitle: 'この日が満月になる年',
    yearsHint: '今日以降で、この日の月がちょうど満月か、ほぼ満月（輝面比97%以上）になる年です。',
    echoTitle: '19年ごとに同じ形の月が戻ってくる',
    echoIntro:
      '235朔望月は約6,939.7日で、19年との差は1日足らずです。そのため同じ日付の月の形は、およそ19年ごとに繰り返します（メトン周期）。同じ計算方法で実際に求めた結果です。',
    method:
      '月の満ち欠けは Jean Meeus『Astronomical Algorithms』の月と太陽の位置計算で求めており、新月・満月の時刻の誤差は数分程度です。月の絵は正立の向きで描いています。実際の傾きは場所と時刻によって変わります。計算はすべてブラウザ内で行われ、日付が送信されることはありません。',
    zoneNames: {
      'Asia/Taipei': '台北',
      'Asia/Tokyo': '東京',
      'Asia/Hong_Kong': '香港',
      'Asia/Shanghai': '北京・上海',
      'Asia/Seoul': 'ソウル',
      'Asia/Singapore': 'シンガポール',
      'Asia/Bangkok': 'バンコク',
      'Asia/Kolkata': 'インド（ニューデリー）',
      'Asia/Dubai': 'ドバイ',
      'Europe/London': 'ロンドン',
      'Europe/Paris': 'パリ',
      'Europe/Berlin': 'ベルリン',
      'America/New_York': 'ニューヨーク',
      'America/Chicago': 'シカゴ',
      'America/Denver': 'デンバー',
      'America/Los_Angeles': 'ロサンゼルス',
      'America/Toronto': 'トロント',
      'America/Sao_Paulo': 'サンパウロ',
      'Pacific/Honolulu': 'ホノルル',
      'Australia/Sydney': 'シドニー',
      'Australia/Perth': 'パース',
      'Pacific/Auckland': 'オークランド',
      UTC: '協定世界時（UTC）',
    },
    client: {
      defaultZone: 'Asia/Tokyo',
      clock24: true,
      lunar: 'japanese',
      lunarLine: '旧暦{n}日',
      traditional: {
        2: { name: '二日月', reading: 'ふつかづき' },
        3: { name: '三日月', reading: 'みかづき' },
        13: { name: '十三夜', reading: 'じゅうさんや' },
        14: { name: '小望月', reading: 'こもちづき' },
        15: { name: '十五夜', reading: 'じゅうごや' },
        16: { name: '十六夜', reading: 'いざよい' },
        17: { name: '立待月', reading: 'たちまちづき' },
        18: { name: '居待月', reading: 'いまちづき' },
        19: { name: '寝待月', reading: 'ねまちづき' },
        20: { name: '更待月', reading: 'ふけまちづき' },
        26: { name: '有明月', reading: 'ありあけづき' },
      },
      phases: {
        new: '新月',
        waxingCrescent: '上弦前の月',
        firstQuarter: '上弦の月',
        waxingGibbous: '満月前の月',
        full: '満月',
        waningGibbous: '下弦前の月',
        lastQuarter: '下弦の月',
        waningCrescent: '新月前の月',
      },
      events: { new: '新月', firstQuarter: '上弦', full: '満月', lastQuarter: '下弦' },
      visibility: {
        new: '太陽とほぼ同じ方向にあるため、この夜は月が見えません。',
        waxingCrescent: '日没後の西の低い空に見え、宵のうちに沈みます。',
        firstQuarter: '昼ごろ昇って真夜中ごろ沈みます。夕方から宵が見ごろです。',
        waxingGibbous: '午後に昇り、夜半過ぎまで空にあります。',
        full: '日没のころ東から昇り、一晩中見えます。',
        waningGibbous: '夜になってから昇り、翌朝まで見えます。',
        lastQuarter: '真夜中ごろ昇り、明け方の空が見ごろです。',
        waningCrescent: '夜明け前に東の低い空へ昇り、明け方だけ見えます。',
      },
      statFraction: '輝面比',
      statAge: '月齢',
      ageValue: '{n}',
      waxing: { value: '満ちていく', note: '新月から満月へ' },
      waning: { value: '欠けていく', note: '満月から新月へ' },
      when: '{time}（{zone}）',
      whenDefault: 'その日の {time}（{zone}）',
      nearest: '近い満月：{full}・近い新月：{new}',
      nearestItem: '{date}（{rel}）',
      daysAgo: { other: '{n}日前' },
      daysLater: { other: '{n}日後' },
      sameDay: '当日',
      yearsExact: 'この日が満月',
      yearsNear: '輝面比 {p}%',
      yearsNone: 'この先100年には見つかりませんでした。',
      echoWhen: '{years}年後',
      echoValue: '月齢 {age}（差 {diff}日）',
      moonLabel: '{date}の月：{phase}、輝面比 {p}%',
      deviceZone: 'この端末（{zone}）',
      invalid: '1900年から2100年までの日付を選んでください。',
      cardTitle: '誕生日の月',
      cardFailed: 'このブラウザでは画像を作成できませんでした',
    },
  },
});
