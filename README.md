# 證件照片浮水印

精簡自 [tatdt622989/tool.6yuwei.com](https://github.com/tatdt622989/tool.6yuwei.com)，2026-11-10 修改，授權 **AGPL-3.0-only**（保留原 LICENSE）。

- 單一功能：證件浮水印、遮蔽、JPG/PNG/AVIF 輸出、HEIC 載入、批次 ZIP
- 保留 localStorage 表單選項，但是不再於 pagehide 無條件重寫資料
- PNG：OxiPNG Wasm 無損壓縮等級 1–6
- AVIF：libavif/libaom Wasm 有損壓縮，品質 10–99、編碼速度 0（高壓縮努力，耗時）
- 不載入 Google Analytics、廣告，程式內無圖片上傳端點，網頁以 CSP 限制對外連線
- 建議先以假照片測試；原始碼檢查不能取代實際網路監控

## Development
```sh
npm install
npm test
npm run build
npm run dev
```

## GitHub Pages
在 Settings → Pages → Build and deployment → Source 選 **GitHub Actions**。推送 main 後，`.github/workflows/deploy-pages.yml` 自動編譯部署：

https://ivanagyro.github.io/id-watermark/

本專案的所有相對資產皆以 Astro 的 `base: '/id-watermark/'` 建置。

## Attribution
原作者：tatdt622989。完整對應原始碼、修改與 AGPL-3.0-only 授權條款均於本 repo 公開。
