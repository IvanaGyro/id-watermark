# 證件照片浮水印

在瀏覽器內為證件照片加上用途浮水印、遮蔽敏感資訊，再下載處理後的圖片。**照片在本機處理，不需上傳伺服器。**

**[線上使用](https://ivanagyro.github.io/id-watermark/)**

這是從 [tatdt622989/tool.6yuwei.com](https://github.com/tatdt622989/tool.6yuwei.com) 精簡而來的獨立工具，已移除原專案的其他線上工具。

## 功能

- **浮水印文字**：提供「申請用」、「影本用」範本，也能輸入自訂文字；可指定提交對象、用途與日期。
- **浮水印樣式**：滿版重複、中央大字或兩者並用；可調整文字大小、角度、間距、顏色、不透明度與描邊。
- **敏感資訊遮蔽**：拖曳框選區域，套用黑色方塊或馬賽克；各張照片的遮蔽範圍獨立，支援復原與清除。
- **多張處理**：可選取、拖曳或貼上圖片，一次最多 20 張；支援 JPG、PNG、WebP 與 HEIC/HEIF 等輸入格式（實際能否解碼取決於瀏覽器與解碼器）。
- **圖片輸出**：支援 JPG、PNG、AVIF，可保留原始尺寸或設定輸出長邊；支援單張下載、逐張下載與 ZIP 打包。

### 輸出格式

| 格式 | 選項 | 說明 |
| --- | --- | --- |
| JPG | 品質 10–100 | 有損壓縮，適合一般證件影本。 |
| PNG | 壓縮等級 1–6 | 使用 OxiPNG（WebAssembly）進行無損壓縮；等級越高，通常越耗時。 |
| AVIF | 品質 10–100、壓縮等級 0–10 | 使用 AVIF 編碼器（WebAssembly）；品質 100 啟用無損編碼，壓縮等級越高通常越耗時。 |

**注意：**「無損」是指重新繪製後的畫布像素在編碼時不再損失，不表示輸出檔與原始照片逐位元相同；若有縮小尺寸、遮蔽、浮水印或 HEIC 轉檔，內容已經改變。AVIF 高壓縮等級也可能需要較長的處理時間。

## 使用方式

1. 開啟[線上工具](https://ivanagyro.github.io/id-watermark/)，加入一張或多張照片。
2. 選擇浮水印範本，填寫用途、提交對象，並視需要調整日期與樣式。
3. 若有不希望外露的資訊，切換至黑色方塊或馬賽克，在照片預覽上拖曳選取。
4. 選擇輸出格式、品質／壓縮等級與尺寸，下載目前照片或全部照片。

**遮蔽建議：**若必須確實隱藏個人資料，請使用不透明的黑色方塊；馬賽克不適合用來保證資訊無法辨識。

## 隱私與資料保存

- 照片的讀取、遮蔽、浮水印和編碼都在瀏覽器內完成；程式沒有照片上傳功能，也未整合廣告或 Google Analytics。
- 頁面設定的 Content Security Policy 將網路連線限制為同源（`connect-src 'self'`）。
- 浮水印文字與選項保存在瀏覽器的 `localStorage`，方便下次使用；**照片本身及各張照片的遮蔽範圍不會保存**。
- 匯出時會重新繪製影像，不保留原始檔案的 EXIF 拍攝資訊及 GPS 位置。

對敏感證件仍建議先用測試圖片確認結果；原始碼與瀏覽器開發者工具的網路紀錄可用來自行查核資料處理行為。

## 開發

需要 Node.js 24（與 GitHub Actions 的建置環境一致）。

```sh
npm install
npm run dev
```

測試與建置：

```sh
npm test
npm run check
npm run build
npm run preview
```

專案使用 Astro、TypeScript、Vitest 與 Playwright；PNG、AVIF 編碼分別透過 `@jsquash/oxipng`、`@jsquash/avif`，HEIC/HEIF 透過 `heic-to` 處理。GitHub Actions 在推送至 `main` 後執行測試、建置與瀏覽器 smoke test，並透過 GitHub Pages 部署。

## 來源與授權

本專案改作自 [tatdt622989/tool.6yuwei.com](https://github.com/tatdt622989/tool.6yuwei.com)，感謝原作者的貢獻。

依照原專案授權，採用 [GNU Affero General Public License v3.0（AGPL-3.0-only）](LICENSE)。修改後的原始碼與授權條款均保留於本 repository。
