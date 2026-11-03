import { defineTool } from '../types';

export default defineTool({
  slug: 'heic-to-jpg',
  name: 'HEIC 轉 JPG',
  seoTitle: 'HEIC 轉 JPG：iPhone 照片批次轉檔（免上傳）',
  description:
    '免費 HEIC 轉 JPG 線上工具，把 iPhone 拍的 HEIC、HEIF 照片批次轉成 JPG 或 PNG，可調整品質、一次打包下載。照片只在瀏覽器內轉檔不會上傳，Windows 打不開 HEIC 檔案也能用。',
  category: 'image',
  icon: 'Smartphone',
  keywords: [
    'HEIC 轉 JPG',
    'heic轉jpg',
    'HEIC 轉檔',
    'HEIC 轉 PNG',
    'HEIC 檔案怎麼開',
    'HEIC 打不開',
    'iPhone 照片轉 JPG',
    'iPhone 照片格式',
    'HEIF 轉 JPG',
    'heic jpg 轉換',
    'heic to jpg',
    'heic converter',
  ],
  intro:
    '把 iPhone 拍的 HEIC 照片批次轉成 JPG 或 PNG，讓 Windows、舊版軟體與各種上傳表單都能開啟。轉檔全程在你的裝置上進行，照片不會上傳。',
  howTo: [
    '點擊上方虛線區塊選擇 HEIC 照片，或直接把照片拖曳進來；可一次選多張，副檔名 .heic、.heif 都可以。',
    '在「輸出格式」選擇 JPG 或 PNG。一般照片選 JPG 即可，檔案較小、相容性最好。',
    '選 JPG 時可拖曳「品質」滑桿，建議 85–92，數字越高越接近原始畫質、檔案也越大。',
    '每張照片轉好後會顯示轉檔後的大小與尺寸，按「下載」取得單張，或按「全部下載（ZIP）」一次存成壓縮檔。',
  ],
  sections: [
    {
      heading: 'HEIC 是什麼？為什麼 iPhone 照片是 HEIC？',
      body: [
        'HEIC 是 HEIF（High Efficiency Image File Format，高效率影像格式）的一種，影像內容以 HEVC（H.265）編碼壓縮。Apple 從 iOS 11 開始，在 iPhone 7 及之後的機型預設用 HEIC 儲存照片，原因很單純：同樣的畫質下，HEIC 的檔案大約只有 JPG 的一半，可以省下手機與 iCloud 的大量空間，還能保存 10 位元色彩深度與連拍、原況照片等多張影像。',
        '缺點是相容性。JPG 已經有三十年歷史，幾乎所有軟體、網站與印表機都支援；HEIC 則需要作業系統或軟體額外支援。Mac 與 iPhone 能直接開啟，但許多 Windows 電腦、舊版 Photoshop、公司內部系統與政府或學校的報名網站上傳照片時只接受 JPG 或 PNG，這時就需要先把 HEIC 轉成 JPG。',
      ],
    },
    {
      heading: '讓 iPhone 直接拍 JPG：把相機格式改成「最相容」',
      body: [
        '如果經常需要把照片傳到 Windows 電腦或上傳到網站，可以直接改 iPhone 的拍照格式：開啟「設定」>「相機」>「格式」，把「高效率」改成「最相容」。之後拍攝的照片就會以 JPG 儲存，影片則改用 H.264，代價是照片檔案約變成原本的兩倍大。這個設定只影響之後拍的照片，已經拍好的 HEIC 照片不會自動轉換，仍要用本工具轉檔。',
        '另一個常用設定在「設定」>「照片」最下方的「傳輸到 Mac 或 PC」，選擇「自動」時，用傳輸線把照片匯入電腦，iPhone 會自動轉成相容的 JPG；選「保留原始檔」則會維持 HEIC。用 iPhone 內建的「郵件」寄出照片，或上傳到 LINE、Facebook 等社群平台時，系統或平台通常也會自動轉成 JPG；但透過 AirDrop 傳給 Mac、從 iCloud 網頁下載原始檔，或用雲端硬碟同步時，拿到的多半仍是 HEIC。',
      ],
    },
    {
      heading: 'Windows 打不開 HEIC 檔案怎麼辦？',
      body: [
        'Windows 10 與 Windows 11 需要安裝 Microsoft Store 的「HEIF 影像延伸模組」才能讀取 HEIF 格式，而 iPhone 照片的影像內容是 HEVC 編碼，還需要「HEVC 視訊延伸模組」，後者在多數地區需付少許費用。即使裝好延伸模組，也只有「相片」等支援的程式能開啟，Office、舊版繪圖軟體或網頁上傳仍可能不認得 HEIC。',
        '因此最省事的做法是直接把 HEIC 轉成 JPG。本工具會先嘗試使用瀏覽器內建的解碼器（Safari 可直接讀取 HEIC），若瀏覽器不支援，則在網頁中載入開源的 HEIC 解碼程式完成轉換。全程在你的裝置上處理，不需要安裝軟體，也不必把私人照片上傳到不明的轉檔網站。',
      ],
    },
    {
      heading: 'JPG 還是 PNG？品質要設多少？',
      body: [
        'iPhone 照片是相片內容，轉成 JPG 最合適：品質 90 左右肉眼幾乎看不出與原圖的差異。因為 JPG 的壓縮效率不如 HEIC，轉出的 JPG 通常會比原本的 HEIC 大，例如 2 MB 的 HEIC 轉成品質 90 的 JPG 可能變成 3 到 4 MB，這是正常現象，並不是畫質提高。若要寄送或上傳有大小限制，可把品質降到 80，或再用圖片壓縮工具縮小尺寸。',
        'PNG 是無損格式，不會再損失任何畫質，但照片轉成 PNG 檔案常常是 JPG 的三到五倍，只建議在需要後製、或對方明確要求 PNG 時使用。轉檔時照片會重新編碼，原本的 EXIF 資訊（拍攝時間、相機型號與 GPS 位置）不會保留，把照片分享給陌生人或上傳網路前反而更有隱私保障。',
      ],
    },
  ],
  faq: [
    {
      q: 'HEIC 轉 JPG 會上傳我的照片嗎？',
      a: '不會。轉檔完全在你的瀏覽器中進行，照片不會傳送到任何伺服器，適合處理家人照片、證件照等私密影像。',
    },
    {
      q: '為什麼轉出來的 JPG 比原本的 HEIC 還大？',
      a: 'HEIC 的壓縮效率約是 JPG 的兩倍，同樣畫質下 JPG 本來就比較大。想要小一點，可以把品質調到 80 左右，或轉檔後再用圖片壓縮工具縮小尺寸。',
    },
    {
      q: 'HEIC 轉 JPG 會損失畫質嗎？',
      a: 'JPG 是有損格式，品質設在 90 以上時一般看不出差別。若完全不想損失畫質可選 PNG，但檔案會大很多。',
    },
    {
      q: '怎麼讓 iPhone 以後直接拍 JPG？',
      a: '到「設定」>「相機」>「格式」選擇「最相容」，之後拍的照片就是 JPG。已經拍好的 HEIC 照片不會自動轉換。',
    },
    {
      q: '原況照片（Live Photo）可以轉嗎？',
      a: '可以，會轉出原況照片的靜態畫面。原況照片的動態部分是另外的 MOV 影片檔，不包含在 HEIC 裡。',
    },
    {
      q: '一次可以轉幾張？轉檔很慢正常嗎？',
      a: '沒有張數限制。在 Safari 上使用內建解碼速度很快；Chrome、Edge 需在網頁中解碼，一張 1200 萬畫素的照片約需數秒，請耐心等候，手機上建議每次 20 張以內。',
    },
  ],
  related: ['image-converter', 'image-compressor', 'image-resizer', 'id-watermark', 'image-to-pdf', 'image-crop'],
  priority: 88,
  updated: '2026-10-29',
});
