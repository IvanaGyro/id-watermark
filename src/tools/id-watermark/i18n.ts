import { defineToolI18n } from '../../i18n/tool';
import type { ColorId, LayoutMode, MaskMode, PresetId, TemplateId, TemplateVariants } from './logic';

export interface Strings {
  /** `<strong>{privacyStrong}</strong>{privacyText}` */
  privacyStrong: string;
  privacyText: string;
  dropTitle: string;
  dropHint: string;
  thumbsAria: string;
  previewAria: string;
  sampleBadge: string;

  textHeading: string;
  templateLabel: string;
  templates: Record<TemplateId, string>;
  orgLabel: string;
  orgPlaceholder: string;
  purposeLabel: string;
  purposePlaceholder: string;
  dateOn: string;
  dateAria: string;
  customLabel: string;
  customPlaceholder: string;
  textPreviewLabel: string;

  maskLabel: string;
  maskModes: Record<MaskMode, string>;
  undo: string;
  clearMasks: string;
  maskHint: string;

  styleHeading: string;
  layoutLabel: string;
  layouts: Record<LayoutMode, string>;
  colorLabel: string;
  colors: Record<ColorId, string>;
  customColor: string;
  sizeLabel: string;
  angleLabel: string;
  spacingLabel: string;
  opacityLabel: string;
  outline: string;
  resetStyle: string;

  exportHeading: string;
  formatLabel: string;
  qualityLabel: string;
  maxSideLabel: string;
  /** {n} = pixels */
  maxSideOption: string;
  maxSideOriginal: string;
  exportHint: string;
  download: string;
  zip: string;
  all: string;
  clear: string;
  saveHint: string;

  client: {
    presets: Record<PresetId, TemplateVariants>;
    /** formatIsoDate() pattern */
    dateTemplate: string;
    /** composeText() joiner with {text} and {date} */
    dateJoin: string;
    /** Month names for {mon}; only locales whose date pattern uses it. */
    months?: string[];
    /** Canvas font stack for the watermark text. */
    font: string;
    loading: string;
    /** {n} */
    skipped: string;
    /** {max} */
    tooMany: string;
    /** {name} */
    readError: string;
    /** `{heicBefore}<a>{heicLink}</a>{heicAfter}`, {name} in heicBefore */
    heicBefore: string;
    heicLink: string;
    heicAfter: string;
    /** {name} */
    remove: string;
    /** {name} {n} */
    thumbLabel: string;
    emptyText: string;
    working: string;
    /** {i} {n} */
    progress: string;
    zipping: string;
    /** {name} {size} {width} {height} */
    done: string;
    /** {n} {size} */
    doneMany: string;
    exportError: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    privacyStrong: '證件照片不會上傳',
    privacyText:
      '：加浮水印、遮蔽與輸出都在你的瀏覽器裡完成，照片不會傳到任何伺服器。輸出的新檔案也不會帶有原檔的拍攝資訊與 GPS 位置。',
    dropTitle: '點擊選擇證件照片，或拖曳到這裡',
    dropHint: '可一次選多張，也能直接貼上截圖；支援 JPG、PNG、WebP 與 iPhone 的 HEIC',
    thumbsAria: '已加入的圖片',
    previewAria: '浮水印預覽',
    sampleBadge: '範例圖，加入證件照片後會換成你的圖片',

    textHeading: '浮水印文字',
    templateLabel: '文字範本',
    templates: { apply: '申請用', copy: '影本用', custom: '自訂' },
    orgLabel: '提交對象',
    orgPlaceholder: '例如：○○銀行、○○電信',
    purposeLabel: '用途',
    purposePlaceholder: '例如：開戶、信用卡、手機門號',
    dateOn: '加上日期',
    dateAria: '浮水印日期',
    customLabel: '自訂文字（可換行）',
    customPlaceholder: '例如：僅供○○公司入職資料使用',
    textPreviewLabel: '浮水印內容',

    maskLabel: '遮蔽',
    maskModes: { off: '不遮蔽', black: '黑色方塊', mosaic: '馬賽克' },
    undo: '復原',
    clearMasks: '清除這張的遮蔽',
    maskHint:
      '選「黑色方塊」或「馬賽克」後，在預覽圖上拖曳框出要遮住的地方，例如身分證字號的中間幾碼；每張圖的遮蔽分開設定。要完全看不出內容請用黑色方塊。遮蔽模式下無法用手指捲動預覽圖，用完請切回「不遮蔽」。',

    styleHeading: '樣式',
    layoutLabel: '排列方式',
    layouts: { tile: '滿版斜向', center: '中央大字', both: '兩者都要' },
    colorLabel: '顏色',
    colors: { red: '紅色', gray: '灰色', black: '黑色', blue: '藍色', white: '白色' },
    customColor: '自訂顏色',
    sizeLabel: '文字大小',
    angleLabel: '角度',
    spacingLabel: '間距',
    opacityLabel: '不透明度',
    outline: '文字加描邊（背景花紋複雜時比較清楚）',
    resetStyle: '恢復預設樣式',

    exportHeading: '輸出',
    formatLabel: '格式',
    qualityLabel: '品質',
    maxSideLabel: '輸出尺寸',
    maxSideOption: '長邊 {n} px',
    maxSideOriginal: '原始尺寸',
    exportHint: '證件照片長邊 2400 px 已足夠清楚，檔案也不會太大。輸出時會重新繪製圖片，原檔的 EXIF 拍攝資訊與 GPS 位置都不會保留。',
    download: '下載這張',
    zip: '全部下載（ZIP）',
    all: '逐張下載',
    clear: '清除全部圖片',
    saveHint: '樣式與浮水印文字會記在這台裝置的瀏覽器，下次打開自動套用；圖片與遮蔽範圍不會儲存。',

    client: {
      presets: {
        apply: {
          both: '僅供{org}申請{purpose}使用，他用無效',
          org: '僅供{org}使用，他用無效',
          purpose: '僅供申請{purpose}使用，他用無效',
          none: '僅供本次申請使用，他用無效',
        },
        copy: {
          both: '本影本僅供{org}{purpose}使用，再影印無效',
          org: '本影本僅供{org}使用，再影印無效',
          purpose: '本影本僅供{purpose}使用，再影印無效',
          none: '本影本僅供身分核對使用，再影印無效',
        },
      },
      dateTemplate: '{y}/{mm}/{dd}',
      dateJoin: '{text}\n{date}',
      font: "'PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', 'Heiti TC', system-ui, -apple-system, sans-serif",
      loading: '讀取圖片中…',
      skipped: '已略過 {n} 個不是圖片的檔案（例如 PDF）。',
      tooMany: '一次最多處理 {max} 張圖片，其餘已略過。',
      readError: '「{name}」無法讀取，檔案可能已損毀或格式不支援。',
      heicBefore: '「{name}」是 HEIC 照片，這個瀏覽器無法直接開啟。請先用',
      heicLink: '「HEIC 轉 JPG」工具',
      heicAfter: '轉成 JPG，再回來加浮水印。',
      remove: '移除 {name}',
      thumbLabel: '預覽第 {n} 張：{name}',
      emptyText: '浮水印文字是空的，請輸入文字或選擇範本。',
      working: '處理中…',
      progress: '處理中 {i}/{n}…',
      zipping: '打包中…',
      done: '已輸出 {name}（{width} × {height}，{size}）',
      doneMany: '已輸出 {n} 張，共 {size}',
      exportError: '輸出失敗，圖片可能太大。請把「輸出尺寸」調小後再試一次。',
    },
  },
  en: {
    privacyStrong: 'Your ID photos are never uploaded.',
    privacyText:
      ' The watermark, masking and export all happen in your browser, so the images never leave your device. The saved files also drop the original EXIF data, such as camera details and GPS location.',
    dropTitle: 'Click to choose ID photos or scans, or drop them here',
    dropHint: 'Add several at once or paste a screenshot. JPG, PNG, WebP and iPhone HEIC',
    thumbsAria: 'Added images',
    previewAria: 'Watermark preview',
    sampleBadge: 'Sample image. Add your ID photo to replace it',

    textHeading: 'Watermark text',
    templateLabel: 'Template',
    templates: { apply: 'For … only', copy: 'Copy notice', custom: 'Custom' },
    orgLabel: 'Recipient',
    orgPlaceholder: 'e.g. First City Bank',
    purposeLabel: 'Purpose',
    purposePlaceholder: 'e.g. account opening, rental application',
    dateOn: 'Add date',
    dateAria: 'Watermark date',
    customLabel: 'Custom text (line breaks allowed)',
    customPlaceholder: 'e.g. For employment verification at Acme Inc. only',
    textPreviewLabel: 'Watermark text',

    maskLabel: 'Mask',
    maskModes: { off: 'Off', black: 'Black box', mosaic: 'Mosaic' },
    undo: 'Undo',
    clearMasks: 'Clear masks on this image',
    maskHint:
      'Choose Black box or Mosaic, then drag on the preview to cover something, such as part of your ID number. Each image keeps its own masks. Use Black box when the content must be completely unreadable. While masking is on, touch scrolling over the preview is paused, so switch back to Off when you are done.',

    styleHeading: 'Style',
    layoutLabel: 'Layout',
    layouts: { tile: 'Tiled', center: 'One big line', both: 'Both' },
    colorLabel: 'Color',
    colors: { red: 'Red', gray: 'Gray', black: 'Black', blue: 'Blue', white: 'White' },
    customColor: 'Custom color',
    sizeLabel: 'Text size',
    angleLabel: 'Angle',
    spacingLabel: 'Spacing',
    opacityLabel: 'Opacity',
    outline: 'Outline the text (clearer on busy backgrounds)',
    resetStyle: 'Reset style',

    exportHeading: 'Export',
    formatLabel: 'Format',
    qualityLabel: 'Quality',
    maxSideLabel: 'Output size',
    maxSideOption: 'Long edge {n} px',
    maxSideOriginal: 'Original size',
    exportHint:
      'A long edge of 2400 px keeps ID text sharp at a modest file size. Images are redrawn on export, so EXIF data such as camera details and GPS location is not carried over.',
    download: 'Download this image',
    zip: 'Download all (ZIP)',
    all: 'Download one by one',
    clear: 'Remove all images',
    saveHint: 'Style and watermark text are remembered in this browser. Images and masks are never stored.',

    client: {
      presets: {
        apply: {
          both: 'For {purpose} with {org} only',
          org: 'For {org} use only',
          purpose: 'For {purpose} only',
          none: 'For identity verification only',
        },
        copy: {
          both: 'Copy for {purpose} with {org} only. Not valid for any other use',
          org: 'Copy for {org} only. Not valid for any other use',
          purpose: 'Copy for {purpose} only. Not valid for any other use',
          none: 'Copy for verification only. Not valid for any other use',
        },
      },
      dateTemplate: '{mon} {d}, {y}',
      dateJoin: '{text} – {date}',
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      font: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      loading: 'Loading images…',
      skipped: 'Skipped {n} file(s) that are not images (such as PDFs).',
      tooMany: 'Up to {max} images at a time. The rest were skipped.',
      readError: 'Could not read “{name}”. The file may be damaged or in an unsupported format.',
      heicBefore: '“{name}” is a HEIC photo this browser cannot open. Convert it with the ',
      heicLink: 'HEIC to JPG converter',
      heicAfter: ' first, then add it here.',
      remove: 'Remove {name}',
      thumbLabel: 'Preview image {n}: {name}',
      emptyText: 'The watermark text is empty. Type some text or pick a template.',
      working: 'Working…',
      progress: 'Working {i}/{n}…',
      zipping: 'Creating ZIP…',
      done: 'Saved {name} ({width} × {height}, {size})',
      doneMany: 'Saved {n} images, {size} in total',
      exportError: 'Export failed. The image may be too large; choose a smaller output size and try again.',
    },
  },
  ja: {
    privacyStrong: '身分証の画像はアップロードされません。',
    privacyText:
      '透かし入れ・塗りつぶし・書き出しはすべてブラウザ内で行われ、画像がサーバーに送られることはありません。保存したファイルには、元画像の撮影情報や GPS の位置情報も残りません。',
    dropTitle: 'クリックして身分証の写真を選ぶか、ここにドラッグ',
    dropHint: '複数まとめて追加でき、スクリーンショットの貼り付けにも対応。JPG・PNG・WebP・iPhone の HEIC',
    thumbsAria: '追加した画像',
    previewAria: '透かしのプレビュー',
    sampleBadge: 'サンプル画像です。身分証の写真を追加すると置き換わります',

    textHeading: '透かしの文字',
    templateLabel: 'テンプレート',
    templates: { apply: '提出先・用途', copy: 'コピー用', custom: '自由入力' },
    orgLabel: '提出先',
    orgPlaceholder: '例：〇〇銀行、〇〇不動産',
    purposeLabel: '用途',
    purposePlaceholder: '例：口座開設、賃貸契約',
    dateOn: '日付を入れる',
    dateAria: '透かしの日付',
    customLabel: '自由入力（改行できます）',
    customPlaceholder: '例：〇〇株式会社 入社手続き専用',
    textPreviewLabel: '透かしの内容',

    maskLabel: '塗りつぶし',
    maskModes: { off: 'オフ', black: '黒塗り', mosaic: 'モザイク' },
    undo: '元に戻す',
    clearMasks: 'この画像の塗りつぶしを消去',
    maskHint:
      '「黒塗り」か「モザイク」を選んで、プレビュー上をドラッグすると隠したい部分を覆えます。設定は画像ごとに保存されます。内容を完全に読めなくしたいときは黒塗りを使ってください。塗りつぶし中はプレビュー上で指によるスクロールが止まるので、終わったら「オフ」に戻してください。',

    styleHeading: 'スタイル',
    layoutLabel: '配置',
    layouts: { tile: '全面くり返し', center: '中央に 1 行', both: '両方' },
    colorLabel: '色',
    colors: { red: '赤', gray: 'グレー', black: '黒', blue: '青', white: '白' },
    customColor: 'ほかの色',
    sizeLabel: '文字の大きさ',
    angleLabel: '角度',
    spacingLabel: '間隔',
    opacityLabel: '不透明度',
    outline: '文字に縁取りを付ける（背景の模様が細かいときに見やすい）',
    resetStyle: 'スタイルを初期設定に戻す',

    exportHeading: '書き出し',
    formatLabel: '形式',
    qualityLabel: '画質',
    maxSideLabel: '出力サイズ',
    maxSideOption: '長辺 {n} px',
    maxSideOriginal: '元のサイズ',
    exportHint:
      '本人確認書類なら長辺 2400 px で文字まで十分読め、ファイルサイズも抑えられます。書き出し時に画像を描き直すため、撮影日時や GPS などの Exif 情報は残りません。',
    download: 'この画像を保存',
    zip: 'すべて保存（ZIP）',
    all: '1 枚ずつ保存',
    clear: '画像をすべて削除',
    saveHint: 'スタイルと透かしの文字はこのブラウザに保存され、次回も使えます。画像と塗りつぶしの範囲は保存されません。',

    client: {
      presets: {
        apply: {
          both: '{org} {purpose}用　他の目的での使用禁止',
          org: '{org}提出用　他の目的での使用禁止',
          purpose: '{purpose}用　他の目的での使用禁止',
          none: '本人確認専用　他の目的での使用禁止',
        },
        copy: {
          both: '{org}の{purpose}以外には使用できません　複製禁止',
          org: '{org}への提出以外には使用できません　複製禁止',
          purpose: '{purpose}以外には使用できません　複製禁止',
          none: '本人確認以外には使用できません　複製禁止',
        },
      },
      dateTemplate: '{y}年{m}月{d}日',
      dateJoin: '{text}\n{date}',
      font: "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', YuGothic, Meiryo, 'Noto Sans JP', system-ui, sans-serif",
      loading: '画像を読み込み中…',
      skipped: '画像ではないファイル（PDF など）を {n} 件スキップしました。',
      tooMany: '一度に処理できるのは {max} 枚までです。残りはスキップしました。',
      readError: '「{name}」を読み込めませんでした。ファイルが壊れているか、対応していない形式です。',
      heicBefore: '「{name}」は HEIC 形式の写真で、このブラウザでは開けません。',
      heicLink: '「HEIC JPG 変換」',
      heicAfter: 'で JPG に変換してから追加してください。',
      remove: '{name} を削除',
      thumbLabel: '{n} 枚目をプレビュー：{name}',
      emptyText: '透かしの文字が空です。文字を入力するか、テンプレートを選んでください。',
      working: '処理中…',
      progress: '処理中 {i}/{n}…',
      zipping: 'ZIP を作成中…',
      done: '{name} を保存しました（{width} × {height}、{size}）',
      doneMany: '{n} 枚を保存しました（合計 {size}）',
      exportError: '書き出しに失敗しました。画像が大きすぎる可能性があります。「出力サイズ」を小さくして、もう一度お試しください。',
    },
  },
});
