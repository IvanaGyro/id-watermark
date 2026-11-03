import { defineToolI18n } from '../../i18n/tool';
import type { Face, Mode, Outcome } from './logic';

export interface OutcomeText {
  /** 聖筊 / 笑筊 / 陰筊 */
  name: string;
  /** Which sides are up, e.g. 一平一凸. */
  faces: string;
  /** The meaning in a few words. */
  short: string;
  /** One or two sentences shown after a throw and in the legend. */
  detail: string;
}

export interface Strings {
  questionLabel: string;
  questionPlaceholder: string;
  modeLabel: string;
  modes: Record<Mode, string>;
  sound: string;
  stageDesc: string;
  streakAria: string;
  throwBtn: string;
  keysHint: string;
  note: string;
  legendTitle: string;
  historyTitle: string;
  statTotal: string;
  theory: string;
  clearHistory: string;
  historyEmpty: string;
  client: {
    outcomes: Record<Outcome, OutcomeText>;
    /** Label under a landed block. */
    faceUp: Record<Face, string>;
    idle: string;
    idleTriple: string;
    tossingBtn: string;
    /** {q} = the question. */
    asked: string;
    /** {n} = 聖筊 so far, {left} = still needed. */
    streakProgress: string;
    streakDone: string;
    /** {name} = the result that broke the run. */
    streakBroken: string;
    streakMiss: string;
    /** {n} = slot number, for the progress dots. */
    streakSlot: string;
    soundOn: string;
    soundOff: string;
    shakeOff: string;
    shakeOn: string;
    shakeReady: string;
    shakeDenied: string;
    shakeNoSensor: string;
    /** {n} = count. */
    times: string;
    /** {n} = throw number. */
    nth: string;
    /** {n} = 聖筊 in a row after this throw, {target} = 3. */
    streakTag: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    questionLabel: '想請示的事（選填）',
    questionPlaceholder: '例如：這份工作適合我嗎？',
    modeLabel: '擲筊方式',
    modes: { single: '單次擲筊', triple: '連續三聖筊' },
    sound: '音效',
    stageDesc: '一對紅色筊杯擲出後落在地上，平面或凸面朝上',
    streakAria: '連續聖筊進度',
    throwBtn: '擲筊',
    keysHint: '也可以直接點一下筊杯畫面，或按空白鍵、Enter 擲筊。',
    note: '結果由瀏覽器的加密亂數產生，每個筊杯平面、凸面朝上的機率各一半。線上擲筊適合用來沉澱心情、整理想法，真正重要的決定，還是要由你自己做主。問題只存在這個瀏覽器，不會上傳。',
    legendTitle: '三種結果怎麼看',
    historyTitle: '擲筊紀錄',
    statTotal: '總次數',
    theory: '理論機率：聖筊 50%、笑筊 25%、陰筊 25%',
    clearHistory: '清除紀錄',
    historyEmpty: '還沒有擲筊紀錄，擲出第一筊後會列在這裡。',
    client: {
      outcomes: {
        sheng: {
          name: '聖筊',
          faces: '一平一凸',
          short: '神明同意',
          detail: '一個平面、一個凸面朝上，也稱為「允筊」，表示神明認同、答應你所請示的事。得到聖筊別忘了向神明道謝。',
        },
        xiao: {
          name: '笑筊',
          faces: '兩個平面朝上',
          short: '神明笑而不答',
          detail: '兩個平面都朝上，表示神明笑而不答：可能是問題問得不夠清楚，或是答案其實已經在你心中。可以把問題想得更具體，再擲一次。',
        },
        yin: {
          name: '陰筊',
          faces: '兩個凸面朝上',
          short: '不同意，再想想',
          detail: '兩個凸面都朝上，表示神明不認同，或時機還不成熟。不妨先停下來想一想，調整想法或做法之後再請示。',
        },
      },
      faceUp: { flat: '平面朝上', round: '凸面朝上' },
      idle: '心裡想著問題，準備好了就擲筊',
      idleTriple: '要連續擲出三個聖筊才算數',
      tossingBtn: '擲筊中',
      asked: '請示：{q}',
      streakProgress: '已連續 {n} 個聖筊，還差 {left} 個',
      streakDone: '連續三個聖筊，神明應允',
      streakBroken: '出現{name}，連續聖筊中斷，從第一筊重新開始',
      streakMiss: '出現{name}，從第一筊重新開始',
      streakSlot: '第 {n} 筊',
      soundOn: '關閉音效',
      soundOff: '開啟音效',
      shakeOff: '搖一搖擲筊',
      shakeOn: '搖一搖：已開啟',
      shakeReady: '握緊手機搖兩下就會擲筊，再按一次按鈕可以關閉。',
      shakeDenied: '沒有取得動作感應的權限，一樣可以按「擲筊」。',
      shakeNoSensor: '這台裝置沒有偵測到動作感應，請按「擲筊」。',
      times: '{n} 次',
      nth: '第 {n} 擲',
      streakTag: '三聖筊 {n}/{target}',
    },
  },
});
