import { defineToolI18n } from '../../i18n/tool';
import type { PluralForms } from '../../i18n/format';
import type { Frame, PaletteId, Shape } from './logic';

export interface Strings {
  /** `<strong>{privacyStrong}</strong>{privacyText}` */
  privacyStrong: string;
  privacyText: string;
  dropTitle: string;
  dropHint: string;
  widthLabel: string;
  widthCustom: string;
  frameLabel: string;
  frames: Record<Frame, string>;
  paletteLabel: string;
  /** {n} = number of colors in the palette. */
  palettes: Record<PaletteId, string>;
  /** `{maxColorsBefore}<output>16</output>{maxColorsAfter}` */
  maxColorsBefore: string;
  maxColorsAfter: string;
  boardLabel: string;
  boardHint: string;
  shapeLabel: string;
  shapes: Record<Shape, string>;
  removeBgLabel: string;
  removeBgHint: string;
  ditherLabel: string;
  ditherHint: string;
  symbolsLabel: string;
  statSize: string;
  statBeads: string;
  statColors: string;
  statBoards: string;
  zoomOut: string;
  zoomIn: string;
  zoomFit: string;
  undo: string;
  resetEdits: string;
  viewerAria: string;
  editTitle: string;
  eraser: string;
  swatchesAria: string;
  legendTitle: string;
  colorNote: string;
  download: string;
  print: string;
  saveHint: string;
  client: {
    notImage: string;
    readError: string;
    exportError: string;
    sampleName: string;
    /** {name} = file name. */
    current: string;
    /** Shown while no brush color is picked. */
    editHint: string;
    /** {name} = color name, {symbol} = its symbol. */
    brushOn: string;
    eraserOn: string;
    /** Tapping without a brush: {x} column, {y} row, {name} color or emptyName. */
    cellInfo: string;
    emptyName: string;
    /** {name} = color name, {symbol} = its symbol. */
    colorWithSymbol: string;
    edited: PluralForms;
    beads: PluralForms;
    pegboards: PluralForms;
    /** {n} total, {a} across, {d} down. */
    boardsValue: string;
    /** Finished size, {w} × {h} in cm. */
    finished: string;
    legendEmpty: string;
    colColor: string;
    colSymbol: string;
    colName: string;
    colCount: string;
    total: string;
    exportTitle: string;
    exportNote: string;
    /** CSS font family list for text drawn on the canvas. */
    font: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    privacyStrong: '圖片不會上傳',
    privacyText: '：轉換完全在你的瀏覽器中進行，圖片不會離開你的裝置。',
    dropTitle: '點擊選擇圖片，或拖曳到這裡',
    dropHint: '支援 JPG、PNG、WebP、iPhone HEIC 等格式，也可以按 Ctrl/Cmd + V 貼上截圖。下方先用範例圖示範。',
    widthLabel: '寬度（顆）',
    widthCustom: '自訂寬度（顆）',
    frameLabel: '比例',
    frames: { original: '原圖比例', squareCrop: '裁成正方形', squareFit: '完整放進正方形' },
    paletteLabel: '色盤',
    palettes: { full: '完整色盤（{n} 色）', basic: '基本色（{n} 色）', gray: '黑白灰（{n} 色）' },
    maxColorsBefore: '最多使用 ',
    maxColorsAfter: ' 色',
    boardLabel: '拼豆板每邊顆數',
    boardHint: '常見的大方形拼豆板是 29 × 29，圖紙上的紅線就是每片板子的邊界。',
    shapeLabel: '顯示方式',
    shapes: { circle: '圓珠', square: '方格' },
    removeBgLabel: '透明和白色背景不放豆',
    removeBgHint: '只有連到圖片邊緣的白色會當成背景，圖案裡的白色（例如眼睛的反光）會保留。',
    ditherLabel: '混色（抖色）',
    ditherHint: '用相近的顏色交錯排列，模擬漸層與陰影，適合照片；卡通圖和像素圖建議關閉。',
    symbolsLabel: '在豆子上標示符號（列印時方便對照）',
    statSize: '尺寸（顆）',
    statBeads: '豆子總數',
    statColors: '使用顏色',
    statBoards: '需要拼豆板',
    zoomOut: '縮小',
    zoomIn: '放大',
    zoomFit: '符合寬度',
    undo: '復原',
    resetEdits: '清除所有修改',
    viewerAria: '拼豆圖紙。選好下方的顏色後，點擊格子可以換色。',
    editTitle: '修改顏色',
    eraser: '清除',
    swatchesAria: '換色用的顏色',
    legendTitle: '用色清單',
    colorNote:
      '顏色是常見拼豆色的近似值，不是任何品牌的色號；各品牌的顏色不盡相同，購買時請拿實際的豆子比對。完成尺寸以每顆約 5 mm 的標準拼豆估算。',
    download: '下載 PNG 圖紙',
    print: '列印',
    saveHint: '設定會記在這個瀏覽器；圖片不會儲存，也不會上傳。',
    client: {
      notImage: '這不是圖片檔，請選擇 JPG、PNG 或 WebP 等格式的圖片。',
      readError: '無法讀取這張圖片，可能是瀏覽器不支援這個格式，或檔案已損毀。',
      exportError: '無法輸出圖片，請縮小圖紙寬度後再試一次。',
      sampleName: '範例圖片',
      current: '目前的圖片：{name}',
      editHint: '選一個顏色，再點圖紙上的格子就能換色；用滑鼠可以按住拖曳連續塗。',
      brushOn: '點擊或拖曳圖紙，把豆子換成「{name}」（{symbol}）。再點一次色塊可以取消。',
      eraserOn: '點擊或拖曳圖紙，把豆子清除成空格。再點一次可以取消。',
      cellInfo: '第 {x} 欄、第 {y} 列：{name}。先在下方選一個顏色，才能換色。',
      emptyName: '空格',
      colorWithSymbol: '{name}（{symbol}）',
      edited: { other: '已修改 {n} 格' },
      beads: { other: '{n} 顆' },
      pegboards: { other: '拼豆板 {n} 片' },
      boardsValue: '{n} 片（{a} × {d}）',
      finished: '完成約 {w} × {h} cm',
      legendEmpty: '目前沒有任何豆子。可以關閉「透明和白色背景不放豆」，或換一張圖片。',
      colColor: '顏色',
      colSymbol: '符號',
      colName: '名稱',
      colCount: '數量',
      total: '合計',
      exportTitle: '拼豆圖紙',
      exportNote: '顏色為近似值，各品牌色號不同，購買時請以實品比對。',
      font: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif',
    },
  },
  en: {
    privacyStrong: 'Your image is not uploaded.',
    privacyText: ' The pattern is made entirely in your browser, so the picture never leaves your device.',
    dropTitle: 'Click to choose an image, or drop it here',
    dropHint: 'JPG, PNG, WebP, iPhone HEIC and more. You can also paste a screenshot with Ctrl/Cmd + V. A sample picture is loaded below.',
    widthLabel: 'Width (beads)',
    widthCustom: 'Custom width in beads',
    frameLabel: 'Shape',
    frames: { original: 'Original ratio', squareCrop: 'Crop to square', squareFit: 'Fit in square' },
    paletteLabel: 'Palette',
    palettes: { full: 'Full palette ({n} colors)', basic: 'Basic colors ({n})', gray: 'Black, white and grays ({n})' },
    maxColorsBefore: 'Up to ',
    maxColorsAfter: ' colors',
    boardLabel: 'Pegboard size (pegs per side)',
    boardHint: 'Large square pegboards are commonly 29 × 29. The red lines on the pattern mark where each board ends.',
    shapeLabel: 'Display',
    shapes: { circle: 'Beads', square: 'Squares' },
    removeBgLabel: 'Leave transparent and white background empty',
    removeBgHint: 'Only white that connects to the edge of the picture counts as background, so white details such as eye highlights stay.',
    ditherLabel: 'Dithering',
    ditherHint: 'Mixes nearby colors to suggest gradients and shading. Good for photos; leave it off for cartoons and pixel art.',
    symbolsLabel: 'Show a symbol on each bead (handy for printing)',
    statSize: 'Size (beads)',
    statBeads: 'Total beads',
    statColors: 'Colors',
    statBoards: 'Pegboards',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
    zoomFit: 'Fit to width',
    undo: 'Undo',
    resetEdits: 'Discard all edits',
    viewerAria: 'Bead pattern. Pick a color below, then tap a bead to change it.',
    editTitle: 'Edit colors',
    eraser: 'Eraser',
    swatchesAria: 'Colors to paint with',
    legendTitle: 'Shopping list',
    colorNote:
      'Colors are approximate, generic bead shades, not any brand’s color codes. Brands differ, so compare with real beads when you buy. Finished size assumes standard beads of about 5 mm.',
    download: 'Download PNG',
    print: 'Print',
    saveHint: 'Settings are remembered in this browser. Your image is never saved or uploaded.',
    client: {
      notImage: 'This is not an image. Please choose a JPG, PNG, WebP or similar file.',
      readError: 'This image could not be read. Your browser may not support the format, or the file may be damaged.',
      exportError: 'The image could not be saved. Try a smaller pattern width.',
      sampleName: 'Sample picture',
      current: 'Current image: {name}',
      editHint: 'Pick a color, then tap a bead on the pattern to change it. With a mouse you can drag to paint.',
      brushOn: 'Tap or drag on the pattern to paint “{name}” ({symbol}). Tap the swatch again to stop.',
      eraserOn: 'Tap or drag on the pattern to clear beads. Tap the eraser again to stop.',
      cellInfo: 'Column {x}, row {y}: {name}. Pick a color below to change it.',
      emptyName: 'Empty',
      colorWithSymbol: '{name} ({symbol})',
      edited: { one: '{n} bead edited', other: '{n} beads edited' },
      beads: { one: '{n} bead', other: '{n} beads' },
      pegboards: { one: '{n} pegboard', other: '{n} pegboards' },
      boardsValue: '{n} ({a} × {d})',
      finished: 'Finished: about {w} × {h} cm',
      legendEmpty: 'There are no beads yet. Turn off “Leave transparent and white background empty” or try another image.',
      colColor: 'Color',
      colSymbol: 'Symbol',
      colName: 'Name',
      colCount: 'Beads',
      total: 'Total',
      exportTitle: 'Bead pattern',
      exportNote: 'Colors are approximate. Brand color codes differ, so compare with real beads.',
      font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    },
  },
  ja: {
    privacyStrong: '画像はアップロードされません。',
    privacyText: '図案づくりはすべてブラウザの中で行われ、画像が端末の外に出ることはありません。',
    dropTitle: '画像を選ぶか、ここにドロップ',
    dropHint: 'JPG・PNG・WebP・iPhone の HEIC などに対応。Ctrl/Cmd + V でスクリーンショットを貼り付けることもできます。下にはサンプル画像を表示しています。',
    widthLabel: '横の粒数',
    widthCustom: '横の粒数を入力',
    frameLabel: '形',
    frames: { original: '元の比率', squareCrop: '正方形に切り抜く', squareFit: '正方形に収める' },
    paletteLabel: 'パレット',
    palettes: { full: 'フルカラー（{n}色）', basic: '基本色（{n}色）', gray: 'モノクロ（{n}色）' },
    maxColorsBefore: '最大 ',
    maxColorsAfter: ' 色',
    boardLabel: 'プレート 1 辺の粒数',
    boardHint: '大きい正方形プレートは 29 × 29 がよく使われます。図案の赤い線がプレート 1 枚分の区切りです。',
    shapeLabel: '表示',
    shapes: { circle: 'ビーズ', square: '四角' },
    removeBgLabel: '透明・白の背景にはビーズを置かない',
    removeBgHint: '画像のふちとつながっている白だけを背景として扱うので、目のハイライトなど図柄の中の白は残ります。',
    ditherLabel: 'ディザリング',
    ditherHint: '近い色を交互に並べてグラデーションや陰影を表現します。写真向きで、イラストやドット絵はオフがおすすめです。',
    symbolsLabel: 'ビーズに記号を表示（印刷して見ながら作るときに便利）',
    statSize: 'サイズ（粒）',
    statBeads: 'ビーズの総数',
    statColors: '色数',
    statBoards: 'プレート',
    zoomOut: '縮小',
    zoomIn: '拡大',
    zoomFit: '幅に合わせる',
    undo: '元に戻す',
    resetEdits: '修正をすべて取り消す',
    viewerAria: 'アイロンビーズ図案。下で色を選んでからマスをタップすると色を変えられます。',
    editTitle: '色を修正',
    eraser: '消しゴム',
    swatchesAria: '塗る色',
    legendTitle: '使う色と個数',
    colorNote:
      '色はアイロンビーズによくある色の近似で、特定メーカーの色番号ではありません。メーカーによって色味が違うので、購入時は実物と見比べてください。仕上がりサイズは 1 粒約 5 mm の標準サイズで計算しています。',
    download: 'PNG で保存',
    print: '印刷',
    saveHint: '設定はこのブラウザに保存されます。画像は保存も送信もされません。',
    client: {
      notImage: '画像ファイルではありません。JPG・PNG・WebP などの画像を選んでください。',
      readError: 'この画像を読み込めませんでした。ブラウザが対応していない形式か、ファイルが壊れている可能性があります。',
      exportError: '画像を保存できませんでした。横の粒数を減らしてもう一度お試しください。',
      sampleName: 'サンプル画像',
      current: '現在の画像：{name}',
      editHint: '色を選んでから図案のマスをタップすると色を変えられます。マウスならドラッグで続けて塗れます。',
      brushOn: '図案をタップまたはドラッグすると「{name}」（{symbol}）で塗ります。もう一度色を押すと解除します。',
      eraserOn: '図案をタップまたはドラッグするとビーズを消します。もう一度押すと解除します。',
      cellInfo: '{x} 列目・{y} 行目：{name}。色を変えるには下で色を選んでください。',
      emptyName: '空き',
      colorWithSymbol: '{name}（{symbol}）',
      edited: { other: '{n} マス修正済み' },
      beads: { other: '{n} 粒' },
      pegboards: { other: 'プレート {n} 枚' },
      boardsValue: '{n} 枚（{a} × {d}）',
      finished: '仕上がり約 {w} × {h} cm',
      legendEmpty: 'ビーズがありません。「透明・白の背景にはビーズを置かない」をオフにするか、別の画像を試してください。',
      colColor: '色',
      colSymbol: '記号',
      colName: '色名',
      colCount: '個数',
      total: '合計',
      exportTitle: 'アイロンビーズ図案',
      exportNote: '色は近似です。メーカーごとに色番号や色味が違うため、実物と見比べてください。',
      font: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", Meiryo, sans-serif',
    },
  },
});
