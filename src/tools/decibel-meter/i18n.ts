// UI strings for the decibel meter. Microphone error / permission text is shared with mic-test.
import { defineToolI18n } from '../../i18n/tool';
import { MEDIA_TEXT_ZH, type MediaText } from '../mic-test/logic';
import { MEDIA_TEXT_EN, MEDIA_TEXT_JA } from '../mic-test/media-text';
import type { RankId, TimeWeighting } from './logic';

type Processing = 'echoCancellation' | 'noiseSuppression' | 'autoGainControl';

export interface Strings {
  start: string;
  stop: string;
  stateIdle: string;
  gaugeAria: string;
  idleHint: string;
  statMin: string;
  statAvg: string;
  statMax: string;
  statTime: string;
  historyAria: string;
  reset: string;
  settings: string;
  freqLabel: string;
  weightA: string;
  weightZ: string;
  freqHint: string;
  timeLabel: string;
  timeOption: Record<TimeWeighting, string>;
  timeHint: string;
  offsetLabel: string;
  offsetHint: string;
  calLabel: string;
  calApply: string;
  calHint: string;
  device: string;
  challengeTitle: string;
  challengeIntro: string;
  challengeStart: string;
  challengeCaution: string;
  refTitle: string;
  refLevel: string;
  refExample: string;
  refNote: string;
  /** One label per REFERENCE_LEVELS entry, same order. */
  references: string[];
  privacy: string;
  client: {
    live: string;
    stopped: string;
    starting: string;
    restart: string;
    unitA: string;
    unitZ: string;
    timeShort: Record<TimeWeighting, string>;
    /** {t} = time weighting, {o} = offset with sign. */
    tag: string;
    /** {label} = nearest reference row. */
    near: string;
    waiting: string;
    historyAgo: string;
    historyNow: string;
    fullscreen: string;
    exitFullscreen: string;
    /** {n} = default offset. */
    offsetReset: string;
    /** {list} = processing names joined. */
    processing: string;
    processingNames: Record<Processing, string>;
    silent: string;
    suspended: string;
    resume: string;
    calNeedRun: string;
    /** {min} / {max} = accepted range. */
    calBad: string;
    /** {offset} = new offset. */
    calDone: string;
    noIir: string;
    ch: {
      ready: string;
      go: string;
      cancel: string;
      again: string;
      peak: string;
      avg: string;
      newBest: string;
      /** {db} = best peak with unit. */
      best: string;
      noBest: string;
      clipped: string;
      download: string;
      share: string;
      /** {db} = peak with unit, {rank} = rank title. */
      shareText: string;
      stopped: string;
      cardAlt: string;
      cardNote: string;
      ranks: Record<RankId, { title: string; line: string }>;
    };
    media: MediaText;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    start: '開始測量',
    stop: '停止',
    stateIdle: '未啟動',
    gaugeAria: '目前音量',
    idleHint: '按「開始測量」並允許使用麥克風',
    statMin: '最低',
    statAvg: '平均（Leq）',
    statMax: '最高',
    statTime: '測量時間',
    historyAria: '最近 60 秒的音量變化圖',
    reset: '重新計算',
    settings: '測量設定與校正',
    freqLabel: '頻率加權',
    weightA: 'A 加權 dB(A)',
    weightZ: '不加權 dB(Z)',
    freqHint: 'A 加權依人耳對不同頻率的敏感度調整，環境噪音一般都用 dB(A)；不加權則把低頻聲音也完整算進來。',
    timeLabel: '時間加權',
    timeOption: { fast: 'Fast（0.125 秒）', slow: 'Slow（1 秒）' },
    timeHint: 'Fast 反應快，適合看說話、尖叫這類瞬間的音量；Slow 比較平穩，適合讀取冷氣、車流這類持續的噪音。',
    offsetLabel: '校正值（dB）',
    offsetHint:
      '顯示的分貝 = 麥克風的數位音量（dBFS）＋ 校正值。瀏覽器不知道你的麥克風有多靈敏，預設的 94 只是讓一般手機和筆電落在合理範圍的起點，實際可能差很多；有實體分貝計的話，用下面的方式校正最準。',
    calLabel: '實體分貝計的讀數（dB）',
    calApply: '依此校正',
    calHint:
      '把手機或電腦放在分貝計旁邊，一起對著同一個穩定的聲音（例如電風扇），兩邊都用 A 加權。等讀數穩定後輸入分貝計上的數字，工具會用最近 3 秒的平均算出校正值。',
    device: '輸入裝置',
    challengeTitle: '尖叫挑戰',
    challengeIntro: '倒數 3 秒後用力喊 3 秒，看看你能喊到幾分貝。只即時測量音量，不會錄音。',
    challengeStart: '開始挑戰',
    challengeCaution: '別對著別人的耳朵喊，喉嚨不舒服就停下來。分數會受校正值和麥克風影響，換裝置後不一定能直接比較。',
    refTitle: '常見聲音大約幾分貝',
    refLevel: '分貝',
    refExample: '常見的聲音',
    refNote: '以上是常被引用的約略值，實際音量會隨距離和環境改變。測量時，最接近目前音量的那一列會標示出來。',
    references: [
      '樹葉沙沙聲、時鐘的秒針聲',
      '輕聲耳語、深夜的郊區',
      '圖書館、安靜的住宅區',
      '安靜的辦公室、冷氣室外機',
      '一般對話',
      '吵雜的辦公室、吸塵器',
      '捷運車廂內、車多的路口',
      'KTV 包廂、吵雜的工廠',
      '電鑽、火車經過的高架橋下',
      '汽車喇叭（前方約 2 公尺）',
      '飛機引擎附近、近距離的雷聲',
    ],
    privacy: '聲音只在你的瀏覽器裡即時分析，不會錄音，也不會上傳到任何伺服器；關閉或離開頁面時，麥克風會自動停止。',
    client: {
      live: '測量中',
      stopped: '已停止',
      starting: '啟動中',
      restart: '重新測量',
      unitA: 'dB(A)',
      unitZ: 'dB(Z)',
      timeShort: { fast: 'Fast', slow: 'Slow' },
      tag: '估計值 · {t} · 校正 {o}',
      near: '大約是：{label}',
      waiting: '正在聽周圍的聲音…',
      historyAgo: '60 秒前',
      historyNow: '現在',
      fullscreen: '全螢幕',
      exitFullscreen: '離開全螢幕',
      offsetReset: '恢復預設（{n}）',
      processing: '瀏覽器沒有關閉{list}，讀數可能被壓低或忽大忽小，請當作粗略參考。',
      processingNames: { echoCancellation: '回音消除', noiseSuppression: '降噪', autoGainControl: '自動增益' },
      silent: '麥克風傳來的是完全無聲的訊號，可能被靜音，或正被其他程式占用。',
      suspended: '音訊暫停了（例如來電或切換到其他 App）。',
      resume: '繼續測量',
      calNeedRun: '請先按「開始測量」，在穩定的聲音中等 3 秒再校正。',
      calBad: '請輸入 {min} 到 {max} 之間的分貝數。',
      calDone: '已校正，校正值改為 {offset}。',
      noIir: '這個瀏覽器不支援 A 加權濾波，只能顯示不加權的 dB(Z)。',
      ch: {
        ready: '準備好…',
        go: '用力喊！',
        cancel: '取消',
        again: '再挑戰一次',
        peak: '最高音量',
        avg: '平均音量',
        newBest: '新紀錄！',
        best: '最高紀錄 {db}',
        noBest: '還沒有紀錄',
        clipped: '收音已達麥克風的上限，實際音量可能更大。',
        download: '下載結果圖',
        share: '分享',
        shareText: '我在尖叫挑戰喊到 {db}，等級是「{rank}」！你能喊多大聲？',
        stopped: '麥克風停止了，挑戰中斷，請再試一次。',
        cardAlt: '尖叫挑戰結果圖',
        cardNote: '以瀏覽器麥克風估計，僅供娛樂',
        ranks: {
          whisper: { title: '悄悄話', line: '這音量適合在圖書館說秘密，再大聲一點吧！' },
          chat: { title: '日常聊天', line: '跟朋友聊天剛剛好，離尖叫還有一段距離。' },
          strong: { title: '中氣十足', line: '隔壁桌應該聽得到了，繼續加油！' },
          loud: { title: '大聲公', line: '整間教室的人都會回頭，肺活量很不錯。' },
          roar: { title: '獅子吼', line: '跟 KTV 包廂一樣熱鬧，記得讓喉嚨休息一下。' },
          siren: { title: '人肉警報器', line: '已經接近電鑽的音量，請保護好耳朵和嗓子！' },
        },
      },
      media: MEDIA_TEXT_ZH,
    },
  },
  en: {
    start: 'Start measuring',
    stop: 'Stop',
    stateIdle: 'Off',
    gaugeAria: 'Current sound level',
    idleHint: 'Press “Start measuring” and allow the microphone',
    statMin: 'Min',
    statAvg: 'Average (Leq)',
    statMax: 'Max',
    statTime: 'Duration',
    historyAria: 'Sound level over the last 60 seconds',
    reset: 'Reset',
    settings: 'Settings and calibration',
    freqLabel: 'Frequency weighting',
    weightA: 'A-weighted dB(A)',
    weightZ: 'Unweighted dB(Z)',
    freqHint:
      'A-weighting follows how sensitive human hearing is at different pitches, which is why noise levels are usually quoted in dB(A). Unweighted counts low rumble in full.',
    timeLabel: 'Time weighting',
    timeOption: { fast: 'Fast (125 ms)', slow: 'Slow (1 s)' },
    timeHint: 'Fast reacts quickly, good for voices and shouts. Slow is steadier, good for reading constant noise such as traffic or an air conditioner.',
    offsetLabel: 'Calibration offset (dB)',
    offsetHint:
      'Displayed level = the microphone’s digital level (dBFS) + this offset. The browser can’t know how sensitive your mic is, so the default of 94 is only a starting point that puts typical phones and laptops in a plausible range; your device may be far off. If you have a real sound level meter, calibrate against it below.',
    calLabel: 'Reading on a real meter (dB)',
    calApply: 'Calibrate',
    calHint:
      'Put your phone or laptop next to the meter, both facing the same steady sound (a fan works well), with the meter set to A-weighting. Once the reading settles, enter the meter’s number. The tool uses the average of the last 3 seconds to work out the offset.',
    device: 'Input device',
    challengeTitle: 'Scream challenge',
    challengeIntro: 'After a 3-second countdown, shout as loud as you can for 3 seconds and see how many decibels you reach. Only the level is measured; nothing is recorded.',
    challengeStart: 'Start the challenge',
    challengeCaution:
      'Never shout into someone’s ear, and stop if your throat hurts. Scores depend on the calibration offset and the microphone, so results from different devices aren’t directly comparable.',
    refTitle: 'How loud are everyday sounds?',
    refLevel: 'Level',
    refExample: 'Typical sound',
    refNote: 'Commonly cited approximate values; real levels change with distance and surroundings. While measuring, the row closest to the current level is highlighted.',
    references: [
      'Rustling leaves, a ticking clock',
      'Whisper, a quiet bedroom at night',
      'Library, a quiet neighborhood',
      'Quiet office, moderate rainfall',
      'Normal conversation',
      'Vacuum cleaner, a noisy office',
      'Heavy traffic, an alarm clock up close',
      'Shouting up close, a noisy factory',
      'Jackhammer, a loud nightclub',
      'Car horn up close, a rock concert',
      'Thunderclap, a siren up close',
    ],
    privacy:
      'Audio is analyzed live in your browser. Nothing is recorded or uploaded, and the microphone stops automatically when you close or leave the page.',
    client: {
      live: 'Measuring',
      stopped: 'Stopped',
      starting: 'Starting',
      restart: 'Measure again',
      unitA: 'dB(A)',
      unitZ: 'dB(Z)',
      timeShort: { fast: 'Fast', slow: 'Slow' },
      tag: 'Estimate · {t} · offset {o}',
      near: 'About as loud as: {label}',
      waiting: 'Listening…',
      historyAgo: '60 s ago',
      historyNow: 'Now',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      offsetReset: 'Reset to {n}',
      processing: 'Your browser kept {list} on, so readings may be squashed or jumpy. Treat them as a rough guide.',
      processingNames: { echoCancellation: 'echo cancellation', noiseSuppression: 'noise suppression', autoGainControl: 'automatic gain control' },
      silent: 'The microphone is sending pure digital silence. It may be muted or in use by another app.',
      suspended: 'Audio was paused (for example by a call or by switching apps).',
      resume: 'Resume',
      calNeedRun: 'Press “Start measuring” first and let a steady sound run for 3 seconds, then calibrate.',
      calBad: 'Enter a level between {min} and {max} dB.',
      calDone: 'Calibrated. The offset is now {offset}.',
      noIir: 'This browser can’t run the A-weighting filter, so only unweighted dB(Z) is available.',
      ch: {
        ready: 'Get ready…',
        go: 'Scream!',
        cancel: 'Cancel',
        again: 'Try again',
        peak: 'Peak',
        avg: 'Average',
        newBest: 'New record!',
        best: 'Best: {db}',
        noBest: 'No record yet',
        clipped: 'Your microphone hit its limit, so you were probably even louder.',
        download: 'Download image',
        share: 'Share',
        shareText: 'I hit {db} in the scream challenge and earned “{rank}”. How loud can you go?',
        stopped: 'The microphone stopped, so the challenge was cut short. Please try again.',
        cardAlt: 'Scream challenge result card',
        cardNote: 'Estimated with a browser microphone, just for fun',
        ranks: {
          whisper: { title: 'Secret keeper', line: 'Library-safe volume. You can give it more!' },
          chat: { title: 'Casual chatter', line: 'Perfect for chatting with friends. A real scream is still a way off.' },
          strong: { title: 'Strong voice', line: 'The next table can hear you now. Keep going!' },
          loud: { title: 'Megaphone', line: 'The whole room just turned around. Great lungs!' },
          roar: { title: 'Lion’s roar', line: 'Factory-floor loud. Give your throat a rest.' },
          siren: { title: 'Human siren', line: 'Jackhammer territory. Mind your ears and your voice!' },
        },
      },
      media: MEDIA_TEXT_EN,
    },
  },
  ja: {
    start: '測定を開始',
    stop: '停止',
    stateIdle: '停止中',
    gaugeAria: '現在の音量',
    idleHint: '「測定を開始」を押して、マイクの使用を許可してください',
    statMin: '最小',
    statAvg: '平均（Leq）',
    statMax: '最大',
    statTime: '測定時間',
    historyAria: '直近 60 秒の音量グラフ',
    reset: 'リセット',
    settings: '測定設定と校正',
    freqLabel: '周波数重み付け',
    weightA: 'A 特性 dB(A)',
    weightZ: '平坦特性 dB(Z)',
    freqHint: 'A 特性は周波数ごとの耳の感度に合わせた補正で、騒音の大きさはふつう dB(A) で表します。平坦特性は低い音もそのまま計算に入れます。',
    timeLabel: '時間重み付け（動特性）',
    timeOption: { fast: 'FAST（0.125 秒）', slow: 'SLOW（1 秒）' },
    timeHint: 'FAST は反応が速く、話し声や叫び声など一瞬の音量を見るのに向いています。SLOW は表示が落ち着き、エアコンや道路の音など続く騒音を読むのに向いています。',
    offsetLabel: '校正値（dB）',
    offsetHint:
      '表示値 = マイクのデジタル音量（dBFS）＋ 校正値です。ブラウザはマイクの感度を知らないため、初期値の 94 は一般的なスマホやパソコンがおおよその範囲に収まるための目安にすぎず、機種によっては大きくずれます。実際の騒音計があれば、下の方法で校正するのがいちばん確実です。',
    calLabel: '騒音計の表示値（dB）',
    calApply: 'この値で校正',
    calHint:
      'スマホやパソコンを騒音計のすぐ横に置き、同じ一定の音（扇風機など）に向けます。騒音計は A 特性にしてください。表示が落ち着いたら騒音計の値を入力すると、直近 3 秒の平均から校正値を計算します。',
    device: '入力デバイス',
    challengeTitle: '大声チャレンジ',
    challengeIntro: '3 秒のカウントダウンのあと、3 秒間せいいっぱい叫んで、何デシベル出せるか測ります。測るのは音量だけで、録音はしません。',
    challengeStart: 'チャレンジ開始',
    challengeCaution: '人の耳元で叫ぶのはやめましょう。のどが痛くなったらすぐに中止してください。スコアは校正値やマイクで変わるため、別の端末との単純な比較はできません。',
    refTitle: '身近な音の大きさの目安',
    refLevel: '音の大きさ',
    refExample: '音の例',
    refNote: 'よく使われるおおよその目安で、実際の値は距離や環境で変わります。測定中は、現在の音量にいちばん近い行が強調されます。',
    references: [
      '木の葉のふれあう音、置き時計の秒針',
      'ささやき声、郊外の深夜',
      '図書館、静かな住宅地の昼',
      '静かな事務所、エアコンの室外機',
      '普通の会話、静かな乗用車の中',
      '騒がしい事務所、掃除機',
      '地下鉄の車内、ピアノ（正面 1 m）',
      'カラオケ店内、騒々しい工場の中',
      '電車が通るときのガード下',
      '自動車のクラクション（前方 2 m）',
      '飛行機のエンジンの近く',
    ],
    privacy: '音声はブラウザ内でリアルタイムに解析するだけで、録音もサーバーへの送信もしません。ページを閉じたり移動したりすると、マイクは自動で停止します。',
    client: {
      live: '測定中',
      stopped: '停止しました',
      starting: '起動中',
      restart: 'もう一度測定',
      unitA: 'dB(A)',
      unitZ: 'dB(Z)',
      timeShort: { fast: 'FAST', slow: 'SLOW' },
      tag: '推定値 · {t} · 校正 {o}',
      near: '目安：{label}',
      waiting: '周りの音を聞いています…',
      historyAgo: '60 秒前',
      historyNow: '現在',
      fullscreen: '全画面',
      exitFullscreen: '全画面を終了',
      offsetReset: '初期値（{n}）に戻す',
      processing: 'ブラウザが{list}をオフにしなかったため、値が低めに出たり不安定になったりすることがあります。おおよその参考にしてください。',
      processingNames: { echoCancellation: 'エコーキャンセル', noiseSuppression: 'ノイズ抑制', autoGainControl: '自動ゲイン調整' },
      silent: 'マイクから完全な無音が届いています。ミュートされているか、ほかのアプリが使用中の可能性があります。',
      suspended: '音声が一時停止しました（着信やアプリの切り替えなど）。',
      resume: '測定を再開',
      calNeedRun: '先に「測定を開始」を押し、一定の音を 3 秒ほど流してから校正してください。',
      calBad: '{min}〜{max} dB の値を入力してください。',
      calDone: '校正しました。校正値は {offset} です。',
      noIir: 'このブラウザは A 特性のフィルターに対応していないため、平坦特性 dB(Z) のみ表示します。',
      ch: {
        ready: '準備して…',
        go: '叫んで！',
        cancel: 'キャンセル',
        again: 'もう一度',
        peak: '最大音量',
        avg: '平均音量',
        newBest: '自己ベスト更新！',
        best: '自己ベスト {db}',
        noBest: '記録なし',
        clipped: 'マイクの上限に達しました。実際はもっと大きな声だった可能性があります。',
        download: '結果画像を保存',
        share: '共有',
        shareText: '大声チャレンジで {db}、ランクは「{rank}」でした。あなたはどこまで出せる？',
        stopped: 'マイクが停止したため、チャレンジを中断しました。もう一度お試しください。',
        cardAlt: '大声チャレンジの結果画像',
        cardNote: 'ブラウザのマイクによる推定値・お楽しみ用',
        ranks: {
          whisper: { title: 'ひそひそ声', line: '図書館でも気づかれない音量です。まだまだ出せます！' },
          chat: { title: 'おしゃべり', line: '友だちとの会話にちょうどいい声量。叫び声まではあと少し。' },
          strong: { title: 'よく通る声', line: '隣のテーブルまで届いています。その調子！' },
          loud: { title: '拡声器', line: '部屋じゅうが振り向くレベル。肺活量はばっちりです。' },
          roar: { title: '獅子の咆哮', line: 'カラオケ店内並みの大声です。のどを休めてあげてください。' },
          siren: { title: '人間サイレン', line: '電車のガード下に迫る音量。耳とのどに気をつけて！' },
        },
      },
      media: MEDIA_TEXT_JA,
    },
  },
});
